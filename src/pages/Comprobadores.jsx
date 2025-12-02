import { useEffect, useState } from "react";
import { client } from "../api/graphqlClient";
import { 
  GET_COMPROBADORES,
  ELIMINAR_COMPROBADOR_ADMIN_MUTATION,
  EDITAR_COMPROBADOR_ADMIN_MUTATION
} from "../api/adminQueries";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

export default function Comprobadores() {
  const [comprobadores, setComprobadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    nombreUsuario: "",
    ci: "",
    cuposDisponibles: 0,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const d = await client.request(GET_COMPROBADORES);
        console.debug("GET_COMPROBADORES response:", d);
        setComprobadores(d?.comprobador || []);
        if (!d?.comprobador || d.comprobador.length === 0) {
          setError("No hay comprobadores registrados (respuesta vacía del servidor).");
        }
      } catch (e) {
        console.error("Error cargando comprobadores:", e);
        const serverMessage = e?.response?.errors?.[0]?.message || e.message || String(e);
        setError(serverMessage);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openEdit = (c) => {
    setEditing(c);
    setEditForm({
      nombreUsuario: c.nombreUsuario || "",
      ci: c.ci || "",
      cuposDisponibles: c.cuposDisponibles ?? 0,
    });
  };

  const closeEdit = () => {
    setEditing(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === "cuposDisponibles" ? Number(value) : value,
    }));
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    try {
      setLoading(true);
      await client.request(EDITAR_COMPROBADOR_ADMIN_MUTATION, {
        comprobadorId: editing.id,
        nombreUsuario: editForm.nombreUsuario || null,
        ci: editForm.ci || null,
        cuposDisponibles: editForm.cuposDisponibles,
      });

      setComprobadores(prev => prev.map(c =>
        c.id === editing.id
          ? { 
              ...c,
              nombreUsuario: editForm.nombreUsuario,
              ci: editForm.ci,
              cuposDisponibles: editForm.cuposDisponibles,
              estaDisponible: editForm.cuposDisponibles > 0,
            }
          : c
      ));
      setEditing(null);
    } catch (e) {
      console.error("Error editando comprobador:", e);
      const msg = e?.response?.errors?.[0]?.message || e.message || String(e);
      setError(`Error al editar comprobador: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este comprobador?")) return;
    try {
      setLoading(true);
      await client.request(ELIMINAR_COMPROBADOR_ADMIN_MUTATION, { comprobadorId: id });
      setComprobadores(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error("Error eliminando comprobador:", e);
      const msg = e?.response?.errors?.[0]?.message || e.message || String(e);
      setError(`Error al eliminar comprobador: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">
        Comprobadores
      </h1>
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={() => {
            setComprobadores([]);
            setError("");
            setLoading(true);
            client.request(GET_COMPROBADORES).then((d) => {
              console.debug("refresh comprobadores:", d);
              setComprobadores(d?.comprobador || []);
              setLoading(false);
            }).catch((e) => {
              console.error(e);
              setError(e?.response?.errors?.[0]?.message || e.message || String(e));
              setLoading(false);
            });
          }}
          className="bg-orange-500 text-white px-3 py-2 rounded"
        >
          Refrescar
        </button>
        {loading && <span className="text-sm text-gray-600">Cargando comprobadores...</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <thead className="bg-orange-600 text-white">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Usuario</th>
              <th className="p-3 text-left">CI</th>
              <th className="p-3 text-left">Cupos</th>
              <th className="p-3 text-left">Disponible</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {comprobadores.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-orange-50 transition-all duration-200 border-b"
              >
                <td className="p-3">{c.id}</td>
                <td className="p-3 font-medium">{c.nombreUsuario}</td>
                <td className="p-3">{c.ci}</td>
                <td className="p-3">{c.cuposDisponibles}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-semibold ${
                      c.estaDisponible
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {c.estaDisponible ? "Sí" : "No"}
                  </span>
                </td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => openEdit(c)}
                    className="inline-flex items-center justify-center text-blue-600 hover:text-blue-800 text-sm"
                    title="Editar comprobador"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="inline-flex items-center justify-center text-red-600 hover:text-red-800 text-sm ml-1"
                    title="Eliminar comprobador"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-orange-600 mb-4">Editar Comprobador</h2>
            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de usuario</label>
                <input
                  type="text"
                  name="nombreUsuario"
                  value={editForm.nombreUsuario}
                  onChange={handleEditChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CI</label>
                <input
                  type="text"
                  name="ci"
                  value={editForm.ci}
                  onChange={handleEditChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cupos disponibles</label>
                <input
                  type="number"
                  name="cuposDisponibles"
                  min="0"
                  max="10"
                  value={editForm.cuposDisponibles}
                  onChange={handleEditChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
