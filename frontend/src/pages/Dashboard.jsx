import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Banknote,
  Boxes,
  Coffee,
  CreditCard,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";

import {
  getResumen,
  getProductos,
  getInsumos,
  getPedidos,
} from "../services/api";

import { obtenerRecomendacionCompras } from "../services/aiService";

const obtenerLista = (respuesta) => {
  if (Array.isArray(respuesta)) return respuesta;
  if (Array.isArray(respuesta?.data)) return respuesta.data;
  return [];
};

const formatoColones = (valor) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2,
  }).format(Number(valor) || 0);

const formatoNumero = (valor) =>
  new Intl.NumberFormat("es-CR").format(Number(valor) || 0);

const obtenerFechaActual = () =>
  new Intl.DateTimeFormat("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

const normalizarTexto = (texto) =>
  String(texto || "No especificado")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letra) => letra.toUpperCase());

export default function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const [productos, setProductos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recomendacion, setRecomendacion] = useState("");
  const [cargandoRecomendacion, setCargandoRecomendacion] = useState(false);
  const [errorRecomendacion, setErrorRecomendacion] = useState("");

  const cargarDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [resumenData, productosData, insumosData, pedidosData] =
        await Promise.all([
          getResumen(),
          getProductos(),
          getInsumos(),
          getPedidos(),
        ]);

      setResumen(resumenData);
      setProductos(obtenerLista(productosData));
      setInsumos(obtenerLista(insumosData));
      setPedidos(obtenerLista(pedidosData));
    } catch (err) {
      setError(err.message || "No fue posible cargar los datos del Dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDashboard();
  }, [cargarDashboard]);

  const ventasPorMetodo = Array.isArray(resumen?.ventasPorMetodo)
    ? resumen.ventasPorMetodo
    : [];

  const productosMasVendidos = Array.isArray(resumen?.productosMasVendidos)
    ? resumen.productosMasVendidos
    : [];

  const totalVentas = ventasPorMetodo.reduce(
    (total, venta) => total + (Number(venta.total_vendido) || 0),
    0,
  );

  const totalPedidosHoy = ventasPorMetodo.reduce(
    (total, venta) => total + (Number(venta.cantidad_pedidos) || 0),
    0,
  );

  const insumosConStockBajo = insumos.filter(
    (insumo) => Number(insumo.stock) <= Number(insumo.stock_minimo),
  );

  const insumosSinStock = insumos.filter(
    (insumo) => Number(insumo.stock) === 0,
  );

  const fechaResumen = resumen?.fecha
    ? new Date(`${String(resumen.fecha).slice(0, 10)}T12:00:00`)
    : new Date();

  const fechaFormateada = new Intl.DateTimeFormat("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fechaResumen);

  if (loading) {
    return (
      <section className="dashboard-page">
        <div className="estado-panel">
          <RefreshCw className="spinner-icono" size={28} />
          <h2>Cargando Dashboard</h2>
          <p>Estamos consultando los datos de Café Central...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dashboard-page">
        <div className="estado-panel">
          <AlertTriangle size={32} />
          <h2>No se pudo cargar el Dashboard</h2>
          <p>{error}</p>
          <button
            className="btn-primary"
            onClick={cargarDashboard}
            type="button"
          >
            <RefreshCw size={16} />
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  async function generarRecomendacion() {
    setCargandoRecomendacion(true);
    setErrorRecomendacion("");
    setRecomendacion("");

    try {
      const data = await obtenerRecomendacionCompras();
      setRecomendacion(data.recomendacion);
    } catch (error) {
      setErrorRecomendacion(
        error.message || "Ocurrió un error al consultar n8n.",
      );
    } finally {
      setCargandoRecomendacion(false);
    }
  }

  return (
    <section className="dashboard-page dashboard-cafe">
      <header className="dashboard-encabezado">
        <div>
          <span className="dashboard-etiqueta">
            <Coffee size={15} />
            CAFÉ CENTRAL
          </span>
          <h1>Panel principal</h1>
          <p>Resumen de ventas, pedidos e inventario de tu cafetería.</p>
        </div>

        <button
          className="dashboard-actualizar"
          type="button"
          onClick={cargarDashboard}
          title="Actualizar información"
          aria-label="Actualizar información"
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </header>

      <div className="dashboard-fecha">
        <Activity size={16} />
        <span>Resumen correspondiente al {fechaFormateada}</span>
      </div>

      <div className="dashboard-metricas">
        <article className="dashboard-metrica">
          <div className="dashboard-metrica-icono ventas">
            <Banknote size={23} />
          </div>
          <div>
            <span>Ventas del día</span>
            <strong>{formatoColones(totalVentas)}</strong>
            <small>Ventas registradas hoy</small>
          </div>
          <TrendingUp className="dashboard-metrica-decoracion" size={21} />
        </article>

        <article className="dashboard-metrica">
          <div className="dashboard-metrica-icono pedidos">
            <ShoppingBag size={23} />
          </div>
          <div>
            <span>Pedidos del día</span>
            <strong>{formatoNumero(totalPedidosHoy)}</strong>
            <small>Pedidos contabilizados en el resumen</small>
          </div>
        </article>

        <article className="dashboard-metrica">
          <div className="dashboard-metrica-icono productos">
            <Package size={23} />
          </div>
          <div>
            <span>Productos registrados</span>
            <strong>{formatoNumero(productos.length)}</strong>
            <small>Productos en el catálogo</small>
          </div>
        </article>

        <article className="dashboard-metrica">
          <div className="dashboard-metrica-icono inventario">
            <Boxes size={23} />
          </div>
          <div>
            <span>Insumos con stock bajo</span>
            <strong>{formatoNumero(insumosConStockBajo.length)}</strong>
            <small>
              {formatoNumero(insumosSinStock.length)} sin existencias
            </small>
          </div>
        </article>
      </div>

      <div className="dashboard-secciones">
        <section className="dashboard-panel">
          <div className="dashboard-panel-encabezado">
            <div>
              <span className="dashboard-panel-icono">
                <Wallet size={19} />
              </span>
              <div>
                <h2>Cierre de caja</h2>
                <p>Ventas agrupadas por método de pago</p>
              </div>
            </div>
            <span className="dashboard-panel-total">
              {formatoColones(totalVentas)}
            </span>
          </div>

          {ventasPorMetodo.length === 0 ? (
            <div className="dashboard-vacio">
              <CreditCard size={26} />
              <p>No hay ventas registradas para esta fecha.</p>
            </div>
          ) : (
            <div className="dashboard-tabla-contenedor">
              <table className="dashboard-tabla">
                <thead>
                  <tr>
                    <th>Método de pago</th>
                    <th>Pedidos</th>
                    <th>Total vendido</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasPorMetodo.map((venta, indice) => (
                    <tr key={`${venta.metodo_pago || "metodo"}-${indice}`}>
                      <td>
                        <span className="dashboard-metodo">
                          <CreditCard size={16} />
                          {normalizarTexto(venta.metodo_pago)}
                        </span>
                      </td>
                      <td>{formatoNumero(venta.cantidad_pedidos)}</td>
                      <td className="dashboard-celda-monto">
                        {formatoColones(venta.total_vendido)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-encabezado">
            <div>
              <span className="dashboard-panel-icono dorado">
                <TrendingUp size={19} />
              </span>
              <div>
                <h2>Productos más vendidos</h2>
                <p>Los cinco productos destacados del día</p>
              </div>
            </div>
          </div>

          {productosMasVendidos.length === 0 ? (
            <div className="dashboard-vacio">
              <Coffee size={26} />
              <p>Aún no hay productos vendidos para mostrar.</p>
            </div>
          ) : (
            <div className="dashboard-top-productos">
              {productosMasVendidos.map((producto, indice) => (
                <article
                  className="dashboard-top-producto"
                  key={`${producto.producto_id ?? producto.producto}-${indice}`}
                >
                  <span className="dashboard-top-numero">{indice + 1}</span>
                  <div className="dashboard-top-info">
                    <strong>
                      {producto.producto || "Producto sin nombre"}
                    </strong>
                    <span>
                      {formatoNumero(producto.unidades_vendidas)} unidades
                    </span>
                  </div>
                  <strong className="dashboard-top-monto">
                    {formatoColones(producto.subtotal_vendido)}
                  </strong>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="dashboard-panel dashboard-inventario-panel">
        <div className="dashboard-panel-encabezado">
          <div>
            <span className="dashboard-panel-icono alerta">
              <AlertTriangle size={19} />
            </span>
            <div>
              <h2>Atención al inventario</h2>
              <p>Insumos que necesitan revisión</p>
            </div>
          </div>
          <span className="dashboard-alerta-contador">
            {insumosConStockBajo.length} alertas
          </span>
        </div>

        {insumosConStockBajo.length === 0 ? (
          <p className="dashboard-inventario-ok">
            Todos los insumos tienen existencias por encima del mínimo.
          </p>
        ) : (
          <div className="dashboard-alertas-lista">
            {insumosConStockBajo.slice(0, 5).map((insumo) => (
              <div className="dashboard-alerta-item" key={insumo.id}>
                <div>
                  <strong>{insumo.nombre}</strong>
                  <span>
                    Stock mínimo: {formatoNumero(insumo.stock_minimo)}{" "}
                    {insumo.unidad}
                  </span>
                </div>
                <span
                  className={
                    Number(insumo.stock) === 0
                      ? "dashboard-stock-cero"
                      : "dashboard-stock-bajo"
                  }
                >
                  {Number(insumo.stock) === 0
                    ? "Sin stock"
                    : `Quedan ${formatoNumero(insumo.stock)} ${insumo.unidad}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="recomendacion-compras">
        <h2>Asistente de compras</h2>

        <p>
          Analiza el inventario y las ventas para sugerir qué insumos conviene
          comprar.
        </p>

        <button
          type="button"
          onClick={generarRecomendacion}
          disabled={cargandoRecomendacion}
        >
          {cargandoRecomendacion
            ? "Analizando inventario..."
            : "Generar recomendación"}
        </button>

        {errorRecomendacion && <p role="alert">{errorRecomendacion}</p>}

        {recomendacion && (
          <article aria-live="polite">
            <h3>Recomendación de compra</h3>
            <p style={{ whiteSpace: "pre-wrap" }}>{recomendacion}</p>
          </article>
        )}
      </section>

      <footer className="dashboard-pie">
        <span>
          <Activity size={15} />
          Información conectada con el backend
        </span>
        <span>
          {formatoNumero(pedidos.length)} pedidos registrados en total
        </span>
      </footer>
    </section>
  );
}
