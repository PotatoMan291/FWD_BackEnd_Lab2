const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type");
  const result = contentType?.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const mensaje =
      result?.error || result?.message || `Error HTTP ${response.status}`;

    const error = new Error(mensaje);
    error.status = response.status;
    error.details = result?.details ?? null;

    throw error;
  }

  return result;
}

export const getProductos = () => apiRequest("/productos");
export const getProducto = (id) => apiRequest(`/productos/${id}`);
export const getInsumos = () => apiRequest("/insumos");
export const getInsumo = (id) => apiRequest(`/insumos/${id}`);
export const getPedidos = () => apiRequest("/pedidos");
export const getPedido = (id) => apiRequest(`/pedidos/${id}`);
export const getRecetas = () => apiRequest("/recetas");
export const getReceta = (id) => apiRequest(`/recetas/${id}`);
export const getResumen = () => apiRequest("/resumen");

export const crearProducto = (datos) =>
  apiRequest("/productos", {
    method: "POST",
    body: JSON.stringify(datos),
  });

export const crearPedido = (datos) =>
  apiRequest("/pedidos", {
    method: "POST",
    body: JSON.stringify(datos),
  });

export const crearReceta = (datos) =>
  apiRequest("/recetas", {
    method: "POST",
    body: JSON.stringify(datos),
  });

export const actualizarProducto = (id, datos) =>
  apiRequest(`/productos/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });

export const eliminarProducto = (id) =>
  apiRequest(`/productos/${id}`, { method: "DELETE" });

export const crearInsumo = (datos) =>
  apiRequest("/insumos", {
    method: "POST",
    body: JSON.stringify(datos),
  });

export const actualizarInsumo = (id, datos) =>
  apiRequest(`/insumos/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });

export const eliminarInsumo = (id) =>
  apiRequest(`/insumos/${id}`, { method: "DELETE" });

export const anularPedido = (id) =>
  apiRequest(`/pedidos/${id}/anular`, { method: "POST" });

export const actualizarReceta = (id, datos) =>
  apiRequest(`/recetas/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });

export const eliminarReceta = (id) =>
  apiRequest(`/recetas/${id}`, {
    method: "DELETE",
  });
