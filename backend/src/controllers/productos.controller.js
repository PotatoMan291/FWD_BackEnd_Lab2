const servicio = require("../services/productos.service");

function validarId(id) {
  return /^\d+$/.test(id) && Number(id) > 0;
}

function validarDatos(datos) {
  const { nombre, precio, categoria, activo } = datos;

  if (
    typeof nombre !== "string" ||
    !nombre.trim() ||
    nombre.trim().length > 100
  ) {
    return "El nombre es obligatorio y debe tener maximo 100 caracteres";
  }

  if (
    precio === undefined ||
    precio === null ||
    precio === "" ||
    !Number.isFinite(Number(precio)) ||
    Number(precio) <= 0
  ) {
    return "El precio debe ser un numero mayor que cero";
  }

  if (
    typeof categoria !== "string" ||
    !categoria.trim() ||
    categoria.trim().length > 50
  ) {
    return "La categoria es obligatoria y debe tener maximo 50 caracteres";
  }

  if (typeof activo !== "boolean") {
    return "El campo activo debe ser true o false";
  }

  return null;
}

function manejarError(res, error) {
  console.error(error);

  if (error.code === "23505") {
    return res.status(409).json({
      error: "Ya existe un producto con ese nombre",
    });
  }

  if (error.code === "23503") {
    return res.status(409).json({
      error:
        "No se puede eliminar el producto porque tiene registros relacionados",
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
    const productos = await servicio.obtenerTodos();
    return res.status(200).json(productos);
  } catch (error) {
    return manejarError(res, error);
  }
}

async function obtener(req, res) {
  if (!validarId(req.params.id)) {
    return res.status(400).json({ error: "ID invalido" });
  }

  try {
    const producto = await servicio.obtenerPorId(req.params.id);

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    return res.status(200).json(producto);
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
    const producto = await servicio.crear({
      nombre: req.body.nombre.trim(),
      precio: Number(req.body.precio),
      categoria: req.body.categoria.trim(),
      activo: req.body.activo,
    });

    return res.status(201).json(producto);
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
    const producto = await servicio.actualizar(req.params.id, {
      nombre: req.body.nombre.trim(),
      precio: Number(req.body.precio),
      categoria: req.body.categoria.trim(),
      activo: req.body.activo,
    });

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    return res.status(200).json(producto);
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
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    return res.status(200).json({
      mensaje: "Producto eliminado correctamente",
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
