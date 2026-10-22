import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock,
  CreditCard,
  Eye,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  Wallet,
  X,
} from "lucide-react";

import {
  getPedidos,
  getPedido,
  getProductos,
  crearPedido,
  anularPedido,
} from "../services/api";

const obtenerLista = (respuesta) => {
  if (Array.isArray(respuesta)) return respuesta;
  if (Array.isArray(respuesta?.data)) return respuesta.data;
  if (Array.isArray(respuesta?.pedidos)) return respuesta.pedidos;
  return [];
};

const obtenerPedido = (respuesta) =>
  respuesta?.pedido ?? respuesta?.data ?? respuesta;

const dinero = (valor) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2,
  }).format(Number(valor) || 0);

const fechaHora = (valor) => {
  if (!valor) return "Fecha no disponible";

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) return String(valor);

  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
};

const nombreMetodo = (metodo) => {
  const nombres = {
    efectivo: "Efectivo",
    tarjeta: "Tarjeta",
    sinpe: "SINPE Móvil",
  };

  return nombres[String(metodo || "").toLowerCase()] || metodo || "No indicado";
};

const nombreEstado = (estado) =>
  String(estado || "registrado")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letra) => letra.toUpperCase());

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cantidades, setCantidades] = useState({});
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [guardando, setGuardando] = useState(false);

  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [pedidoAnular, setPedidoAnular] = useState(null);
  const [anulando, setAnulando] = useState(false);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setErrorCarga("");

    try {
      const [respuestaPedidos, respuestaProductos] = await Promise.all([
        getPedidos(),
        getProductos(),
      ]);

      setPedidos(obtenerLista(respuestaPedidos));
      setProductos(obtenerLista(respuestaProductos));
    } catch (err) {
      setErrorCarga(err.message || "No se pudieron cargar los pedidos.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const productosActivos = useMemo(
    () =>
      productos.filter(
        (producto) =>
          producto.activo !== false &&
          producto.activo !== 0 &&
          producto.activo !== "false",
      ),
    [productos],
  );

  const pedidosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return [...pedidos]
      .filter((pedido) => {
        const coincideBusqueda =
          !termino ||
          String(pedido.id ?? "")
            .toLowerCase()
            .includes(termino) ||
          String(pedido.metodo_pago ?? "")
            .toLowerCase()
            .includes(termino) ||
          String(pedido.estado ?? "")
            .toLowerCase()
            .includes(termino);

        const coincideEstado =
          filtroEstado === "todos" ||
          String(pedido.estado || "").toLowerCase() === filtroEstado;

        return coincideBusqueda && coincideEstado;
      })
      .sort(
        (a, b) =>
          new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime(),
      );
  }, [pedidos, busqueda, filtroEstado]);

  const productosSeleccionados = productosActivos
    .filter((producto) => Number(cantidades[producto.id]) > 0)
    .map((producto) => ({
      ...producto,
      cantidad: Number(cantidades[producto.id]),
    }));

  const subtotalEstimado = productosSeleccionados.reduce(
    (total, producto) =>
      total + Number(producto.precio || 0) * producto.cantidad,
    0,
  );

  const impuestoEstimado = subtotalEstimado * 0.13;
  const totalEstimado = subtotalEstimado + impuestoEstimado;

  const actualizarCantidad = (productoId, valor) => {
    const cantidad = Math.max(0, Math.floor(Number(valor) || 0));

    setCantidades((actuales) => ({
      ...actuales,
      [productoId]: cantidad,
    }));
  };

  const abrirFormulario = () => {
    setCantidades({});
    setMetodoPago("efectivo");
    setErrorAccion("");
    setMensajeExito("");
    setMostrarFormulario(true);
  };

  const registrarPedido = async (evento) => {
    evento.preventDefault();
    setErrorAccion("");
    setMensajeExito("");

    if (productosSeleccionados.length === 0) {
      setErrorAccion("Agrega al menos un producto al pedido.");
      return;
    }

    setGuardando(true);

    try {
      const respuesta = await crearPedido({
        metodo_pago: metodoPago,
        items: productosSeleccionados.map((producto) => ({
          producto_id: producto.id,
          cantidad: producto.cantidad,
        })),
      });

      setMostrarFormulario(false);
      setCantidades({});
      setMensajeExito(
        `Pedido #${obtenerPedido(respuesta)?.id ?? ""} registrado correctamente.`,
      );

      await cargarDatos();
    } catch (err) {
      setErrorAccion(
        err.message ||
          "No se pudo registrar el pedido. Revisa el inventario y vuelve a intentarlo.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const abrirDetalle = async (pedido) => {
    setPedidoDetalle(pedido);
    setCargandoDetalle(true);
    setErrorAccion("");

    try {
      const respuesta = await getPedido(pedido.id);
      setPedidoDetalle(obtenerPedido(respuesta));
    } catch (err) {
      setErrorAccion(`No se pudo cargar el detalle: ${err.message}`);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const confirmarAnulacion = async () => {
    if (!pedidoAnular) return;

    setAnulando(true);
    setErrorAccion("");
    setMensajeExito("");

    try {
      await anularPedido(pedidoAnular.id);

      setPedidoAnular(null);
      setPedidoDetalle(null);
      setMensajeExito(`El pedido #${pedidoAnular.id} se anuló correctamente.`);

      await cargarDatos();
    } catch (err) {
      setErrorAccion(
        err.message ||
          "No se pudo anular el pedido. Puede que haya vencido el plazo permitido.",
      );
    } finally {
      setAnulando(false);
    }
  };

  const esAnulado = (pedido) =>
    String(pedido?.estado || "").toLowerCase() === "anulado";

  if (cargando) {
    return (
      <section className="pedidos-page">
        <div className="estado-panel">
          <LoaderCircle className="spinner-icono" size={28} />
          <h2>Cargando pedidos</h2>
          <p>Consultando las ventas registradas...</p>
        </div>
      </section>
    );
  }

  if (errorCarga) {
    return (
      <section className="pedidos-page">
        <div className="estado-panel">
          <AlertTriangle size={32} />
          <h2>No se pudieron cargar los pedidos</h2>
          <p>{errorCarga}</p>
          <button className="btn-primary" type="button" onClick={cargarDatos}>
            <RefreshCw size={16} />
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="pedidos-page">
      <header className="pedidos-encabezado">
        <div>
          <span className="pedidos-etiqueta">
            <ShoppingBag size={15} />
            CAFÉ CENTRAL
          </span>
          <h1>Pedidos y ventas</h1>
          <p>Registra ventas y consulta el historial de pedidos.</p>
        </div>

        <button
          className="btn-primary pedidos-nuevo"
          type="button"
          onClick={abrirFormulario}
        >
          <Plus size={18} />
          Nueva venta
        </button>
      </header>

      {mensajeExito && (
        <div className="pedidos-mensaje exito" role="status">
          <CheckCircle2 size={18} />
          <span>{mensajeExito}</span>
          <button
            type="button"
            onClick={() => setMensajeExito("")}
            aria-label="Cerrar mensaje"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {errorAccion && !mostrarFormulario && (
        <div className="pedidos-mensaje error" role="alert">
          <AlertTriangle size={18} />
          <span>{errorAccion}</span>
          <button
            type="button"
            onClick={() => setErrorAccion("")}
            aria-label="Cerrar mensaje"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="pedidos-resumen">
        <article>
          <span className="pedidos-resumen-icono">
            <ShoppingBag size={21} />
          </span>
          <div>
            <span>Pedidos registrados</span>
            <strong>{pedidos.length}</strong>
          </div>
        </article>

        <article>
          <span className="pedidos-resumen-icono dorado">
            <CircleDollarSign size={21} />
          </span>
          <div>
            <span>Pedidos activos</span>
            <strong>{pedidos.filter((p) => !esAnulado(p)).length}</strong>
          </div>
        </article>
      </div>

      <div className="pedidos-herramientas">
        <label className="pedidos-busqueda">
          <Search size={18} />
          <input
            type="search"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por ID, método de pago o estado..."
          />
        </label>

        <select
          value={filtroEstado}
          onChange={(evento) => setFiltroEstado(evento.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="todos">Todos los estados</option>
          <option value="registrado">Registrados</option>
          <option value="completado">Completados</option>
          <option value="anulado">Anulados</option>
        </select>

        <button
          className="pedidos-actualizar"
          type="button"
          onClick={cargarDatos}
          title="Actualizar pedidos"
          aria-label="Actualizar pedidos"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      <div className="pedidos-lista-panel">
        <div className="pedidos-lista-titulo">
          <div>
            <h2>Historial de ventas</h2>
            <p>{pedidosFiltrados.length} pedidos encontrados</p>
          </div>
        </div>

        {pedidosFiltrados.length === 0 ? (
          <div className="pedidos-vacio">
            <ShoppingBag size={34} />
            <h3>No hay pedidos para mostrar</h3>
            <p>Prueba otro filtro o registra una nueva venta.</p>
          </div>
        ) : (
          <div className="pedidos-tabla-contenedor">
            <table className="pedidos-tabla">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Fecha</th>
                  <th>Método de pago</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.map((pedido) => (
                  <tr key={pedido.id}>
                    <td>
                      <strong className="pedido-identificador">
                        #{pedido.id}
                      </strong>
                    </td>
                    <td>
                      <span className="pedido-fecha">
                        <CalendarDays size={15} />
                        {fechaHora(pedido.fecha)}
                      </span>
                    </td>
                    <td>{nombreMetodo(pedido.metodo_pago)}</td>
                    <td className="pedido-total">{dinero(pedido.total)}</td>
                    <td>
                      <span
                        className={`pedido-estado ${
                          esAnulado(pedido) ? "anulado" : "activo"
                        }`}
                      >
                        {esAnulado(pedido)
                          ? "Anulado"
                          : nombreEstado(pedido.estado)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="pedido-ver"
                        type="button"
                        onClick={() => abrirDetalle(pedido)}
                        aria-label={`Ver pedido ${pedido.id}`}
                      >
                        Ver <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {mostrarFormulario && (
        <div
          className="pedidos-overlay"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget && !guardando) {
              setMostrarFormulario(false);
            }
          }}
        >
          <section
            className="pedidos-modal pedidos-modal-venta"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-nuevo-pedido"
          >
            <header className="pedidos-modal-encabezado">
              <div>
                <span className="pedidos-modal-icono">
                  <ShoppingBag size={21} />
                </span>
                <div>
                  <h2 id="titulo-nuevo-pedido">Registrar venta</h2>
                  <p>Selecciona los productos y sus cantidades.</p>
                </div>
              </div>
              <button
                type="button"
                className="pedidos-cerrar"
                onClick={() => setMostrarFormulario(false)}
                disabled={guardando}
                aria-label="Cerrar formulario"
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={registrarPedido}>
              {errorAccion && (
                <div className="pedidos-mensaje error" role="alert">
                  <AlertTriangle size={18} />
                  <span>{errorAccion}</span>
                </div>
              )}

              {productosActivos.length === 0 ? (
                <div className="pedidos-vacio">
                  <AlertTriangle size={28} />
                  <p>No hay productos activos disponibles para vender.</p>
                </div>
              ) : (
                <div className="pedidos-productos-venta">
                  {productosActivos.map((producto) => (
                    <div className="pedidos-producto-venta" key={producto.id}>
                      <div>
                        <strong>{producto.nombre}</strong>
                        <span>{dinero(producto.precio)} por unidad</span>
                      </div>
                      <label>
                        <span className="sr-only">
                          Cantidad de {producto.nombre}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={cantidades[producto.id] || ""}
                          onChange={(evento) =>
                            actualizarCantidad(producto.id, evento.target.value)
                          }
                          placeholder="0"
                          disabled={guardando}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              )}

              <div className="pedidos-metodo-pago">
                <label htmlFor="metodo-pago">Método de pago</label>
                <select
                  id="metodo-pago"
                  value={metodoPago}
                  onChange={(evento) => setMetodoPago(evento.target.value)}
                  disabled={guardando}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="sinpe">SINPE Móvil</option>
                </select>
              </div>

              <div className="pedidos-totales">
                <div>
                  <span>Subtotal estimado</span>
                  <strong>{dinero(subtotalEstimado)}</strong>
                </div>
                <div>
                  <span>Impuesto (13 %)</span>
                  <strong>{dinero(impuestoEstimado)}</strong>
                </div>
                <div className="pedido-total-final">
                  <span>Total estimado</span>
                  <strong>{dinero(totalEstimado)}</strong>
                </div>
                <p>El total definitivo se calcula y valida en el servidor.</p>
              </div>

              <footer className="pedidos-modal-acciones">
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  className="btn-primary"
                  type="submit"
                  disabled={
                    guardando ||
                    productosActivos.length === 0 ||
                    productosSeleccionados.length === 0
                  }
                >
                  {guardando ? (
                    <LoaderCircle className="spinner-icono" size={17} />
                  ) : (
                    <CheckCircle2 size={17} />
                  )}
                  {guardando ? "Registrando..." : "Confirmar venta"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {pedidoDetalle && (
        <div className="pedidos-overlay">
          <section
            className="pedidos-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-detalle-pedido"
          >
            <header className="pedidos-modal-encabezado">
              <div>
                <span className="pedidos-modal-icono">
                  <Eye size={21} />
                </span>
                <div>
                  <h2 id="titulo-detalle-pedido">Pedido #{pedidoDetalle.id}</h2>
                  <p>Información de la venta</p>
                </div>
              </div>
              <button
                type="button"
                className="pedidos-cerrar"
                onClick={() => setPedidoDetalle(null)}
                aria-label="Cerrar detalle"
              >
                <X size={20} />
              </button>
            </header>

            {cargandoDetalle ? (
              <div className="pedidos-vacio">
                <LoaderCircle className="spinner-icono" size={26} />
                <p>Cargando detalle del pedido...</p>
              </div>
            ) : (
              <>
                <div className="pedido-detalle-datos">
                  <div>
                    <span>Fecha</span>
                    <strong>{fechaHora(pedidoDetalle.fecha)}</strong>
                  </div>
                  <div>
                    <span>Método de pago</span>
                    <strong>{nombreMetodo(pedidoDetalle.metodo_pago)}</strong>
                  </div>
                  <div>
                    <span>Estado</span>
                    <strong>{nombreEstado(pedidoDetalle.estado)}</strong>
                  </div>
                </div>

                <h3 className="pedido-detalle-subtitulo">Productos</h3>
                <div className="pedido-detalle-items">
                  {(Array.isArray(pedidoDetalle.items)
                    ? pedidoDetalle.items
                    : []
                  ).map((item, indice) => (
                    <div
                      className="pedido-detalle-item"
                      key={`${item.producto_id ?? item.producto}-${indice}`}
                    >
                      <div>
                        <strong>
                          {item.producto || item.nombre || "Producto"}
                        </strong>
                        <span>
                          {item.cantidad} × {dinero(item.precio_unitario)}
                        </span>
                      </div>
                      <strong>
                        {dinero(
                          Number(item.cantidad || 0) *
                            Number(item.precio_unitario || 0),
                        )}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="pedidos-totales detalle">
                  <div>
                    <span>Subtotal</span>
                    <strong>{dinero(pedidoDetalle.subtotal)}</strong>
                  </div>
                  <div>
                    <span>Impuesto</span>
                    <strong>{dinero(pedidoDetalle.impuesto)}</strong>
                  </div>
                  <div className="pedido-total-final">
                    <span>Total</span>
                    <strong>{dinero(pedidoDetalle.total)}</strong>
                  </div>
                </div>

                {!esAnulado(pedidoDetalle) && (
                  <div className="pedido-aviso-anulacion">
                    <Clock size={16} />
                    <span>
                      La anulación está sujeta al plazo de 15 minutos validado
                      por el servidor.
                    </span>
                  </div>
                )}

                <footer className="pedidos-modal-acciones">
                  {!esAnulado(pedidoDetalle) && (
                    <button
                      className="btn-danger"
                      type="button"
                      onClick={() => setPedidoAnular(pedidoDetalle)}
                    >
                      <Ban size={16} />
                      Anular pedido
                    </button>
                  )}
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={() => setPedidoDetalle(null)}
                  >
                    Cerrar
                  </button>
                </footer>
              </>
            )}
          </section>
        </div>
      )}

      {pedidoAnular && (
        <div className="pedidos-overlay">
          <section
            className="pedidos-modal pedidos-modal-confirmacion"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="titulo-confirmar-anulacion"
          >
            <span className="pedidos-confirmacion-icono">
              <Trash2 size={25} />
            </span>
            <h2 id="titulo-confirmar-anulacion">¿Anular este pedido?</h2>
            <p>
              Se solicitará al servidor anular el pedido #{pedidoAnular.id}. Si
              la anulación es válida, se restaurarán las existencias utilizadas.
              Esta acción no se puede deshacer desde esta pantalla.
            </p>
            {errorAccion && (
              <div className="pedidos-mensaje error" role="alert">
                <AlertTriangle size={18} />
                <span>{errorAccion}</span>
              </div>
            )}
            <footer className="pedidos-modal-acciones">
              <button
                className="btn-secondary"
                type="button"
                onClick={() => setPedidoAnular(null)}
                disabled={anulando}
              >
                Volver
              </button>
              <button
                className="btn-danger"
                type="button"
                onClick={confirmarAnulacion}
                disabled={anulando}
              >
                {anulando && (
                  <LoaderCircle className="spinner-icono" size={16} />
                )}
                {anulando ? "Anulando..." : "Confirmar anulación"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}
