import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { client } from "../api/graphqlClient";
import {
  CREAR_COMPROBADOR_ADMIN_MUTATION,
  CREATE_USUARIO_MUTATION,
  GET_USUARIOS
} from "../api/adminQueries";
import { FiUser, FiMail, FiPhone, FiLock, FiUserPlus, FiUserCheck, FiPlus } from "react-icons/fi";

const FormField = ({ label, children, icon: Icon, required = false }) => (
  <div className="space-y-1">
    <label className="flex items-center text-sm font-medium text-gray-700">
      {Icon && <Icon className="mr-2 text-gray-600" size={16} />}
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

export default function AdminForms() {
  // Estado para controlar qué formulario está activo
  const [activeTab, setActiveTab] = useState('comprobador-existing'); // 'comprobador-existing', 'comprobador-new'
  // Estados para usuario/comprobador
  const [uNombre, setUNombre] = useState("");
  const [uApellido, setUApellido] = useState("");
  const [uCorreo, setUCorreo] = useState("");
  const [uPassword, setUPassword] = useState("");
  const [uTelefono, setUTelefono] = useState("");

  // Estados para comprobador
  const [cCI, setCCI] = useState("");
  const [cNombreUsuario, setCNombreUsuario] = useState("");
  const [cCupos, setCCupos] = useState("");

  // Estados generales
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  // Estado para crear comprobador desde usuario existente por correo
  const [compCorreo, setCompCorreo] = useState("");
  const [compCi, setCompCi] = useState("");
  const [compCuposExistente, setCompCuposExistente] = useState("");
  const [creatingExistingComprobador, setCreatingExistingComprobador] = useState(false);


  const resetForm = (formType) => {
    if (formType === 'comprobador') {
      setUNombre('');
      setUApellido('');
      setUCorreo('');
      setUPassword('');
      setUTelefono('');
      setCCI('');
      setCNombreUsuario('');
      setCCupos("");
    }
  };


  const handleCrearComprobadorPorCorreo = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (!compCorreo.trim() || !compCi.trim()) {
      showMessage("error", "Debes ingresar correo y CI");
      return;
    }

    try {
      setCreatingExistingComprobador(true);

      const data = await client.request(GET_USUARIOS);
      const usuarios = data.usuarios || [];
      const correoLower = compCorreo.trim().toLowerCase();
      const usuario = usuarios.find(u => (u.correo || "").toLowerCase() === correoLower);

      if (!usuario) {
        throw new Error("No se encontró un usuario con ese correo");
      }

      const cupos = normalizeCupos(compCuposExistente);

      await client.request(CREAR_COMPROBADOR_ADMIN_MUTATION, {
        usuarioId: usuario.id,
        ci: compCi.trim(),
        nombreUsuario: null,
        cuposDisponibles: cupos,
      });

      showMessage("success", `Comprobador creado para ${usuario.correo}`);
      setCompCorreo("");
      setCompCi("");
      setCompCuposExistente("");
      setTimeout(() => navigate("/comprobadores"), 1200);
    } catch (err) {
      console.error("Error creando comprobador por correo:", err);
      const errorMsg = err?.response?.errors?.[0]?.message || err.message || "Error al crear comprobador";
      showMessage("error", `Error: ${errorMsg}`);
    } finally {
      setCreatingExistingComprobador(false);
    }
  };

  const showMessage = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 5000);
  };

  const normalizeCupos = (val) => {
    const num = Number(val);
    if (val === "" || val === null || val === undefined || isNaN(num) || num < 0) return 10;
    return Math.min(10, num);
  };

  const handleCreateComprobador = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setLoading(true);

    try {
      if (!uPassword || uPassword.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres.");
      }

      const userVariables = {
        input: {
          nombre: uNombre,
          apellido: uApellido,
          correo: uCorreo,
          password: uPassword,
          telefono: uTelefono,
        },
      };

      const userRes = await client.request(CREATE_USUARIO_MUTATION, userVariables);
      const createdUser = userRes?.crearUsuario;
      if (!createdUser || !createdUser.id) {
        throw new Error("No se pudo crear el usuario");
      }

      const cupos = normalizeCupos(cCupos);

      const compVariables = {
        usuarioId: createdUser.id,
        ci: cCI,
        nombreUsuario: cNombreUsuario || `${uNombre} ${uApellido}`.trim(),
        cuposDisponibles: cupos,
      };

      await client.request(CREAR_COMPROBADOR_ADMIN_MUTATION, compVariables);

      showMessage('success', 'Usuario y comprobador creados correctamente');
      resetForm('comprobador');
      setTimeout(() => navigate("/comprobadores"), 1500);

    } catch (err) {
      console.error(err);
      const errorMsg = err?.response?.errors?.[0]?.message || err.message || 'Error al crear el comprobador';
      showMessage('error', `Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 md:p-6 max-w-7xl">
        <div className="mb-4 sm:mb-6 md:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">Formularios Administrativos</h2>
        <p className="text-sm sm:text-base font-medium" style={{ color: activeTab === 'comprobador-new' ? '#2563eb' : activeTab.includes('comprobador') ? '#ea580c' : '#2563eb' }}>Gestiona comprobadores del sistema</p>
      </div>

      {/* Mensajes */}
      {msg.text && (
        <div className={`mb-6 p-4 rounded-lg ${msg.type === 'error' ? 'bg-red-100 text-red-700 border-l-4 border-red-500' : 'bg-green-100 text-green-700 border-l-4 border-green-500'} shadow-sm`}>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium">{msg.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navegación por Tabs */}
      <div className="bg-white rounded-xl shadow-lg mb-4 sm:mb-6 md:mb-8 border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            {/* Comprobador - Usuario Existente */}
            <button
              onClick={() => setActiveTab('comprobador-existing')}
              style={{ color: activeTab === 'comprobador-existing' ? '#c2410c' : '#374151' }}
              className={`flex items-center px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors duration-200 border-b-2 whitespace-nowrap ${activeTab === 'comprobador-existing'
                ? 'border-orange-600 bg-orange-50'
                : 'border-transparent hover:bg-gray-50'
                }`}
            >
              <FiUserCheck className="mr-1 sm:mr-2 flex-shrink-0" style={{ color: activeTab === 'comprobador-existing' ? '#c2410c' : '#4b5563' }} />
              <span>Comprobador - Usuario Existente</span>
            </button>
            
            {/* Comprobador - Nuevo Usuario */}
            <button
              onClick={() => setActiveTab('comprobador-new')}
              style={{ color: activeTab === 'comprobador-new' ? '#1d4ed8' : '#374151' }}
              className={`flex items-center px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors duration-200 border-b-2 whitespace-nowrap ${activeTab === 'comprobador-new'
                ? 'border-blue-600 bg-blue-50'
                : 'border-transparent hover:bg-gray-50'
                }`}
            >
              <FiUserPlus className="mr-1 sm:mr-2 flex-shrink-0" style={{ color: activeTab === 'comprobador-new' ? '#1d4ed8' : '#4b5563' }} />
              <span>Comprobador - Nuevo Usuario</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido dinámico según tab activo */}
      {activeTab === 'comprobador-existing' ? (
        <div className="space-y-6">
          {/* Crear comprobador para usuario existente por correo */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 mb-6 md:mb-8 border border-gray-100">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-semibold text-white flex items-center">
                <FiUserCheck className="mr-2" />
                Crear Comprobador desde Usuario existente
              </h3>
              <p className="text-orange-100 text-sm mt-1">Busca un usuario por correo y conviértelo en comprobador</p>
            </div>
            <div className="p-4 md:p-6">
              <form onSubmit={handleCrearComprobadorPorCorreo} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  <FormField label="Correo del usuario" icon={FiMail} required>
                    <input
                      type="email"
                      value={compCorreo}
                      onChange={(e) => setCompCorreo(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-base text-gray-900 placeholder-gray-500"
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </FormField>

                  <FormField label="CI" icon={FiUser} required>
                    <input
                      type="text"
                      value={compCi}
                      onChange={(e) => setCompCi(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-base text-gray-900 placeholder-gray-500"
                      placeholder="Número de CI"
                      required
                    />
                  </FormField>

                  <FormField label="Cupos disponibles (opcional)" icon={FiUser}>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={compCuposExistente}
                      onChange={(e) => setCompCuposExistente(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-base text-gray-900 placeholder-gray-500"
                      placeholder="Dejar vacío para máximo"
                    />
                  </FormField>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition disabled:opacity-70 text-base font-medium min-h-[48px] w-full sm:w-auto"
                    disabled={creatingExistingComprobador}
                  >
                    {creatingExistingComprobador ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creando...
                      </>
                    ) : (
                      <>
                        <FiPlus className="mr-2" />
                        Crear Comprobador
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : activeTab === 'comprobador-new' ? (
        <div className="space-y-6">
          {/* Formulario de Comprobador */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 mb-6 md:mb-8 border border-gray-100">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-semibold text-white flex items-center">
                <FiUserPlus className="mr-2" />
                Crear Nuevo Comprobador
              </h3>
              <p className="text-blue-100 text-sm mt-1">Crea un nuevo usuario y asígnale el rol de comprobador</p>
            </div>
            <div className="p-4 md:p-6">
              <form onSubmit={handleCreateComprobador} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-4 md:space-y-6">
                    <h4 className="text-base font-semibold text-gray-700 border-b border-gray-200 pb-2">Información Personal</h4>
                    <FormField label="Nombre" icon={FiUser} required>
                      <input
                        type="text"
                        value={uNombre}
                        onChange={(e) => setUNombre(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base text-gray-900 placeholder-gray-500"
                        placeholder="Ingrese el nombre"
                        required
                      />
                    </FormField>

                    <FormField label="Apellido" icon={FiUser} required>
                      <input
                        type="text"
                        value={uApellido}
                        onChange={(e) => setUApellido(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base text-gray-900 placeholder-gray-500"
                        placeholder="Ingrese el apellido"
                        required
                      />
                    </FormField>

                    <FormField label="Teléfono" icon={FiPhone}>
                      <input
                        type="tel"
                        value={uTelefono}
                        onChange={(e) => setUTelefono(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base text-gray-900 placeholder-gray-500"
                        placeholder="Ej: 60012345"
                      />
                    </FormField>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    <h4 className="text-base font-semibold text-gray-700 border-b border-gray-200 pb-2">Cuenta y Acceso</h4>
                    <FormField label="Correo Electrónico" icon={FiMail} required>
                      <input
                        type="email"
                        value={uCorreo}
                        onChange={(e) => setUCorreo(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base text-gray-900 placeholder-gray-500"
                        placeholder="correo@ejemplo.com"
                        required
                      />
                    </FormField>

                    <FormField label="Contraseña" icon={FiLock} required>
                      <input
                        type="password"
                        value={uPassword}
                        onChange={(e) => setUPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base text-gray-900 placeholder-gray-500"
                        placeholder="Mínimo 6 caracteres"
                        minLength="6"
                        required
                      />
                    </FormField>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 pt-4 border-t border-gray-100">
                  <div className="space-y-4 md:space-y-6">
                    <h4 className="text-base font-semibold text-gray-700 border-b border-gray-200 pb-2">Configuración de Comprobador</h4>
                    <FormField label="Cédula de Identidad" icon={FiUser} required>
                      <input
                        type="text"
                        value={cCI}
                        onChange={(e) => setCCI(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base text-gray-900 placeholder-gray-500"
                        placeholder="Número de CI"
                        required
                      />
                    </FormField>

                    <FormField label="Nombre de Usuario (opcional)" icon={FiUser}>
                      <input
                        type="text"
                        value={cNombreUsuario}
                        onChange={(e) => setCNombreUsuario(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base text-gray-900 placeholder-gray-500"
                        placeholder="Dejar en blanco para usar nombre completo"
                      />
                    </FormField>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    <h4 className="text-base font-semibold text-gray-700 border-b border-gray-200 pb-2">Límites y Restricciones</h4>
                    <FormField label="Cupos Disponibles (opcional)" icon={FiUser}>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={cCupos}
                        onChange={(e) => setCCupos(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base text-gray-900 placeholder-gray-500"
                        placeholder="Dejar vacío para 10"
                      />
                    </FormField>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => resetForm('comprobador')}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-blue-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition text-base font-medium min-h-[48px] w-full sm:w-auto"
                    disabled={loading}
                  >
                    Limpiar Formulario
                  </button>
                  <button
                    type="submit"
                    className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-70 text-base font-medium min-h-[48px] w-full sm:w-auto"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creando Comprobador...
                      </>
                    ) : (
                      <>
                        <FiUserPlus className="mr-2" />
                        Crear Comprobador
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
