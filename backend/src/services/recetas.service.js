const pool = require("../db");

async function obtenerTodos() {
  const resultado = await pool.query(`
        SELECT
            r.id,
            r.producto_id,
            p.nombre AS producto,
            r.insumo_id,
            i.nombre AS insumo,
            r.cantidad,
            i.unidad
        FROM recetas r
        INNER JOIN productos p ON p.id = r.producto_id
        INNER JOIN insumos i ON i.id = r.insumo_id
        ORDER BY r.producto_id, r.id
    `);

  return resultado.rows;
}

async function obtenerPorId(id) {
  const resultado = await pool.query(
    `
        SELECT
            r.id,
            r.producto_id,
            p.nombre AS producto,
            r.insumo_id,
            i.nombre AS insumo,
            r.cantidad,
            i.unidad
        FROM recetas r
        INNER JOIN productos p ON p.id = r.producto_id
        INNER JOIN insumos i ON i.id = r.insumo_id
        WHERE r.id = $1
    `,
    [id],
  );

  return resultado.rows[0] || null;
}

async function obtenerPorProducto(productoId) {
  const resultado = await pool.query(
    `
        SELECT
            r.id,
            r.producto_id,
            p.nombre AS producto,
            r.insumo_id,
            i.nombre AS insumo,
            r.cantidad,
            i.unidad
        FROM recetas r
        INNER JOIN productos p ON p.id = r.producto_id
        INNER JOIN insumos i ON i.id = r.insumo_id
        WHERE r.producto_id = $1
        ORDER BY r.id
    `,
    [productoId],
  );

  return resultado.rows;
}

async function crear(datos) {
  const { producto_id, insumo_id, cantidad } = datos;

  const resultado = await pool.query(
    `
        INSERT INTO recetas (producto_id, insumo_id, cantidad)
        VALUES ($1, $2, $3)
        RETURNING id, producto_id, insumo_id, cantidad
    `,
    [producto_id, insumo_id, cantidad],
  );

  return obtenerPorId(resultado.rows[0].id);
}

async function actualizar(id, datos) {
  const { producto_id, insumo_id, cantidad } = datos;

  const resultado = await pool.query(
    `
        UPDATE recetas
        SET producto_id = $1,
            insumo_id = $2,
            cantidad = $3
        WHERE id = $4
        RETURNING id
    `,
    [producto_id, insumo_id, cantidad, id],
  );

  if (resultado.rowCount === 0) {
    return null;
  }

  return obtenerPorId(resultado.rows[0].id);
}

async function eliminar(id) {
  const resultado = await pool.query(
    `
        DELETE FROM recetas
        WHERE id = $1
        RETURNING id
    `,
    [id],
  );

  return resultado.rowCount > 0;
}

module.exports = {
  obtenerTodos,
  obtenerPorId,
  obtenerPorProducto,
  crear,
  actualizar,
  eliminar,
};
