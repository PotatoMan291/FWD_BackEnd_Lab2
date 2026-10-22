import { NavLink } from "react-router-dom";
import { LayoutDashboard, Coffee, Package, ReceiptText } from "lucide-react";

const enlaces = [
  {
    to: "/",
    icono: LayoutDashboard,
    texto: "Panel principal",
    end: true,
  },
  {
    to: "/productos",
    icono: Coffee,
    texto: "Productos",
  },
  {
    to: "/insumos",
    icono: Package,
    texto: "Inventario",
  },
  {
    to: "/pedidos",
    icono: ReceiptText,
    texto: "Pedidos y ventas",
  },
  {
    to: "/recetas",
    icono: ReceiptText,
    texto: "Recetas",
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">C</div>

        <div>
          <h2>Café Central</h2>
          <span>Administración</span>
        </div>
      </div>

      <div className="nav-label">MENÚ PRINCIPAL</div>

      <nav className="nav-links">
        {enlaces.map(({ to, icono: Icono, texto, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <Icono
              className="nav-icon"
              size={19}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <span>{texto}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="status-dot" />

        <div>
          <strong>Sistema local</strong>
          <span>Panel de cafetería</span>
        </div>
      </div>
    </aside>
  );
}
