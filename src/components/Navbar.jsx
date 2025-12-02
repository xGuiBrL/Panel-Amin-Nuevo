import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  // Detecta si estás en la sección Mercadea
  const isMercadea = location.pathname.startsWith("/mercadea");

  return (
    <nav
      className={`shadow-md sticky top-0 z-50 transition-all duration-300 
      ${isMercadea ? "bg-orange-600 text-white" : "bg-sinemBlack text-sinemYellow"}`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

        {/* LOGO dinámico según la ruta */}
        <img
          src={isMercadea ? "/images/mercadea_logo.jpeg" : "/images/sinem_logo.png"}
          className="h-10 cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={() => (window.location.href = "/")}
        />

        {/* LINKS */}
        <div className={`space-x-8 font-semibold flex`}>
          <Link
            className={`hover:opacity-80 transition ${isMercadea ? "text-white" : "text-sinemYellow"}`}
            to="/"
          >
            Inicio
          </Link>

          <Link
            className={`hover:opacity-80 transition ${isMercadea ? "text-white" : "text-sinemYellow"}`}
            to="/about-us"
          >
            Quiénes Somos
          </Link>

          <Link
            className={`hover:opacity-80 transition ${isMercadea ? "text-white" : "text-sinemYellow"}`}
            to="/our-works"
          >
            Trabajos
          </Link>

          <Link
            className={`hover:opacity-80 transition ${isMercadea ? "text-white" : "text-sinemYellow"}`}
            to="/mercadea"
          >
            Mercadea
          </Link>
        </div>

      </div>
    </nav>
  );
}
