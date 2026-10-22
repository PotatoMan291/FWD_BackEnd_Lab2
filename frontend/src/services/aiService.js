const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_RECOMMENDATIONS_WEBHOOK_URL;

export async function obtenerRecomendacionCompras() {
  if (!N8N_WEBHOOK_URL) {
    throw new Error("Falta configurar la URL del webhook de n8n.");
  }

  const response = await fetch(N8N_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  let resultado;

  try {
    resultado = await response.json();
  } catch {
    throw new Error("n8n devolvió una respuesta inválida.");
  }

  if (!response.ok || resultado.ok !== true) {
  console.error("Error devuelto por n8n:", {
    status: response.status,
    resultado,
  });

  throw new Error(
    resultado.error ||
    `Error al generar la recomendación. HTTP ${response.status}`
  );
}

  return resultado.data;
}
