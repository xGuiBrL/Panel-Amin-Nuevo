import { GraphQLClient } from "graphql-request";

// ===============================
// CONFIGURACIÓN DEL ENDPOINT
// ===============================

// URL desde tu archivo .env
// EJEMPLO EN .env:
// REACT_APP_API_URL=https://3c004bf2d4d8.ngrok-free.app/graphql

const endpoint = process.env.REACT_APP_API_URL;

if (!endpoint) {
  console.error("❌ ERROR: REACT_APP_API_URL no está definido en el archivo .env");
  throw new Error("REACT_APP_API_URL no configurado");
}

// ===============================
// CREACIÓN DEL CLIENTE BASE
// ===============================

function createClient(url) {
  return new GraphQLClient(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

const baseClient = createClient(endpoint);

// ===============================
// EXPORTACIÓN DEL CLIENTE FINAL
// ===============================

export const client = {
  request: async (query, variables) => {
    // Obtener token en cada request
    const token = localStorage.getItem("token");
    const headers = token ? { authorization: `Bearer ${token}` } : {};

    // Aplicar headers dinámicos
    baseClient.setHeaders(headers);

    try {
      return await baseClient.request(query, variables);
    } catch (err) {
      // Mejora mensaje si hay un fallo de red
      const msg = err?.message || String(err);
      if (/Failed to fetch|NetworkError|CORS/i.test(msg)) {
        console.warn("⚠️ Error de red o CORS detectado:", err);
      }
      throw err;
    }
  },

  // Método para headers personalizados
  setHeaders: (headers) => baseClient.setHeaders(headers),
};