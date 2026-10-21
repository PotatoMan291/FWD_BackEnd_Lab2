const pool = require("../db");

async function obtenerTodos() {
  const resultado = await pool.query(`
        SELECT
            p.id,
            p.fecha,
            p.metodo_pago,
            p.subtotal,
            p.impuesto,
            p.total,
            p.estado,
            COALESCE(
                json_agg(
                    json_build_object(
                        'producto_id', pi.producto_id,
                        'producto', pr.nombre,
                        'cantidad', pi.cantidad,
                        'precio_unitario', pi.precio_unitario
                    )
                ) FILTER (WHERE pi.id IS NOT NULL),
                '[]'
            ) AS items
        FROM pedidos p
        LEFT JOIN pedido_items pi ON pi.pedido_id = p.id
        LEFT JOIN productos pr ON pr.id = pi.producto_id
        GROUP BY p.id
        ORDER BY p.fecha DESC
    `);

  return resultado.rows;
}

async function obtenerPorId(id) {
  const resultado = await pool.query(
    `
        SELECT
            p.id,
            p.fecha,
            p.metodo_pago,
            p.subtotal,
            p.impuesto,
            p.total,
            p.estado,
            COALESCE(
                json_agg(
                    json_build_object(
                        'producto_id', pi.producto_id,
                        'producto', pr.nombre,
                        'cantidad', pi.cantidad,
                        'precio_unitario', pi.precio_unitario
                    )
                ) FILTER (WHERE pi.id IS NOT NULL),
                '[]'
            ) AS items
        FROM pedidos p
        LEFT JOIN pedido_items pi ON pi.pedido_id = p.id
        LEFT JOIN productos pr ON pr.id = pi.producto_id
        WHERE p.id = $1
        GROUP BY p.id
    `,
    [id],
  );

  return resultado.rows[0] || null;
}

async function crear(datos) {
  const conexion = await pool.connect();

  try {
    await conexion.query("BEGIN");

    // Consultar productos y sus recetas desde la base de datos.
    const productosResultado = await conexion.query(
      `
            SELECT
                p.id,
                p.nombre,
                p.precio,
                p.activo,
                r.insumo_id,
                r.cantidad AS cantidad_receta
            FROM productos p
            LEFT JOIN recetas r ON r.producto_id = p.id
            WHERE p.id = ANY($1::integer[])
            ORDER BY p.id
        `,
      [datos.items.map((item) => item.producto_id)],
    );

    const productos = new Map();

    for (const fila of productosResultado.rows) {
      if (!productos.has(fila.id)) {
        productos.set(fila.id, {
          id: fila.id,
          nombre: fila.nombre,
          precio: Number(fila.precio),
          activo: fila.activo,
          receta: [],
        });
      }

      if (fila.insumo_id !== null) {
        productos.get(fila.id).receta.push({
          insumo_id: fila.insumo_id,
          cantidad: Number(fila.cantidad_receta),
        });
      }
    }

    // Verificar que existan todos los productos solicitados.
    for (const item of datos.items) {
      const producto = productos.get(item.producto_id);

      if (!producto) {
        const error = new Error(`El producto ${item.producto_id} no existe`);
        error.status = 404;
        throw error;
      }

      if (!producto.activo) {
        const error = new Error(`El producto ${producto.nombre} esta inactivo`);
        error.status = 409;
        throw error;
      }

      if (producto.receta.length === 0) {
        const error = new Error(
          `El producto ${producto.nombre} no tiene receta`,
        );
        error.status = 409;
        throw error;
      }
    }

    // Calcular los ingredientes requeridos por toda la venta.
    const necesidades = new Map();

    for (const item of datos.items) {
      const producto = productos.get(item.producto_id);

      for (const ingrediente of producto.receta) {
        const cantidadNecesaria = ingrediente.cantidad * item.cantidad;

        necesidades.set(
          ingrediente.insumo_id,
          (necesidades.get(ingrediente.insumo_id) || 0) + cantidadNecesaria,
        );
      }
    }

    const idsInsumos = [...necesidades.keys()].sort((a, b) => a - b);

    // Bloquear las filas del inventario para evitar ventas
    // simultaneas que gasten las mismas existencias.
    const inventarioResultado = await conexion.query(
      `
            SELECT id, nombre, stock
            FROM insumos
            WHERE id = ANY($1::integer[])
            ORDER BY id
            FOR UPDATE
        `,
      [idsInsumos],
    );

    const inventario = new Map(
      inventarioResultado.rows.map((insumo) => [
        insumo.id,
        {
          nombre: insumo.nombre,
          stock: Number(insumo.stock),
        },
      ]),
    );

    for (const [insumoId, cantidad] of necesidades) {
      const insumo = inventario.get(insumoId);

      if (!insumo || insumo.stock < cantidad) {
        const error = new Error(
          `Inventario insuficiente para el insumo: ${
            insumo ? insumo.nombre : insumoId
          }`,
        );
        error.status = 409;
        throw error;
      }
    }

    // Calcular los montos con los precios almacenados en PostgreSQL.
    const subtotal = datos.items.reduce((total, item) => {
      return total + productos.get(item.producto_id).precio * item.cantidad;
    }, 0);

    const subtotalFinal = Number(subtotal.toFixed(2));
    const impuesto = Number((subtotalFinal * 0.13).toFixed(2));
    const total = Number((subtotalFinal + impuesto).toFixed(2));

    const pedidoResultado = await conexion.query(
      `
            INSERT INTO pedidos
                (metodo_pago, subtotal, impuesto, total, estado)
            VALUES ($1, $2, $3, $4, 'confirmado')
            RETURNING id
        `,
      [datos.metodo_pago, subtotalFinal, impuesto, total],
    );

    const pedidoId = pedidoResultado.rows[0].id;

    // Guardar el precio histórico y los ingredientes de cada artículo.
    for (const item of datos.items) {
      const producto = productos.get(item.producto_id);

      const itemResultado = await conexion.query(
        `
                INSERT INTO pedido_items
                    (pedido_id, producto_id, cantidad, precio_unitario)
                VALUES ($1, $2, $3, $4)
                RETURNING id
            `,
        [pedidoId, producto.id, item.cantidad, producto.precio],
      );

      const pedidoItemId = itemResultado.rows[0].id;

      for (const ingrediente of producto.receta) {
        const cantidadTotal = ingrediente.cantidad * item.cantidad;

        await conexion.query(
          `
                    INSERT INTO pedido_item_insumos
                        (pedido_item_id, insumo_id, cantidad_total)
                    VALUES ($1, $2, $3)
                `,
          [pedidoItemId, ingrediente.insumo_id, cantidadTotal],
        );
      }
    }

    // Descontar los ingredientes después de validar el inventario.
    for (const [insumoId, cantidad] of necesidades) {
      await conexion.query(
        `
                UPDATE insumos
                SET stock = stock - $1
                WHERE id = $2
            `,
        [cantidad, insumoId],
      );
    }

    await conexion.query("COMMIT");

    return await obtenerPorId(pedidoId);
  } catch (error) {
    await conexion.query("ROLLBACK");
    throw error;
  } finally {
    conexion.release();
  }
}

