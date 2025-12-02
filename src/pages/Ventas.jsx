import { useEffect, useState } from "react";
import { client } from "../api/graphqlClient";
import { 
  GET_VENTAS, 
  GET_USUARIOS, 
  GET_PRODUCTORES,
  ELIMINAR_VENTA_ADMIN_MUTATION,
  EDITAR_VENTA_ADMIN_MUTATION
} from "../api/adminQueries";

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [usuarios, setUsuarios] = useState({});
  const [productores, setProductores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingVenta, setEditingVenta] = useState(null);
  const [editForm, setEditForm] = useState({
    estado: "",
    numeroTransaccion: ""
  });

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Obtener ventas
        const ventasData = await client.request(GET_VENTAS);
        
        // Obtener usuarios y crear mapeo de ID a nombre
        const usuariosData = await client.request(GET_USUARIOS);
        const usuariosMap = {};
        usuariosData.usuarios.forEach(u => {
          usuariosMap[u.id] = `${u.nombre || ''} ${u.apellido || ''}`.trim() || u.correo;
        });
        
        // Obtener productores y crear mapeo de ID a nombre
        const productoresData = await client.request(GET_PRODUCTORES);
        const productoresMap = {};
        productoresData.productores.forEach(p => {
          productoresMap[p.id] = p.nombreUsuario || `Productor ${p.id}`;
        });
        
        setVentas(ventasData.ventas || []);
        setUsuarios(usuariosMap);
        setProductores(productoresMap);
        
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Manejar eliminación de venta
  const handleDeleteVenta = async (ventaId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta venta? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await client.request(ELIMINAR_VENTA_ADMIN_MUTATION, { ventaId });
      setVentas(ventas.filter(v => v.id !== ventaId));
    } catch (err) {
      console.error("Error eliminando venta:", err);
      alert("Error al eliminar la venta. Por favor, inténtalo de nuevo.");
    }
  };

  // Iniciar edición de venta
  const startEditing = (venta) => {
    setEditingVenta(venta);
    setEditForm({
      estado: venta.estado || "",
      numeroTransaccion: venta.numeroTransaccion || ""
    });
  };

  // Manejar cambio en el formulario de edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Guardar cambios de edición
  const saveEdit = async () => {
    if (!editingVenta) return;
    
    try {
      const { id } = editingVenta;
      await client.request(EDITAR_VENTA_ADMIN_MUTATION, {
        ventaId: id,
        estado: editForm.estado,
        numeroTransaccion: editForm.numeroTransaccion
      });
      
      // Actualizar la lista de ventas
      setVentas(ventas.map(v => 
        v.id === id ? { ...v, ...editForm } : v
      ));
      
      setEditingVenta(null);
    } catch (err) {
      console.error("Error actualizando venta:", err);
      alert("Error al actualizar la venta. Por favor, inténtalo de nuevo.");
    }
  };

  if (loading) {
    return (
      <div className="p-3 sm:p-4 md:p-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-orange-600 mb-3 sm:mb-4">Ventas</h1>
        <div className="py-6 sm:py-8 text-sm sm:text-base">Cargando ventas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-orange-600 mb-3 sm:mb-4">Ventas</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm sm:text-base">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-orange-600 mb-2 sm:mb-0">Ventas</h1>
      </div>

      {ventas.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-white rounded-2xl shadow">
          <p className="text-gray-500 text-base sm:text-lg">No hay ventas registradas</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-xl">
          <table className="w-full min-w-[600px]">
            <thead className="bg-orange-600 text-white">
              <tr>
                {[
                  "ID",
                  "Usuario",
                  "Productor",
                  "Monto Total",
                  "Estado",
                  "Nro. Transacción",
                  "Acciones"
                ].map((t, i) => (
                  <th key={i} className="p-2 sm:p-3 md:p-4 text-left text-sm sm:text-base">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ventas.map(v => (
                <tr key={v.id} className="hover:bg-orange-50 transition-colors duration-150 border-b">
                  <td className="p-2 sm:p-3 md:p-4 font-mono text-xs sm:text-sm">{v.id}</td>
                  <td className="p-2 sm:p-3 md:p-4">
                    <div className="font-medium text-sm sm:text-base">{usuarios[v.usuarioId] || `Usuario ${v.usuarioId}`}</div>
                    <div className="text-xs text-gray-500">ID: {v.usuarioId}</div>
                  </td>
                  <td className="p-2 sm:p-3 md:p-4">
                    <div className="font-medium text-sm sm:text-base">{productores[v.productorId] || `Productor ${v.productorId}`}</div>
                    <div className="text-xs text-gray-500">ID: {v.productorId}</div>
                  </td>
                  <td className="p-2 sm:p-3 md:p-4 font-semibold text-orange-700 text-sm sm:text-base">{formatPrice(v.montoTotal)}</td>
                  <td className="p-2 sm:p-3 md:p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      v.estado === 'completado' ? 'bg-green-100 text-green-800' :
                      v.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      v.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {v.estado || 'Desconocido'}
                    </span>
                  </td>
                  <td className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm text-gray-800">
                    {v.numeroTransaccion || "-"}
                  </td>
                  <td className="p-2 sm:p-3 md:p-4 space-x-1 sm:space-x-2">
                    <button
                      onClick={() => startEditing(v)}
                      className="text-blue-600 hover:text-blue-800 transition-colors text-sm sm:text-base"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteVenta(v.id)}
                      className="text-red-600 hover:text-red-800 transition-colors text-sm sm:text-base"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de edición */}
      {editingVenta && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => setEditingVenta(null)}
        >
          <div 
            className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto"
            style={{ margin: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg sm:text-xl font-bold text-orange-600 mb-3 sm:mb-4">Editar Venta #{editingVenta.id}</h2>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Estado</label>
                <select
                  name="estado"
                  value={editForm.estado}
                  onChange={handleEditChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-sm sm:text-base"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_proceso">En proceso</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Número de Transacción</label>
                <input
                  type="text"
                  name="numeroTransaccion"
                  value={editForm.numeroTransaccion}
                  onChange={handleEditChange}
                  placeholder="Opcional"
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-sm sm:text-base"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
                <button
                  onClick={() => setEditingVenta(null)}
                  className="px-3 sm:px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEdit}
                  className="px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
