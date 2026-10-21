const servicio = require("../services/insumos.service");

const UNIDADES_VALIDAS = ["g", "ml", "unidad"];

function validarId(id) {
  return /^\d+$/.test(id) && Number(id) > 0;
}

function validarDatos(datos) {
  const { nombre, unidad, stock, stock_minimo } = datos;

  if (
    typeof nombre !== "string" ||
    !nombre.trim() ||
    nombre.trim().length > 100
  ) {
    return "El nombre es obligatorio y debe tener maximo 100 caracteres";
  }

  if (!UNIDADES_VALIDAS.includes(unidad)) {
    return "La unidad debe ser g, ml o unidad";
  }

  if (
    stock === undefined ||
    stock === null ||
    stock === "" ||
    !Number.isFinite(Number(stock)) ||
    Number(stock) < 0
  ) {
    return "El stock debe ser un numero mayor o igual a cero";
  }

  if (
    stock_minimo === undefined ||
    stock_minimo === null ||
    stock_minimo === "" ||
    !Number.isFinite(Number(stock_minimo)) ||
    Number(stock_minimo) < 0
  ) {
    return "El stock minimo debe ser un numero mayor o igual a cero";
  }

  return null;
}

function manejarError(res, error) {
  console.error(error);

  if (error.code === "23505") {
    return res.status(409).json({
      error: "Ya existe un insumo con ese nombre",
    });
  }

  if (error.code === "23503") {
    return res.status(409).json({
      error:
        "No se puede eliminar el insumo porque esta siendo utilizado en una receta",
    });
  }

  if (error.code === "23514" || error.code === "22P02") {
    return res.status(400).json({
      error: "Los datos enviados no son validos",
    });
  }

  return res.status(500).json({
    error: "Error interno del servidor",
  });
}

async function listar(req, res) {
  try {
    const insumos = await servicio.obtenerTodos();
    return res.status(200).json(insumos);
  } catch (error) {
    return manejarError(res, error);
  }
}

async function obtener(req, res) {
  if (!validarId(req.params.id)) {
    return res.status(400).json({ error: "ID invalido" });
  }

  try {
    const insumo = await servicio.obtenerPorId(req.params.id);

    if (!insumo) {
      return res.status(404).json({ error: "Insumo no encontrado" });
    }

    return res.status(200).json(insumo);
  } catch (error) {
    return manejarError(res, error);
  }
}

async function crear(req, res) {
  const errorValidacion = validarDatos(req.body);

  if (errorValidacion) {
    return res.status(400).json({ error: errorValidacion });
  }

  try {
    const insumo = await servicio.crear({
      nombre: req.body.nombre.trim(),
      unidad: req.body.unidad,
      stock: Number(req.body.stock),
      stock_minimo: Number(req.body.stock_minimo),
    });

    return res.status(201).json(insumo);
  } catch (error) {
    return manejarError(res, error);
  }
}

async function actualizar(req, res) {
  if (!validarId(req.params.id)) {
    return res.status(400).json({ error: "ID invalido" });
  }

  const errorValidacion = validarDatos(req.body);

  if (errorValidacion) {
    return res.status(400).json({ error: errorValidacion });
  }

  try {
    const insumo = await servicio.actualizar(req.params.id, {
      nombre: req.body.nombre.trim(),
      unidad: req.body.unidad,
      stock: Number(req.body.stock),
      stock_minimo: Number(req.body.stock_minimo),
    });

    if (!insumo) {
      return res.status(404).json({ error: "Insumo no encontrado" });
    }

    return res.status(200).json(insumo);
  } catch (error) {
    return manejarError(res, error);
  }
}

async function eliminar(req, res) {
  if (!validarId(req.params.id)) {
    return res.status(400).json({ error: "ID invalido" });
  }

  try {
    const eliminado = await servicio.eliminar(req.params.id);

    if (!eliminado) {
      return res.status(404).json({ error: "Insumo no encontrado" });
    }

    return res.status(200).json({
      mensaje: "Insumo eliminado correctamente",
    });
  } catch (error) {
    return manejarError(res, error);
  }
}

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
};