async function anular(id) {
  const conexion = await pool.connect();

  try {
    await conexion.query("BEGIN");

    const pedidoResultado = await conexion.query(
      `
            SELECT id, fecha, estado
            FROM pedidos
            WHERE id = $1
            FOR UPDATE
        `,
      [id],
    );

    if (pedidoResultado.rowCount === 0) {
      const error = new Error("Pedido no encontrado");
      error.status = 404;
      throw error;
    }

    const pedido = pedidoResultado.rows[0];

    if (pedido.estado !== "confirmado") {
      const error = new Error("El pedido ya fue anulado");
      error.status = 409;
      throw error;
    }

    const tiempoResultado = await conexion.query(
      `
            SELECT NOW() <= $1::timestamp + INTERVAL '15 minutes'
                AS dentro_del_limite
        `,
      [pedido.fecha],
    );

    if (!tiempoResultado.rows[0].dentro_del_limite) {
      const error = new Error(
        "Solo se puede anular un pedido durante los primeros 15 minutos",
      );
      error.status = 409;
      throw error;
    }

    const consumosResultado = await conexion.query(
      `
            SELECT
                pis.insumo_id,
                SUM(pis.cantidad_total) AS cantidad_total
            FROM pedido_items pi
            INNER JOIN pedido_item_insumos pis
                ON pis.pedido_item_id = pi.id
            WHERE pi.pedido_id = $1
            GROUP BY pis.insumo_id
            ORDER BY pis.insumo_id
        `,
      [id],
    );

    for (const consumo of consumosResultado.rows) {
      await conexion.query(
        `
                UPDATE insumos
                SET stock = stock + $1
                WHERE id = $2
            `,
        [consumo.cantidad_total, consumo.insumo_id],
      );
    }

    await conexion.query(
      `
            UPDATE pedidos
            SET estado = 'anulado'
            WHERE id = $1
        `,
      [id],
    );

    await conexion.query("COMMIT");

    return await obtenerPorId(id);
  } catch (error) {
    await conexion.query("ROLLBACK");
    throw error;
  } finally {
    conexion.release();
  }
}

async function obtenerResumen() {
  const ventas = await pool.query(`
        SELECT
            metodo_pago,
            COUNT(*) AS cantidad_pedidos,
            COALESCE(SUM(total), 0) AS total_vendido
        FROM pedidos
        WHERE estado = 'confirmado'
          AND fecha >= CURRENT_DATE
          AND fecha < CURRENT_DATE + INTERVAL '1 day'
        GROUP BY metodo_pago
        ORDER BY metodo_pago
    `);

  const productos = await pool.query(`
        SELECT
            pr.id AS producto_id,
            pr.nombre AS producto,
            SUM(pi.cantidad) AS unidades_vendidas,
            SUM(pi.cantidad * pi.precio_unitario) AS subtotal_vendido
        FROM pedido_items pi
        INNER JOIN pedidos p ON p.id = pi.pedido_id
        INNER JOIN productos pr ON pr.id = pi.producto_id
        WHERE p.estado = 'confirmado'
          AND p.fecha >= CURRENT_DATE
          AND p.fecha < CURRENT_DATE + INTERVAL '1 day'
        GROUP BY pr.id, pr.nombre
        ORDER BY unidades_vendidas DESC, pr.nombre
        LIMIT 5
    `);

  return {
    fecha: new Date().toISOString().slice(0, 10),
    ventasPorMetodo: ventas.rows,
    productosMasVendidos: productos.rows,
  };
}

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  anular,
  obtenerResumen,
};
