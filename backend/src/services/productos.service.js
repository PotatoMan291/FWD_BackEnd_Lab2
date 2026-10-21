const pool = require("../db");

async function obtenerTodos() {
  const resultado = await pool.query(`
        SELECT id, nombre, precio, categoria, activo
        FROM productos
        ORDER BY id
    `);

  return resultado.rows;
}

async function obtenerPorId(id) {
  const resultado = await pool.query(
    `SELECT id, nombre, precio, categoria, activo
         FROM productos
         WHERE id = $1`,
    [id],
  );

  const producto = resultado.rows[0];

  if (!producto) {
    return null;
  }

  const receta = await pool.query(
    `SELECT
            r.insumo_id,
            i.nombre AS insumo,
            r.cantidad,
            i.unidad
         FROM recetas r
         JOIN insumos i ON i.id = r.insumo_id
         WHERE r.producto_id = $1
         ORDER BY i.nombre`,
    [id],
  );

  return {
    ...producto,
    receta: receta.rows,
  };
}

async function crear(datos) {
  const { nombre, precio, categoria, activo } = datos;

  const resultado = await pool.query(
    `INSERT INTO productos (nombre, precio, categoria, activo)
         VALUES ($1, $2, $3, $4)
         RETURNING id, nombre, precio, categoria, activo`,
    [nombre, precio, categoria, activo],
  );

  return resultado.rows[0];
}

async function actualizar(id, datos) {
  const { nombre, precio, categoria, activo } = datos;

  const resultado = await pool.query(
    `UPDATE productos
         SET nombre = $1,
             precio = $2,
             categoria = $3,
             activo = $4
         WHERE id = $5
         RETURNING id, nombre, precio, categoria, activo`,
    [nombre, precio, categoria, activo, id],
  );

  return resultado.rows[0] || null;
}

async function eliminar(id) {
  const resultado = await pool.query(
    `DELETE FROM productos
         WHERE id = $1
         RETURNING id`,
    [id],
  );

  return resultado.rowCount > 0;
}

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
