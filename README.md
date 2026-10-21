# Cafetería — Punto de venta e inventario

## Descripción

Aplicación para gestionar una cafetería mediante una API REST desarrollada con Node.js y Express, conectada a PostgreSQL.

El sistema administra los insumos, los productos, sus recetas y los pedidos. Al registrar una venta, verifica las existencias, calcula el impuesto del 13 % y descuenta los ingredientes utilizados. También permite anular pedidos dentro de los primeros 15 minutos y consultar el resumen diario de caja.

## Tecnologías

- Node.js
- Express
- PostgreSQL
- `pg` para la conexión con la base de datos
- `dotenv` para las variables de entorno
- `cors` para permitir solicitudes desde el frontend
- Postman para probar la API

## Estructura del proyecto

```text
Laboratorio2_Cafeteria/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── db.js
│   │   └── server.js
│   ├── .env
│   ├── .gitignore
│   └── package.json
├── postman/
│   └── Cafeteria_API.postman_collection.json
├── schema.sql
├── README.md
└── BITACORA_IA.md
```

## Modelo de datos

Las entidades principales son:

- **insumos:** ingredientes y existencias disponibles.
- **productos:** productos que vende la cafetería.
- **recetas:** ingredientes y cantidades necesarias para preparar cada producto.
- **pedidos:** fecha, método de pago, subtotal, impuesto, total y estado de cada venta.
- **pedido_items:** productos, cantidades y precios históricos de cada pedido.
- **pedido_item_insumos:** cantidades exactas de ingredientes utilizadas por cada artículo vendido, para restaurarlas al anular un pedido.

Relaciones principales:

- Un producto puede tener varios insumos a través de sus recetas.
- Un pedido puede contener varios artículos.
- Cada artículo de pedido corresponde a un producto.
- Los artículos vendidos registran los ingredientes consumidos.

## Requisitos previos

- Node.js y npm instalados.
- PostgreSQL instalado y funcionando.
- Una base de datos llamada `cafeteria_db`.
- Postman para ejecutar las pruebas.

## Configuración de la base de datos

1. Crear la base de datos `cafeteria_db` desde pgAdmin o desde PostgreSQL.
2. Ejecutar `schema.sql` en esa base de datos.
3. Verificar que se hayan creado las tablas y cargado los datos de ejemplo.
4. Ejecutar también la sentencia de creación de `pedido_item_insumos` incluida en el desarrollo del proyecto, si todavía no forma parte de `schema.sql`.

## Configuración del backend

Abrir una terminal en la carpeta `backend/` e instalar las dependencias:

```bash
npm install
```

Crear un archivo `.env` dentro de `backend/`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cafeteria_db
DB_USER=postgres
DB_PASSWORD=TU_CONTRASENA_LOCAL
```

Sustituir `TU_CONTRASENA_LOCAL` por la contraseña configurada en PostgreSQL. No publicar este archivo ni compartir sus credenciales.

Iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

La API estará disponible en `http://localhost:3000`.

Comprobar la conexión:

```http
GET http://localhost:3000/api/health
```

## Endpoints de la API

### Insumos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/insumos` | Listar insumos |
| GET | `/api/insumos/:id` | Consultar un insumo |
| POST | `/api/insumos` | Crear un insumo |
| PUT | `/api/insumos/:id` | Actualizar un insumo |
| DELETE | `/api/insumos/:id` | Eliminar un insumo |

### Productos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/productos` | Listar productos |
| GET | `/api/productos/:id` | Consultar producto y receta |
| POST | `/api/productos` | Crear producto |
| PUT | `/api/productos/:id` | Actualizar producto |
| DELETE | `/api/productos/:id` | Eliminar producto |

### Recetas

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/recetas` | Listar recetas |
| GET | `/api/recetas/:id` | Consultar receta |
| GET | `/api/recetas/producto/:productoId` | Consultar receta por producto |
| POST | `/api/recetas` | Crear receta |
| PUT | `/api/recetas/:id` | Actualizar receta |
| DELETE | `/api/recetas/:id` | Eliminar receta |

### Pedidos y caja

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/pedidos` | Listar pedidos |
| GET | `/api/pedidos/:id` | Consultar pedido y artículos |
| POST | `/api/pedidos` | Registrar una venta |
| POST | `/api/pedidos/:id/anular` | Anular un pedido dentro del plazo permitido |
| GET | `/api/resumen` | Consultar métricas diarias de caja |

## Reglas de negocio

- Los métodos de pago permitidos son `efectivo`, `tarjeta` y `sinpe`.
- El subtotal se calcula a partir del precio de cada producto multiplicado por su cantidad.
- El impuesto se calcula al 13 % del subtotal.
- Los precios históricos se almacenan en los artículos del pedido.
- No se puede vender un producto inactivo o sin receta.
- Si no hay suficientes ingredientes, la API rechaza la venta con HTTP `409`.
- El registro del pedido, sus artículos, el consumo de ingredientes y la actualización del inventario se ejecutan en una transacción.
- Los errores durante la venta provocan un `ROLLBACK`.
- Los pedidos confirmados pueden anularse durante los primeros 15 minutos. Al anularlos se restauran las existencias consumidas.
- El resumen de caja incluye las ventas confirmadas del día agrupadas por método de pago y los cinco productos más vendidos.

## Códigos HTTP

- `200 OK`: consulta o actualización correcta.
- `201 Created`: recurso creado correctamente.
- `400 Bad Request`: datos inválidos.
- `404 Not Found`: recurso inexistente.
- `409 Conflict`: conflicto con una regla de negocio o restricción.
- `500 Internal Server Error`: error inesperado del servidor.

Los errores se responden en formato JSON:

```json
{
  "error": "Mensaje descriptivo del error"
}
```

## Pruebas

La API se prueba mediante Postman. Las pruebas incluyen:

- Consultas y operaciones CRUD.
- Creación de ventas y cálculo del impuesto.
- Descuento de ingredientes.
- Rechazo de ventas sin existencias suficientes.
- Rechazo de datos inválidos.
- Consulta y anulación de pedidos.
- Restauración del inventario.
- Resumen diario de caja.
- Respuestas HTTP `400`, `404` y `409`.

La colección de Postman se encuentra en `postman/Cafeteria_API.postman_collection.json`.

## Estado del proyecto

**Día 1:** backend, base de datos, reglas de negocio y pruebas de API.

**Día 2:** desarrollo del frontend con React, integración de la API, panel de métricas e integración del agente de IA mediante n8n.
