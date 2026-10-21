const pool = require("../db");

async function obtenerTodos() {
  const resultado = await pool.query(`
        SELECT id, nombre, unidad, stock, stock_minimo
        FROM insumos
        ORDER BY id
    `);

  return resultado.rows;
}

async function obtenerPorId(id) {
  const resultado = await pool.query(
    `SELECT id, nombre, unidad, stock, stock_minimo
         FROM insumos
         WHERE id = $1`,
    [id],
  );

  return resultado.rows[0] || null;
}

async function crear(datos) {
  const { nombre, unidad, stock, stock_minimo } = datos;

  const resultado = await pool.query(
    `INSERT INTO insumos (nombre, unidad, stock, stock_minimo)
         VALUES ($1, $2, $3, $4)
         RETURNING id, nombre, unidad, stock, stock_minimo`,
    [nombre, unidad, stock, stock_minimo],
  );

  return resultado.rows[0];
}

async function actualizar(id, datos) {
  const { nombre, unidad, stock, stock_minimo } = datos;

  const resultado = await pool.query(
    `UPDATE insumos
         SET nombre = $1,
             unidad = $2,
             stock = $3,
             stock_minimo = $4
         WHERE id = $5
         RETURNING id, nombre, unidad, stock, stock_minimo`,
    [nombre, unidad, stock, stock_minimo, id],
  );

  return resultado.rows[0] || null;
}

async function eliminar(id) {
  const resultado = await pool.query(
    `DELETE FROM insumos
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
