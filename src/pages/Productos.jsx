import { useEffect, useState } from "react";
import { client } from "../api/graphqlClient";
import { GET_PRODUCTOS, EDITAR_PRODUCTO_ADMIN_MUTATION, ELIMINAR_PRODUCTO_ADMIN_MUTATION } from "../api/adminQueries";
import { FiEye } from "react-icons/fi";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [editForm, setEditForm] = useState({
    nombre: "",
    descripcion: "",
    precioActual: "",
    unidadMedida: "",
    categoria: "",
    stock: "",
    atributos: []
  });
  const [nuevoAtributo, setNuevoAtributo] = useState("");

  const fetchProductos = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await client.request(GET_PRODUCTOS);
      setProductos(data.productos || []);
    } catch (error) {
      console.error("Error fetching productos:", error);
      setError(error.response?.errors?.[0]?.message || "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(price);
  };

  const openDetalle = (p) => {
    setSelectedProducto(p);
    setEditForm({
      nombre: p.nombre || "",
      descripcion: p.descripcion || "",
      precioActual: p.precioActual ?? "",
      unidadMedida: p.unidadMedida || "",
      categoria: p.categoria || "",
      stock: p.stock ?? "",
      atributos: Array.isArray(p.atributos) ? p.atributos : []
    });
    setNuevoAtributo("");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveProducto = async () => {
    if (!selectedProducto) return;
    try {
      const vars = {
        productoId: selectedProducto.id,
        nombre: editForm.nombre || null,
        descripcion: editForm.descripcion || null,
        precioActual: editForm.precioActual !== "" ? Number(editForm.precioActual) : null,
        unidadMedida: editForm.unidadMedida || null,
        categoria: editForm.categoria || null,
        stock: editForm.stock !== "" ? Number(editForm.stock) : null,
        precioMayorista: null,
        cantidadMinimaMayorista: null,
        atributos: editForm.atributos && editForm.atributos.length ? editForm.atributos : null,
        imagenes: null,
        productorId: null
      };

      const res = await client.request(EDITAR_PRODUCTO_ADMIN_MUTATION, vars);
      const updated = res.editarProductoAdmin;
      setProductos(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
      // Refrescar lista completa para asegurar hot reload
      await fetchProductos();
      // Cerrar modal después de guardar
      setSelectedProducto(null);
    } catch (err) {
      console.error("Error editando producto:", err);
      alert(err?.response?.errors?.[0]?.message || err.message || "Error al editar producto");
    }
  };

  const deleteProducto = async () => {
    if (!selectedProducto) return;
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

    try {
      await client.request(ELIMINAR_PRODUCTO_ADMIN_MUTATION, { nombreProducto: selectedProducto.nombre });
      setProductos(prev => prev.filter(p => p.id !== selectedProducto.id));
      setSelectedProducto(null);
      await fetchProductos();
    } catch (err) {
      console.error("Error eliminando producto:", err);
      alert(err?.response?.errors?.[0]?.message || err.message || "Error al eliminar producto");
    }
  };

  if (loading) return <div className="p-6 text-center">Cargando productos...</div>;
  if (error) return <div className="p-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">Productos</h1>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <thead className="bg-orange-600 text-white">
            <tr>
              {['ID', 'Nombre', 'Descripción', 'Categoría', 'Precio', 'Unidad', 'Stock', 'Atributos', 'Acciones'].map((t, i) => (
                <th key={i} className="p-3 text-left">{t}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {productos.map(p => (
              <tr key={p.id} className="hover:bg-orange-50 transition-all duration-200 border-b">
                <td className="p-3">{p.id}</td>
                <td className="p-3 font-medium">{p.nombre || "-"}</td>
                <td className="p-3">
                  <div className="max-w-xs truncate" title={p.descripcion}>
                    {p.descripcion || "-"}
                  </div>
                </td>
                <td className="p-3">{p.categoria || "-"}</td>
                <td className="p-3 font-semibold">{p.precioActual ? formatPrice(p.precioActual) : "-"}</td>
                <td className="p-3">{p.unidadMedida || "-"}</td>
                <td className="p-3">{p.stock ?? "-"}</td>
                <td className="p-3">
                  {p.atributos?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {p.atributos.slice(0,2).map((a,i) => (
                        <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{a}</span>
                      ))}
                      {p.atributos.length > 2 && <span className="text-xs text-gray-500">+{p.atributos.length-2}</span>}
                    </div>
                  ) : "-"}
                </td>
                <td className="p-3">
                  <button
                    className="inline-flex items-center justify-center text-orange-600 hover:text-orange-800 transition-colors duration-200"
                    onClick={() => openDetalle(p)}
                    title="Ver detalles"
                  >
                    <FiEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedProducto && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4"
          onClick={() => setSelectedProducto(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-xl animate-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-orange-600">{selectedProducto.nombre || "Producto"}</h2>
                <p className="text-gray-600">{selectedProducto.categoria || "Sin categoría"}</p>
              </div>
              <button
                onClick={() => setSelectedProducto(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna izquierda - Imágenes */}
              {selectedProducto.imagenes?.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={selectedProducto.imagenes[0]}
                      alt={selectedProducto.nombre}
                      className="w-full h-64 object-contain"
                      onError={(e) => e.target.src = "https://via.placeholder.com/400x300?text=Imagen+no+disponible"}
                    />
                  </div>
                  {selectedProducto.imagenes.length > 1 && (
                    <div className="grid grid-cols-3 gap-2">
                      {selectedProducto.imagenes.slice(1).map((img, i) => (
                        <div key={i} className="bg-gray-100 rounded-md overflow-hidden h-20">
                          <img
                            src={img}
                            alt={`${selectedProducto.nombre} ${i+2}`}
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.src = "https://via.placeholder.com/100x80?text=..."}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg flex items-center justify-center h-64">
                  <span className="text-gray-400">Sin imágenes</span>
                </div>
              )}

              {/* Columna derecha - Detalles */}
              <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-lg space-y-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Precio actual (BOB)</h4>
                    <input
                      type="number"
                      name="precioActual"
                      min="0"
                      step="0.01"
                      value={editForm.precioActual}
                      onChange={handleEditChange}
                      className="w-full mt-1 p-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <div className="text-xs text-gray-600 mt-1">
                      {editForm.precioActual !== "" && !isNaN(Number(editForm.precioActual))
                        ? `≈ ${formatPrice(Number(editForm.precioActual))}`
                        : ""}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {selectedProducto.stock !== undefined && selectedProducto.stock > 0 
                      ? `${selectedProducto.stock} disponibles` 
                      : 'Agotado'}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-700">Nombre</h3>
                    <input
                      type="text"
                      name="nombre"
                      value={editForm.nombre}
                      onChange={handleEditChange}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700">Descripción</h3>
                    <textarea
                      name="descripcion"
                      value={editForm.descripcion}
                      onChange={handleEditChange}
                      className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[120px] resize-y text-gray-900"
                      placeholder="Ingresa la descripción del producto..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Unidad de medida</h4>
                      <input
                        type="text"
                        name="unidadMedida"
                        value={editForm.unidadMedida}
                        onChange={handleEditChange}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Categoría</h4>
                      <input
                        type="text"
                        name="categoria"
                        value={editForm.categoria}
                        onChange={handleEditChange}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Stock</h4>
                      <input
                        type="number"
                        name="stock"
                        value={editForm.stock}
                        onChange={handleEditChange}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">ID Productor</h4>
                      <p className="font-mono text-sm mt-1">{selectedProducto.productorId || "-"}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Atributos</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editForm.atributos && editForm.atributos.length > 0 ? (
                        editForm.atributos.map((a, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            <span>{a}</span>
                            <button
                              type="button"
                              className="ml-2 text-blue-700 hover:text-blue-900"
                              onClick={() => {
                                setEditForm(prev => ({
                                  ...prev,
                                  atributos: prev.atributos.filter((_, idx) => idx !== i)
                                }));
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">Sin atributos</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={nuevoAtributo}
                        onChange={(e) => setNuevoAtributo(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const val = nuevoAtributo.trim();
                            if (!val) return;
                            setEditForm(prev => ({
                              ...prev,
                              atributos: prev.atributos.includes(val)
                                ? prev.atributos
                                : [...prev.atributos, val]
                            }));
                            setNuevoAtributo("");
                          }
                        }}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm text-gray-900"
                        placeholder="Escribe un atributo y presiona Enter"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={saveProducto}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Guardar cambios
                    </button>
                    <button
                      onClick={deleteProducto}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Eliminar Producto
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedProducto(null)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
