# Café Central — Sistema de ventas e inventario

## 1. Descripción

Aplicación web para administrar productos, insumos, recetas, pedidos e inventario de Café Central. Incluye un agente de inteligencia artificial implementado con n8n que analiza el inventario y las ventas semanales para sugerir compras justificadas.

## 2. Tecnologías

- Frontend: React y Vite.
- Backend: Node.js y Express.
- Base de datos: PostgreSQL.
- Automatización y agente de IA: n8n.
- Comunicación frontend-backend: API REST.
- Control de versiones: Git y GitHub.

## 3. Requisitos previos

- Node.js y npm.
- PostgreSQL.
- Una instancia de n8n.
- Credenciales para un modelo de IA compatible con el nodo AI Agent.

## 4. Instalación y ejecución

### Base de datos

1. Crear la base de datos `cafeteria_db`.
2. Ejecutar `schema.sql` para crear las tablas y cargar los datos de ejemplo.
3. Configurar las credenciales de PostgreSQL en el archivo `.env` del backend.

### Backend

1. Entrar en la carpeta `backend/`.
2. Instalar dependencias con `npm install`.
3. Configurar las variables de entorno.
4. Iniciar el servidor con el comando definido en `package.json`.

### Frontend

1. Entrar en la carpeta `frontend/`.
2. Instalar dependencias con `npm install`.
3. Configurar la URL de la API y la URL del webhook de n8n en `.env.local`.
4. Iniciar Vite con el script definido en `package.json`.

### n8n

1. Importar el workflow exportado.
2. Configurar las credenciales del modelo de IA.
3. Verificar las URL de la API del backend en los nodos HTTP Request.
4. Ejecutar las pruebas y activar el workflow.

## 5. Módulos

- Dashboard y resumen de ventas.
- Administración de productos.
- Administración de insumos.
- Administración de recetas.
- Registro y consulta de pedidos.
- Recomendaciones de compra generadas con IA.

## 6. Reglas de negocio

- Los pedidos calculan el total incluyendo el 13 % de impuesto.
- La disponibilidad de un producto depende de la existencia de sus insumos.
- La confirmación de pedidos descuenta inventario mediante transacciones.
- Las operaciones sin stock suficiente deben devolver HTTP 409.
- La anulación dentro del plazo establecido restaura el inventario.
- El resumen diario agrupa las ventas por método de pago y muestra los productos más vendidos.
- El agente de IA analiza insumos críticos y ventas semanales para recomendar compras.

## 7. API REST

Documentar las rutas implementadas para salud, insumos, productos, recetas, pedidos y resumen, indicando método HTTP, parámetros, respuestas y errores posibles.

## 8. Agente de IA

El frontend llama a un webhook de n8n. El workflow consulta la API, prepara los datos, utiliza un AI Agent y devuelve una recomendación de compra.

## 9. Pruebas

Registrar las pruebas realizadas en Postman o Thunder Client, incluyendo operaciones exitosas y errores HTTP 400, 404 y 409.

## 10. Estructura del proyecto

- `backend/`: API Express.
- `frontend/`: aplicación React.
- `schema.sql`: estructura y datos de la base de datos.
- `docs/`: workflow exportado y evidencias, si se utiliza esta carpeta.
- `BITACORA_IA.md`: registro del uso de inteligencia artificial.