import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Beaker,
  CheckCircle2,
  ClipboardList,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  getRecetas,
  getProductos,
  getInsumos,
  crearReceta,
  actualizarReceta,
  eliminarReceta,
} from "../services/api";

import RecetaCard from "../components/RecetaCard";
import RecetaForm from "../components/RecetaForm";

const obtenerLista = (respuesta) => {
  if (Array.isArray(respuesta)) return respuesta;
  if (Array.isArray(respuesta?.data)) return respuesta.data;
  if (Array.isArray(respuesta?.recetas)) return respuesta.recetas;
  return [];
};

export default function Recetas() {
  const [recetas, setRecetas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [insumos, setInsumos] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [productoFiltro, setProductoFiltro] = useState("todos");

  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [recetaEditar, setRecetaEditar] = useState(null);
  const [recetaEliminar, setRecetaEliminar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setErrorCarga("");

    try {
      const [respuestaRecetas, respuestaProductos, respuestaInsumos] =
        await Promise.all([getRecetas(), getProductos(), getInsumos()]);

      setRecetas(obtenerLista(respuestaRecetas));
      setProductos(obtenerLista(respuestaProductos));
      setInsumos(obtenerLista(respuestaInsumos));
    } catch (err) {
      setErrorCarga(err.message || "No se pudieron cargar las recetas.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const recetasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return recetas.filter((receta) => {
      const coincideTexto =
        !termino ||
        String(receta.producto || "")
          .toLowerCase()
          .includes(termino) ||
        String(receta.insumo || "")
          .toLowerCase()
          .includes(termino) ||
        String(receta.id).includes(termino);

      const coincideProducto =
        productoFiltro === "todos" ||
        String(receta.producto_id) === productoFiltro;

      return coincideTexto && coincideProducto;
    });
  }, [recetas, busqueda, productoFiltro]);

  const abrirNueva = () => {
    setRecetaEditar(null);
    setErrorAccion("");
    setMensajeExito("");
    setMostrarFormulario(true);
  };

  const abrirEdicion = (receta) => {
    setRecetaEditar(receta);
    setErrorAccion("");
    setMensajeExito("");
    setMostrarFormulario(true);
  };

  const guardarReceta = async (datos) => {
    setGuardando(true);
    setErrorAccion("");

    try {
      if (recetaEditar) {
        await actualizarReceta(recetaEditar.id, datos);
        setMensajeExito("La receta se actualizó correctamente.");
      } else {
        await crearReceta(datos);
        setMensajeExito("La receta se creó correctamente.");
      }

      setMostrarFormulario(false);
      setRecetaEditar(null);
      await cargarDatos();
    } catch (err) {
      setErrorAccion(err.message || "No se pudo guardar la receta.");
      throw err;
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminacion = async () => {
    if (!recetaEliminar) return;

    setEliminando(true);
    setErrorAccion("");

    try {
      await eliminarReceta(recetaEliminar.id);
      setRecetaEliminar(null);
      setMensajeExito("La receta se eliminó correctamente.");
      await cargarDatos();
    } catch (err) {
      setErrorAccion(err.message || "No se pudo eliminar la receta.");
    } finally {
      setEliminando(false);
    }
  };

  if (cargando) {
    return (
      <section className="recetas-page">
        <div className="estado-panel">
          <LoaderCircle className="spinner-icono" size={28} />
          <h2>Cargando recetas</h2>
          <p>Consultando los insumos de cada producto...</p>
        </div>
      </section>
    );
  }

  if (errorCarga) {
    return (
      <section className="recetas-page">
        <div className="estado-panel">
          <AlertTriangle size={32} />
          <h2>No se pudieron cargar las recetas</h2>
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
    <section className="recetas-page">
      <header className="recetas-encabezado">
        <div>
          <span className="recetas-etiqueta">
            <Beaker size={15} />
            CAFÉ CENTRAL
          </span>
          <h1>Recetas de productos</h1>
          <p>
            Define las cantidades de insumos necesarias para preparar cada
            producto.
          </p>
        </div>

        <button
          className="btn-primary"
          type="button"
          onClick={abrirNueva}
          disabled={productos.length === 0 || insumos.length === 0}
        >
          <Plus size={18} />
          Nueva receta
        </button>
      </header>

      {mensajeExito && (
        <div className="recetas-mensaje exito" role="status">
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
        <div className="recetas-mensaje error" role="alert">
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

      <div className="recetas-resumen">
        <article>
          <span className="recetas-resumen-icono">
            <ClipboardList size={22} />
          </span>
          <div>
            <span>Relaciones registradas</span>
            <strong>{recetas.length}</strong>
          </div>
        </article>

        <article>
          <span className="recetas-resumen-icono secundario">
            <Beaker size={22} />
          </span>
          <div>
            <span>Productos con receta</span>
            <strong>
              {new Set(recetas.map((receta) => receta.producto_id)).size}
            </strong>
          </div>
        </article>
      </div>

      <div className="recetas-herramientas">
        <label className="recetas-busqueda">
          <Search size={18} />
          <input
            type="search"
            placeholder="Buscar por producto o insumo..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </label>

        <select
          value={productoFiltro}
          onChange={(evento) => setProductoFiltro(evento.target.value)}
          aria-label="Filtrar por producto"
        >
          <option value="todos">Todos los productos</option>
          {productos.map((producto) => (
            <option key={producto.id} value={String(producto.id)}>
              {producto.nombre}
            </option>
          ))}
        </select>

        <button
          className="recetas-actualizar"
          type="button"
          onClick={cargarDatos}
          title="Actualizar recetas"
          aria-label="Actualizar recetas"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {productos.length === 0 || insumos.length === 0 ? (
        <div className="recetas-aviso">
          <AlertTriangle size={20} />
          <div>
            <strong>Faltan datos para crear recetas</strong>
            <p>Primero necesitas registrar al menos un producto y un insumo.</p>
          </div>
        </div>
      ) : null}

      {recetasFiltradas.length === 0 ? (
        <div className="recetas-vacio">
          <Beaker size={36} />
          <h2>
            {recetas.length === 0
              ? "Todavía no hay recetas"
              : "No se encontraron recetas"}
          </h2>
          <p>
            {recetas.length === 0
              ? "Crea una receta para relacionar un producto con un insumo."
              : "Prueba otra búsqueda o cambia el filtro de producto."}
          </p>
          {recetas.length === 0 &&
            productos.length > 0 &&
            insumos.length > 0 && (
              <button
                className="btn-primary"
                type="button"
                onClick={abrirNueva}
              >
                <Plus size={17} />
                Crear primera receta
              </button>
            )}
        </div>
      ) : (
        <>
          <div className="recetas-resultados">
            <strong>{recetasFiltradas.length} recetas</strong>
            <span>Una tarjeta por cada insumo asociado.</span>
          </div>

          <div className="recetas-grid">
            {recetasFiltradas.map((receta) => (
              <RecetaCard
                key={receta.id}
                receta={receta}
                onEditar={abrirEdicion}
                onEliminar={setRecetaEliminar}
              />
            ))}
          </div>
        </>
      )}

      {mostrarFormulario && (
        <RecetaForm
          receta={recetaEditar}
          productos={productos}
          insumos={insumos}
          onGuardar={guardarReceta}
          onCerrar={() => {
            setMostrarFormulario(false);
            setRecetaEditar(null);
            setErrorAccion("");
          }}
          guardando={guardando}
        />
      )}

      {recetaEliminar && (
        <div className="recetas-overlay">
          <section
            className="recetas-modal recetas-modal-confirmacion"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="titulo-eliminar-receta"
          >
            <span className="recetas-confirmacion-icono">
              <Trash2 size={24} />
            </span>
            <h2 id="titulo-eliminar-receta">¿Eliminar esta receta?</h2>
            <p>
              Se eliminará la relación entre{" "}
              <strong>{recetaEliminar.producto}</strong> y{" "}
              <strong>{recetaEliminar.insumo}</strong>. Esta acción no se puede
              deshacer.
            </p>

            {errorAccion && (
              <div className="recetas-error" role="alert">
                <AlertTriangle size={17} />
                <span>{errorAccion}</span>
              </div>
            )}

            <footer className="recetas-modal-acciones">
              <button
                className="btn-secondary"
                type="button"
                onClick={() => {
                  setRecetaEliminar(null);
                  setErrorAccion("");
                }}
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button
                className="btn-danger"
                type="button"
                onClick={confirmarEliminacion}
                disabled={eliminando}
              >
                {eliminando ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}
