import { useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();
  const isMercadea = location.pathname.startsWith("/mercadea");

  return (
    <footer
      className={`text-center py-6 transition-all duration-300 
      ${isMercadea ? "bg-orange-600 text-white" : "bg-sinemYellow text-sinemBlack"}`}
    >
      <div className="max-w-6xl mx-auto">
        <p>© 2025 Sinem. Todos los derechos reservados.</p>
        <p className="text-sm mt-2">
          Síguenos en redes sociales: Facebook | Twitter | LinkedIn
        </p>
      </div>
    </footer>
  );
}
