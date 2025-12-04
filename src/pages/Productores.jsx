import { useEffect, useState } from "react";
import { client } from "../api/graphqlClient";
import {
  GET_PRODUCTORES,
  GET_USUARIOS,
  EDITAR_PRODUCTOR_ADMIN_MUTATION,
  ELIMINAR_PRODUCTOR_ADMIN_MUTATION
} from "../api/adminQueries";
import { createPortal } from "react-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

export default function Productores() {
  const [productores, setProductores] = useState([]);
  const [usuariosMap, setUsuariosMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    nombreUsuario: "",
    direccion: "",
    nit: "",
    numeroCuenta: "",
    banco: ""
  });

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

  const handleEdit = (productor) => {
    setEditing(productor);
    setEditForm({
      nombreUsuario: productor.nombreUsuario || "",
      direccion: productor.direccion || "",
      nit: productor.nit || "",
      numeroCuenta: productor.numeroCuenta || "",
      banco: productor.banco || ""
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const deleteProductor = async (productor) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al productor "${productor.nombreUsuario}"?`)) return;

    try {
      await client.request(ELIMINAR_PRODUCTOR_ADMIN_MUTATION, { productorId: productor.id });
      setProductores(prev => prev.filter(p => p.id !== productor.id));
      alert("Productor eliminado correctamente");
    } catch (err) {
      console.error("Error eliminando productor:", err);
      const msg = err?.response?.errors?.[0]?.message || err.message || String(err);
      alert(`Error: ${msg}`);
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;

    try {
      const vars = {
        productorId: editing.id,
        nombreUsuario: editForm.nombreUsuario || null,
        direccion: editForm.direccion || null,
        nit: editForm.nit || null,
        numeroCuenta: editForm.numeroCuenta || null,
        banco: editForm.banco || null,
        usuarioId: editing.idUsuario || editing.usuarioId // Mantener el mismo usuario
      };

      const res = await client.request(EDITAR_PRODUCTOR_ADMIN_MUTATION, vars);
      const updated = res.editarProductorAdmin;

      setProductores(prev => prev.map(p => (p.id === updated.id ? { ...p, ...updated } : p)));
      setEditing(null);
      alert("Productor actualizado correctamente");
    } catch (err) {
      console.error("Error editando productor:", err);
      const msg = err?.response?.errors?.[0]?.message || err.message || String(err);
      alert(`Error: ${msg}`);
    }
  };

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
                <th className="p-4 text-left">Acciones</th>
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
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-full hover:bg-blue-50"
                        title="Editar Productor"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteProductor(p)}
                        className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-full hover:bg-red-50"
                        title="Eliminar Productor"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-pop max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-orange-600 mb-4">Editar Productor</h2>
            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                <input
                  type="text"
                  name="nombreUsuario"
                  value={editForm.nombreUsuario}
                  onChange={handleEditChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Nombre del productor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={editForm.direccion}
                  onChange={handleEditChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Dirección completa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIT</label>
                <input
                  type="text"
                  name="nit"
                  value={editForm.nit}
                  onChange={handleEditChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Número de NIT"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Cuenta</label>
                <input
                  type="text"
                  name="numeroCuenta"
                  value={editForm.numeroCuenta}
                  onChange={handleEditChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Número de cuenta bancaria"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                <input
                  type="text"
                  name="banco"
                  value={editForm.banco}
                  onChange={handleEditChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Nombre del banco"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
