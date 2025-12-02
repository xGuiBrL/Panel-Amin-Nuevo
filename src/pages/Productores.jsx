import { useEffect, useState } from "react";
import { client } from "../api/graphqlClient";
import { 
  GET_PRODUCTORES,
  GET_USUARIOS
} from "../api/adminQueries";

export default function Productores() {
  const [productores, setProductores] = useState([]);
  const [usuariosMap, setUsuariosMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        
        const productoresData = await client.request(GET_PRODUCTORES);
        const usuariosData = await client.request(GET_USUARIOS);

        const map = {};
        (usuariosData.usuarios || []).forEach(u => {
          map[u.id] = u;
        });

        setProductores(productoresData.productores || []);
        setUsuariosMap(map);
        
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold text-orange-600 mb-4">Productores</h1>
        <div className="py-8">Cargando productores...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-orange-600">Productores</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {productores.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <p className="text-gray-500 text-lg">No hay productores registrados</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-xl">
          <table className="w-full">
            <thead className="bg-orange-600 text-white">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Usuario</th>
                <th className="p-4 text-left">Dirección</th>
                <th className="p-4 text-left">NIT</th>
                <th className="p-4 text-left">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {productores.map((p) => (
                <tr key={p.id} className="hover:bg-orange-50 transition-colors duration-150 border-b">
                  <td className="p-4 font-mono text-sm">{p.id}</td>
                  <td className="p-4">
                    <div className="font-medium">{p.nombreUsuario}</div>
                    <div className="text-xs text-gray-500">ID usuario: {p.idUsuario || p.usuarioId}</div>
                  </td>
                  <td className="p-4">{p.direccion || "-"}</td>
                  <td className="p-4">{p.nit || "-"}</td>
                  <td className="p-4">
                    {(() => {
                      const usuario = usuariosMap[p.idUsuario || p.usuarioId];
                      return usuario?.telefono || "-";
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
