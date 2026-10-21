# Bitácora de uso de IA — Cafetería

## Objetivo

Registrar cómo se utilizó la inteligencia artificial como apoyo durante el desarrollo del backend del sistema de punto de venta e inventario de una cafetería.

## Prompt 1 — Diseño de la base de datos

**Prompt utilizado**

> Actúa como asistente de desarrollo backend. Diseña un esquema SQL para un sistema de cafetería que administre insumos, productos, recetas, pedidos y artículos de pedido. Incluye claves primarias, claves foráneas, restricciones NOT NULL y CHECK, y datos de ejemplo.

**Resultado obtenido**

Se propuso un esquema relacional con cinco tablas principales: `insumos`, `productos`, `recetas`, `pedidos` y `pedido_items`. También se definieron las relaciones entre productos, ingredientes y pedidos, junto con datos iniciales para probar el sistema.

**Verificación y ajustes**

El esquema se ejecutó en PostgreSQL mediante pgAdmin. Se comprobó que las tablas, las relaciones y los datos de ejemplo estuvieran disponibles. Se mantuvo PostgreSQL como base de datos del proyecto.

## Prompt 2 — Conexión de Express con PostgreSQL

**Prompt utilizado**

> Ayúdame a configurar una API con Node.js y Express que se conecte a PostgreSQL utilizando el paquete pg, variables de entorno con dotenv y una ruta GET /api/health que permita comprobar la conexión.

**Resultado obtenido**

Se preparó la conexión mediante un pool de PostgreSQL, la configuración con variables de entorno y una ruta de diagnóstico para verificar la conexión entre Express y la base de datos.

**Verificación y ajustes**

Se instaló el entorno del backend, se configuró `.env` y se ejecutó el servidor. La ruta `/api/health` respondió correctamente, confirmando la conexión con la base de datos.

## Prompt 3 — CRUD de insumos y productos

**Prompt utilizado**

> Genera los servicios, controladores y rutas REST para administrar insumos y productos con Express y PostgreSQL. Utiliza consultas parametrizadas y valida los datos en el servidor. Devuelve los códigos HTTP adecuados, incluidos 400, 404 y 409.

**Resultado obtenido**

Se implementaron operaciones GET, GET por ID, POST, PUT y DELETE para ambos recursos. Las consultas se separaron por capas en servicios, controladores y rutas.

**Verificación y ajustes**

Se probaron los endpoints con Postman. Se comprobaron las respuestas de éxito, la validación de datos, los recursos inexistentes y los conflictos con las restricciones de la base de datos. Las pruebas realizadas pasaron correctamente.

## Prompt 4 — CRUD de recetas

**Prompt utilizado**

> Implementa un CRUD de recetas para relacionar productos con insumos. Incluye consultas que muestren los nombres de los productos e ingredientes, valida cantidades positivas y maneja los conflictos por claves foráneas y relaciones duplicadas.

**Resultado obtenido**

Se crearon servicios, controladores y rutas para consultar recetas, consultar recetas por producto, crear, actualizar y eliminar relaciones entre productos e insumos.

**Verificación y ajustes**

Se probaron los endpoints de recetas con Postman. Se verificaron la creación, actualización, eliminación y validación de cantidades y relaciones duplicadas. Las pruebas realizadas pasaron correctamente.

## Prompt 5 — Ventas, transacciones e inventario

**Prompt utilizado**

> Implementa el registro de pedidos de una cafetería con Express y PostgreSQL. El servidor debe obtener los precios desde la base de datos, calcular el impuesto del 13 %, validar la receta y las existencias, guardar el pedido y sus artículos y descontar los ingredientes dentro de una transacción BEGIN/COMMIT/ROLLBACK. También debe permitir anular un pedido durante los primeros 15 minutos y restaurar los ingredientes.

**Resultado obtenido**

Se desarrolló un servicio de pedidos que valida los productos y el inventario, calcula los importes, guarda los artículos con sus precios históricos y actualiza las existencias dentro de una transacción. También se implementó la anulación de pedidos y la devolución de los ingredientes registrados como consumidos.

**Verificación y ajustes**

Se probaron ventas válidas, solicitudes inválidas, falta de existencias, consulta de pedidos y anulación. Se comprobó que el inventario se descontara al vender y se restaurara al anular. Las pruebas realizadas pasaron correctamente.

## Prompt 6 — Resumen de caja

**Prompt utilizado**

> Crea un endpoint GET /api/resumen para una cafetería que calcule mediante SQL las ventas confirmadas del día por método de pago y los cinco productos más vendidos. Excluye pedidos anulados y utiliza funciones de agregación y agrupación.

**Resultado obtenido**

Se implementó una consulta de ventas agrupadas por método de pago y otra para obtener los cinco productos con más unidades vendidas.

**Verificación y ajustes**

Se probó el endpoint con Postman después de registrar y anular pedidos. Se verificó que la respuesta incluyera las métricas y que los pedidos anulados no se contaran como ventas confirmadas.

## Reflexión final

La IA se utilizó como apoyo para diseñar el esquema de datos, organizar el backend por capas, generar operaciones CRUD y desarrollar las reglas de negocio. Las propuestas se integraron de forma progresiva y se verificaron mediante PostgreSQL y Postman.

El uso de la IA no sustituyó las pruebas: cada parte se ejecutó y validó antes de continuar con la siguiente etapa.
