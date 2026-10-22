import { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  RefreshCw,
  Package,
  Plus,
  X,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import useFetch from "../hooks/useFetch";
import {
  getInsumos,
  crearInsumo,
  actualizarInsumo,
  eliminarInsumo,
} from "../services/api";

import InsumoCard from "../components/InsumoCard";
import InsumoForm from "../components/InsumoForm";

const nombresUnidad = {
  g: "Gramos",
  ml: "Mililitros",
  unidad: "Unidades",
};

export default function Insumos() {
  const { data, loading, error, reload } = useFetch(getInsumos, []);

  const [busqueda, setBusqueda] = useState("");
  const [unidadSeleccionada, setUnidadSeleccionada] = useState("todas");
  const [orden, setOrden] = useState("nombre-asc");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [insumoEditando, setInsumoEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState("");

  const [insumoPorEliminar, setInsumoPorEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");

  const [mensajeExito, setMensajeExito] = useState("");

  const insumos = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }, [data]);

  const resumen = useMemo(() => {
    const stockBajo = insumos.filter(
      (insumo) => Number(insumo.stock) <= Number(insumo.stock_minimo),
    );

    return {
      total: insumos.length,
      stockBajo: stockBajo.length,
      sinExistencias: insumos.filter((insumo) => Number(insumo.stock) === 0)
        .length,
    };
  }, [insumos]);

  const insumosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es");

    const resultado = insumos.filter((insumo) => {
      const nombre = String(insumo.nombre ?? "").toLocaleLowerCase("es");

      const coincideNombre = nombre.includes(termino);
      const coincideUnidad =
        unidadSeleccionada === "todas" || insumo.unidad === unidadSeleccionada;

      return coincideNombre && coincideUnidad;
    });

    return resultado.sort((a, b) => {
      const nombreA = String(a.nombre ?? "");
      const nombreB = String(b.nombre ?? "");
      const stockA = Number(a.stock);
      const stockB = Number(b.stock);

      switch (orden) {
        case "nombre-desc":
          return nombreB.localeCompare(nombreA, "es");
        case "stock-asc":
          return stockA - stockB;
        case "stock-desc":
          return stockB - stockA;
        default:
          return nombreA.localeCompare(nombreB, "es");
      }
    });
  }, [insumos, busqueda, unidadSeleccionada, orden]);

  function abrirCrear() {
    setInsumoEditando(null);
    setErrorFormulario("");
    setMensajeExito("");
    setModalAbierto(true);
  }

  function abrirEditar(insumo) {
    setInsumoEditando(insumo);
    setErrorFormulario("");
    setMensajeExito("");
    setModalAbierto(true);
  }

  function cerrarFormulario() {
    if (guardando) return;

    setModalAbierto(false);
    setInsumoEditando(null);
    setErrorFormulario("");
  }

  async function guardarInsumo(datos) {
    setGuardando(true);
    setErrorFormulario("");
    setMensajeExito("");

    try {
      if (insumoEditando) {
        await actualizarInsumo(insumoEditando.id, datos);
        setMensajeExito("Insumo actualizado correctamente.");
      } else {
        await crearInsumo(datos);
        setMensajeExito("Insumo registrado correctamente.");
      }

      setModalAbierto(false);
      setInsumoEditando(null);
      await reload();
    } catch (err) {
      setErrorFormulario(
        err.message || "Ocurrió un error al guardar el insumo.",
      );
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarEliminar() {
    if (!insumoPorEliminar) return;

    setEliminando(true);
    setErrorEliminar("");
    setMensajeExito("");

    try {
      await eliminarInsumo(insumoPorEliminar.id);
      setInsumoPorEliminar(null);
      setMensajeExito("Insumo eliminado correctamente.");
      await reload();
    } catch (err) {
      setErrorEliminar(
        err.message || "Ocurrió un error al eliminar el insumo.",
      );
    } finally {
      setEliminando(false);
    }
  }

  return (
    <div className="productos-page">
      <div className="welcome-row">
        <div>
          <span className="section-kicker">CONTROL DE EXISTENCIAS</span>
          <h2>Inventario de insumos</h2>
          <p>Controla los materiales y detecta cuándo necesitan reposición.</p>
        </div>

        <div className="productos-header-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={reload}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            Actualizar
          </button>

          <button type="button" className="btn-primary" onClick={abrirCrear}>
            <Plus size={17} />
            Nuevo insumo
          </button>
        </div>
      </div>

      {mensajeExito && (
        <div className="mensaje-exito" role="status">
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

      <section className="inventario-resumen">
        <article className="inventario-metrica">
          <span className="inventario-metrica-icono">
            <Package size={20} />
          </span>
          <div>
            <span>Total de insumos</span>
            <strong>{loading ? "—" : resumen.total}</strong>
          </div>
        </article>

        <article className="inventario-metrica">
          <span className="inventario-metrica-icono advertencia">
            <AlertTriangle size={20} />
          </span>
          <div>
            <span>En nivel mínimo o inferior</span>
            <strong>{loading ? "—" : resumen.stockBajo}</strong>
          </div>
        </article>

        <article className="inventario-metrica">
          <span className="inventario-metrica-icono sin-stock">
            <Package size={20} />
          </span>
          <div>
            <span>Sin existencias</span>
            <strong>{loading ? "—" : resumen.sinExistencias}</strong>
          </div>
        </article>
      </section>

      <section className="productos-toolbar">
        <label className="busqueda-productos">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar insumo por nombre..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            aria-label="Buscar insumos por nombre"
          />
        </label>

        <label className="filtro-control">
          <SlidersHorizontal size={16} aria-hidden="true" />
          <select
            value={unidadSeleccionada}
            onChange={(evento) => setUnidadSeleccionada(evento.target.value)}
            aria-label="Filtrar por unidad"
          >
            <option value="todas">Todas las unidades</option>
            {Object.entries(nombresUnidad).map(([valor, nombre]) => (
              <option key={valor} value={valor}>
                {nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="filtro-control">
          <select
            value={orden}
            onChange={(evento) => setOrden(evento.target.value)}
            aria-label="Ordenar insumos"
          >
            <option value="nombre-asc">Nombre: A–Z</option>
            <option value="nombre-desc">Nombre: Z–A</option>
            <option value="stock-asc">Existencias: menor a mayor</option>
            <option value="stock-desc">Existencias: mayor a menor</option>
          </select>
        </label>
      </section>

      <div className="productos-resultados">
        <span>
          {loading
            ? "Cargando inventario..."
            : `${insumosFiltrados.length} ${
                insumosFiltrados.length === 1 ? "insumo" : "insumos"
              }`}
        </span>
        <span>Existencias y niveles mínimos</span>
      </div>

      {loading && (
        <div className="estado-panel">
          <div className="spinner" />
          <p>Cargando inventario desde el servidor...</p>
        </div>
      )}

      {!loading && error && (
        <div className="estado-panel estado-error">
          <h3>No se pudo cargar el inventario</h3>
          <p>{error}</p>
          <button type="button" className="btn-primary" onClick={reload}>
            Intentar de nuevo
          </button>
        </div>
      )}

      {!loading && !error && insumos.length === 0 && (
        <div className="estado-panel">
          <Package size={32} />
          <h3>El inventario está vacío</h3>
          <p>
            Registra tu primer insumo para comenzar a controlar las existencias.
          </p>
          <button type="button" className="btn-primary" onClick={abrirCrear}>
            <Plus size={16} />
            Registrar insumo
          </button>
        </div>
      )}

      {!loading &&
        !error &&
        insumos.length > 0 &&
        insumosFiltrados.length === 0 && (
          <div className="estado-panel">
            <Search size={30} />
            <h3>No hay resultados</h3>
            <p>Prueba con otro nombre o cambia la unidad seleccionada.</p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setBusqueda("");
                setUnidadSeleccionada("todas");
              }}
            >
              Limpiar filtros
            </button>
          </div>
        )}

      {!loading && !error && insumosFiltrados.length > 0 && (
        <div className="productos-grid">
          {insumosFiltrados.map((insumo) => (
            <InsumoCard
              key={insumo.id}
              insumo={insumo}
              onEditar={abrirEditar}
              onEliminar={(seleccionado) => {
                setInsumoPorEliminar(seleccionado);
                setErrorEliminar("");
              }}
            />
          ))}
        </div>
      )}

      {modalAbierto && (
        <InsumoForm
          insumo={insumoEditando}
          onGuardar={guardarInsumo}
          onCerrar={cerrarFormulario}
          guardando={guardando}
          error={errorFormulario}
        />
      )}

      {insumoPorEliminar && (
        <div
          className="modal-overlay"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget && !eliminando) {
              setInsumoPorEliminar(null);
              setErrorEliminar("");
            }
          }}
        >
          <section
            className="producto-modal confirmacion-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="eliminar-insumo-titulo"
          >
            <div className="confirmacion-icono">
              <Trash2 size={25} />
            </div>

            <h2 id="eliminar-insumo-titulo">¿Eliminar este insumo?</h2>

            <p>
              Vas a eliminar <strong>{insumoPorEliminar.nombre}</strong>. Si
              está asociado a una receta, el servidor puede impedir la
              eliminación para proteger la integridad de los datos.
            </p>

            {errorEliminar && (
              <div className="mensaje-error-api" role="alert">
                {errorEliminar}
              </div>
            )}

            <div className="producto-form-acciones">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setInsumoPorEliminar(null);
                  setErrorEliminar("");
                }}
                disabled={eliminando}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn-danger"
                onClick={confirmarEliminar}
                disabled={eliminando}
              >
                <Trash2 size={16} />
                {eliminando ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
