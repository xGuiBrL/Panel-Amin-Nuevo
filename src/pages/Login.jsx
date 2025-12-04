import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { client } from "../api/graphqlClient";
import { LOGIN_MUTATION_VARIANTS } from "../api/adminQueries";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!correo.trim() || !password.trim()) {
      setError("Por favor, completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      let data = null;
      let lastError = null;
      const variants = [
        { query: LOGIN_MUTATION_VARIANTS.variant1, variables: { correo, password } },
        { query: LOGIN_MUTATION_VARIANTS.variant2, variables: { correo, password } },
        { query: LOGIN_MUTATION_VARIANTS.variant3, variables: { input: { correo, password } } },
        { query: LOGIN_MUTATION_VARIANTS.variant4, variables: { correo, password } },
        { query: LOGIN_MUTATION_VARIANTS.variant5, variables: { correo, password } },
      ];

      for (const v of variants) {
        try {
          data = await client.request(v.query, v.variables);
          break;
        } catch (err) {
          lastError = err;
          continue;
        }
      }

      if (!data) throw new Error("Error al iniciar sesión");

      const token = data.login || data.Login || data.authenticate || data.signIn || data.token;

      if (token) {
        await login(token);
        navigate("/dashboard");
      } else {
        const serverMessage = lastError?.response?.errors?.[0]?.message;
        setError(serverMessage || "Credenciales inválidas");
      }
    } catch (err) {
      const serverMessage = err?.response?.errors?.[0]?.message;
      setError(serverMessage || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 p-8 bg-[color:var(--color-base)]">
              <div className="flex items-center gap-3 mb-6">
                <img src="/images/mercadea_logo.jpeg" alt="Logo" className="h-10 w-10 rounded-full shadow" />
                <div>
                  <h1 className="text-xl font-semibold text-[color:var(--color-secondary)]">Mercadea Admin</h1>
                  <p className="text-sm text-gray-500">Accede a tu panel administrativo</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[color:var(--color-secondary)] mb-2">Correo</label>
                  <input
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="input-base w-full p-3 rounded-lg focus:ring-2 focus:ring-primary transition outline-none"
                    placeholder="tu@correo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[color:var(--color-secondary)] mb-2">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-base w-full p-3 rounded-lg focus:ring-2 focus:ring-primary transition outline-none"
                    placeholder="********"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg btn-primary shadow-md hover:brightness-95 transition font-semibold disabled:opacity-60"
                >
                  {loading ? "Iniciando..." : "Iniciar sesión"}
                </button>
              </form>
            </div>

            <div className="hidden md:block md:w-1/2 p-8 bg-[color:var(--color-secondary)] text-white">
              <h2 className="text-2xl font-bold mb-3">Bienvenido</h2>
              <p className="text-sm opacity-90">Gestiona usuarios, productos, ventas y comprobadores desde un único panel moderno y seguro.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
