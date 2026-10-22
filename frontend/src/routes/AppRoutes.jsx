import { Routes, Route } from "react-router-dom";

import Layout from "../components/Layout";
import Dashboard from "../pages/Dashboard";
import Productos from "../pages/Productos";
import Insumos from "../pages/Insumos";
import Pedidos from "../pages/Pedidos";
import Recetas from '../pages/Recetas';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/insumos" element={<Insumos />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/recetas" element={<Recetas />} />

        <Route
          path="*"
          element={
            <div className="panel-card">
              <h2>Página no encontrada</h2>
              <p>La sección que buscas no existe.</p>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
