import { useEffect, useState } from "react";
import { client } from "../api/graphqlClient";
import { GET_USUARIOS, GET_PRODUCTORES, GET_PRODUCTOS, GET_VENTAS } from "../api/adminQueries";
import DashboardChart from "../components/DashboardChart";

export default function Dashboard() {
  const [usuarios, setUsuarios] = useState([]);
  const [productores, setProductores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await client.request(GET_USUARIOS);
        const prods = await client.request(GET_PRODUCTORES);
        const items = await client.request(GET_PRODUCTOS);
        const ventasData = await client.request(GET_VENTAS);

        setUsuarios(users.usuarios || []);
        setProductores(prods.productores || []);
        setProductos(items.productos || []);
        setVentas(ventasData.ventas || []);
        setLoading(false);
      } catch (error) {
        console.error("Error dashboard:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    { title: "Usuarios", value: usuarios.length },
    { title: "Productores", value: productores.length },
    { title: "Productos", value: productos.length },
    { title: "Ventas", value: ventas.length },
  ];

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-[color:var(--color-secondary)] mb-8">Dashboard Administrativo</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {cards.map((c, i) => (
          <div
            key={i}
            className="col-span-1 bg-white border border-gray-100 shadow-soft rounded-2xl p-6 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <h3 className="text-sm font-semibold text-gray-600">{c.title}</h3>
            {!loading ? (
              <p className="text-3xl font-bold text-[color:var(--color-primary)] mt-3">{c.value}</p>
            ) : (
              <div className="h-10 w-28 bg-gray-200 rounded animate-pulse mt-3" />
            )}
            <div className="mt-4 h-2 w-24 bg-[color:var(--color-primary)]/20 rounded-full"></div>
          </div>
        ))}
      </div>

      {/* Chart section: full width below cards on mobile, spans 4 columns on desktop */}
      <div className="mt-6">
        <DashboardChart
          labels={["Usuarios", "Productores", "Productos", "Ventas"]}
          datasets={[{ label: "Conteo", data: [usuarios.length, productores.length, productos.length, ventas.length], backgroundColor: ['rgba(242,73,40,0.9)'] }]}
        />
      </div>
    </div>
  );
}
