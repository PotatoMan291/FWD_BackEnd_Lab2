require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const insumosRoutes = require("./routes/insumos.routes");
const productosRoutes = require("./routes/productos.routes");
const recetasRoutes = require('./routes/recetas.routes');
const pedidosRoutes = require('./routes/pedidos.routes');
const pedidosController = require('./controllers/pedidos.controller');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/recetas', recetasRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.get('/api/resumen', pedidosController.resumen);

// Comprobar la conexion con PostgreSQL
app.get("/api/health", async (req, res) => {
  try {
    const resultado = await pool.query(`
            SELECT
                current_database() AS base_datos,
                NOW() AS fecha_servidor
        `);

    res.status(200).json({
      ok: true,
      mensaje: "API conectada correctamente con PostgreSQL",
      baseDatos: resultado.rows[0].base_datos,
      fechaServidor: resultado.rows[0].fecha_servidor,
    });
  } catch (error) {
    console.error("Error de conexion:", error.message);

    res.status(500).json({
      error: "No se pudo conectar con la base de datos",
    });
  }
});

// Registrar las rutas
app.use("/api/insumos", insumosRoutes);
app.use("/api/productos", productosRoutes);

// Ruta para endpoints inexistentes
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint no encontrado",
  });
});

// Manejo general de errores inesperados de Express
app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    error: "Error interno del servidor",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});
