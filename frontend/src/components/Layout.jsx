import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

const titulos = {
  "/": "Panel principal",
  "/productos": "Productos",
  "/insumos": "Inventario de insumos",
  "/pedidos": "Pedidos y ventas",
};

export default function Layout() {
  const location = useLocation();
  const titulo = titulos[location.pathname] || "Cafetería";

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="eyebrow">GESTIÓN DE CAFETERÍA</span>
            <h1>{titulo}</h1>
          </div>

          <div className="topbar-right">
            <span className="today-label">Sistema de punto de venta</span>
            <div className="avatar">CC</div>
          </div>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
