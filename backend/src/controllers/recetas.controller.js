const servicio = require("../services/recetas.service");

function validarId(id) {
  return /^\d+$/.test(String(id)) && Number(id) > 0;
}

function validarDatos(datos) {
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    return "El cuerpo de la solicitud debe ser un objeto JSON";
  }

  const { producto_id, insumo_id, cantidad } = datos;

  if (!Number.isInteger(producto_id) || producto_id <= 0) {
    return "producto_id debe ser un entero positivo";
  }

  if (!Number.isInteger(insumo_id) || insumo_id <= 0) {
    return "insumo_id debe ser un entero positivo";
  }

  if (
    typeof cantidad !== "number" ||
    !Number.isFinite(cantidad) ||
    cantidad <= 0
  ) {
    return "cantidad debe ser un numero mayor que cero";
  }

  return null;
}

function manejarError(error, res) {
  console.error("Error en recetas:", error.message);

  if (error.code === "23505") {
    return res.status(409).json({
      error: "Este insumo ya existe en la receta del producto",
    });
  }

  if (error.code === "23503") {
    return res.status(409).json({
      error: "El producto o el insumo indicado no existe",
    });
  }

  if (
    error.code === "23514" ||
    error.code === "22P02" ||
    error.code === "23502"
  ) {
    return res.status(400).json({
      error: "Los datos enviados no son validos",
    });
  }

  return res.status(500).json({
    error: "Error interno al procesar la receta",
  });
}

async function listar(req, res) {
  try {
    const recetas = await servicio.obtenerTodos();
    return res.status(200).json(recetas);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function obtener(req, res) {
  if (!validarId(req.params.id)) {
    return res.status(400).json({
      error: "El ID debe ser un entero positivo",
    });
  }

  try {
    const receta = await servicio.obtenerPorId(Number(req.params.id));

    if (!receta) {
      return res.status(404).json({
        error: "Receta no encontrada",
      });
    }

    return res.status(200).json(receta);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function listarPorProducto(req, res) {
  if (!validarId(req.params.productoId)) {
    return res.status(400).json({
      error: "El ID del producto debe ser un entero positivo",
    });
  }

  try {
    const recetas = await servicio.obtenerPorProducto(
      Number(req.params.productoId),
    );

    return res.status(200).json(recetas);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function crear(req, res) {
  const errorValidacion = validarDatos(req.body);

  if (errorValidacion) {
    return res.status(400).json({ error: errorValidacion });
  }

  try {
    const receta = await servicio.crear(req.body);
    return res.status(201).json(receta);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function actualizar(req, res) {
  if (!validarId(req.params.id)) {
    return res.status(400).json({
      error: "El ID debe ser un entero positivo",
    });
  }

  const errorValidacion = validarDatos(req.body);

  if (errorValidacion) {
    return res.status(400).json({ error: errorValidacion });
  }

  try {
    const receta = await servicio.actualizar(Number(req.params.id), req.body);

    if (!receta) {
      return res.status(404).json({
        error: "Receta no encontrada",
      });
    }

    return res.status(200).json(receta);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function eliminar(req, res) {
  if (!validarId(req.params.id)) {
    return res.status(400).json({
      error: "El ID debe ser un entero positivo",
    });
  }

  try {
    const eliminado = await servicio.eliminar(Number(req.params.id));

    if (!eliminado) {
      return res.status(404).json({
        error: "Receta no encontrada",
      });
    }

    return res.status(200).json({
      mensaje: "Receta eliminada correctamente",
    });
  } catch (error) {
    return manejarError(error, res);
  }
}

module.exports = {
  listar,
  obtener,
  listarPorProducto,
  crear,
  actualizar,
  eliminar,
};
