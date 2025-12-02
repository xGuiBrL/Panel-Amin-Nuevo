import { useState, useEffect } from "react";
import { client } from "../api/graphqlClient";
import { GET_USUARIOS, EDITAR_USUARIO_ADMIN_MUTATION, GET_COMPROBADORES } from "../api/adminQueries";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiEdit2 } from "react-icons/fi";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usuarioIdsConComprobador, setUsuarioIdsConComprobador] = useState(new Set());
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: ""
  });
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    const fetchUsuarios = async () => {
      try {
        setLoading(true);
        setError("");
        const [uData, cData] = await Promise.all([
          client.request(GET_USUARIOS),
          client.request(GET_COMPROBADORES),
        ]);

        setUsuarios(uData.usuarios || []);

        const idsSet = new Set();
        (cData.comprobador || []).forEach(c => {
          if (c.usuarioId) idsSet.add(c.usuarioId);
        });
        setUsuarioIdsConComprobador(idsSet);
      } catch (err) {
        console.error("Error fetching usuarios:", err);
        if (err.response?.errors?.[0]?.extensions?.code === "AUTH_NOT_AUTHORIZED" || 
            err.response?.errors?.[0]?.message?.includes("authorized")) {
          setError("No tienes autorización para acceder a este recurso. Serás redirigido al login.");
          setTimeout(() => {
            localStorage.removeItem('token');
            navigate("/");
          }, 2000);
        } else {
          setError(err.response?.errors?.[0]?.message || err.message || "Error al cargar usuarios");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsuarios();
  }, [isAuthenticated, navigate]);

  const openEdit = (u) => {
    setEditing(u);
    setEditForm({
      nombre: u.nombre || "",
      apellido: u.apellido || "",
      correo: u.correo || "",
      telefono: u.telefono || ""
    });
  };

  const closeEdit = () => {
    setEditing(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;

    try {
      const vars = {
        usuarioId: editing.id,
        nombre: editForm.nombre || null,
        apellido: editForm.apellido || null,
        correo: editForm.correo || null,
        telefono: editForm.telefono || null
      };

      const res = await client.request(EDITAR_USUARIO_ADMIN_MUTATION, vars);
      const updated = res.editarUsuarioAdmin;

      setUsuarios(prev => prev.map(u => (u.id === updated.id ? { ...u, ...updated } : u)));
      setEditing(null);
    } catch (err) {
      console.error("Error editando usuario:", err);
      const msg = err?.response?.errors?.[0]?.message || err.message || String(err);
      setError(msg);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold text-orange-600 mb-4">Usuarios</h1>
        <div className="py-8">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-orange-600 mb-4">Usuarios</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">Usuarios</h1>

      {usuarios.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No hay usuarios disponibles</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
            <thead className="bg-orange-600 text-white">
              <tr>
                {["ID", "Nombre", "Correo", "Roles", "Teléfono", "Acciones"].map((t,i) => (
                  <th key={i} className="p-3 text-left">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => {
                const rolesArray = Array.isArray(u.roles)
                  ? u.roles
                  : (u.roles ? [u.roles] : []);

                const rolesFiltrados = rolesArray.filter(r =>
                  r === "comprobador"
                    ? usuarioIdsConComprobador.has(u.id)
                    : true
                );

                return (
                  <tr key={u.id} className="hover:bg-orange-50 transition-all duration-200 border-b">
                    <td className="p-3">{u.id}</td>
                    <td className="p-3 font-medium">{u.nombre} {u.apellido}</td>
                    <td className="p-3">{u.correo}</td>
                    <td className="p-3">{rolesFiltrados.join(", ")}</td>
                    <td className="p-3">{u.telefono}</td>
                    <td className="p-3">
                      <button
                        onClick={() => openEdit(u)}
                        className="inline-flex items-center justify-center text-blue-600 hover:text-blue-800"
                        title="Editar usuario"
                      >
                        <FiEdit2 />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-orange-600 mb-4">Editar Usuario</h2>
            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={editForm.nombre}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  value={editForm.apellido}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
                <input
                  type="email"
                  name="correo"
                  value={editForm.correo}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  value={editForm.telefono}
                  onChange={handleChange}
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
