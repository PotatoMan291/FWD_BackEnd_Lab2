import { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  RefreshCw,
  Coffee,
  Plus,
  X,
  Trash2,
} from "lucide-react";

import useFetch from "../hooks/useFetch";
import {
  getProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../services/api";

import ProductoCard from "../components/ProductoCard";
import ProductoForm from "../components/ProductoForm";

export default function Productos() {
  const { data, loading, error, reload } = useFetch(getProductos, []);

  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas");
  const [orden, setOrden] = useState("nombre-asc");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState("");

  const [productoPorEliminar, setProductoPorEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");

  const [mensajeExito, setMensajeExito] = useState("");

  const productos = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }, [data]);

  const categorias = useMemo(() => {
    return [
      ...new Set(
        productos
          .map((producto) => producto.categoria ?? producto.category)
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b, "es"));
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es");

    const resultado = productos.filter((producto) => {
      const nombre = String(
        producto.nombre ?? producto.name ?? "",
      ).toLocaleLowerCase("es");

      const categoria = String(producto.categoria ?? producto.category ?? "");

      return (
        nombre.includes(termino) &&
        (categoriaSeleccionada === "todas" ||
          categoria === categoriaSeleccionada)
      );
    });

    return resultado.sort((a, b) => {
      const nombreA = String(a.nombre ?? a.name ?? "");
      const nombreB = String(b.nombre ?? b.name ?? "");
      const precioA = Number(a.precio ?? a.price ?? 0);
      const precioB = Number(b.precio ?? b.price ?? 0);

      switch (orden) {
        case "nombre-desc":
          return nombreB.localeCompare(nombreA, "es");
        case "precio-asc":
          return precioA - precioB;
        case "precio-desc":
          return precioB - precioA;
        default:
          return nombreA.localeCompare(nombreB, "es");
      }
    });
  }, [productos, busqueda, categoriaSeleccionada, orden]);

  function abrirCrear() {
    setProductoEditando(null);
    setErrorFormulario("");
    setMensajeExito("");
    setModalAbierto(true);
  }

  function abrirEditar(producto) {
    setProductoEditando(producto);
    setErrorFormulario("");
    setMensajeExito("");
    setModalAbierto(true);
  }

  function cerrarFormulario() {
    if (guardando) return;

    setModalAbierto(false);
    setProductoEditando(null);
    setErrorFormulario("");
  }

  async function guardarProducto(datos) {
    setGuardando(true);
    setErrorFormulario("");
    setMensajeExito("");

    try {
      if (productoEditando) {
        const id = productoEditando.id ?? productoEditando.producto_id;

        if (id == null) {
          throw new Error("No se encontró el identificador del producto.");
        }

        await actualizarProducto(id, datos);
        setMensajeExito("Producto actualizado correctamente.");
      } else {
        await crearProducto(datos);
        setMensajeExito("Producto creado correctamente.");
      }

      setModalAbierto(false);
      setProductoEditando(null);
      await reload();
    } catch (err) {
      setErrorFormulario(
        err.message || "Ocurrió un error al guardar el producto.",
      );
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarEliminar() {
    if (!productoPorEliminar) return;

    const id = productoPorEliminar.id ?? productoPorEliminar.producto_id;

    if (id == null) {
      setErrorEliminar("No se encontró el identificador del producto.");
      return;
    }

    setEliminando(true);
    setErrorEliminar("");
    setMensajeExito("");

    try {
      await eliminarProducto(id);
      setProductoPorEliminar(null);
      setMensajeExito("Producto eliminado correctamente.");
      await reload();
    } catch (err) {
      setErrorEliminar(
        err.message || "Ocurrió un error al eliminar el producto.",
      );
    } finally {
      setEliminando(false);
    }
  }

  return (
    <div className="productos-page">
      <div className="welcome-row">
        <div>
          <span className="section-kicker">CATÁLOGO DE LA CAFETERÍA</span>
          <h2>Nuestros productos</h2>
          <p>Administra los productos y sus precios de venta.</p>
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
            Nuevo producto
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

      <section className="productos-toolbar">
        <label className="busqueda-productos">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar productos por nombre"
          />
        </label>

        <label className="filtro-control">
          <SlidersHorizontal size={16} aria-hidden="true" />
          <select
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            aria-label="Filtrar por categoría"
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </label>

        <label className="filtro-control">
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            aria-label="Ordenar productos"
          >
            <option value="nombre-asc">Nombre: A–Z</option>
            <option value="nombre-desc">Nombre: Z–A</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
          </select>
        </label>
      </section>

      <div className="productos-resultados">
        <span>
          {loading
            ? "Cargando catálogo..."
            : `${productosFiltrados.length} ${
                productosFiltrados.length === 1 ? "producto" : "productos"
              }`}
        </span>
        <span>Catálogo de productos</span>
      </div>

      {loading && (
        <div className="estado-panel">
          <div className="spinner" />
          <p>Cargando productos desde el servidor...</p>
        </div>
      )}

      {!loading && error && (
        <div className="estado-panel estado-error">
          <h3>No se pudo cargar el catálogo</h3>
          <p>{error}</p>
          <button type="button" className="btn-primary" onClick={reload}>
            Intentar de nuevo
          </button>
        </div>
      )}

      {!loading && !error && productos.length === 0 && (
        <div className="estado-panel">
          <Coffee size={32} />
          <h3>El catálogo está vacío</h3>
          <p>Registra tu primer producto para comenzar.</p>
          <button type="button" className="btn-primary" onClick={abrirCrear}>
            <Plus size={16} />
            Crear producto
          </button>
        </div>
      )}

      {!loading &&
        !error &&
        productos.length > 0 &&
        productosFiltrados.length === 0 && (
          <div className="estado-panel">
            <Search size={30} />
            <h3>No hay resultados</h3>
            <p>Prueba con otro nombre o cambia los filtros.</p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setBusqueda("");
                setCategoriaSeleccionada("todas");
              }}
            >
              Limpiar filtros
            </button>
          </div>
        )}

      {!loading && !error && productosFiltrados.length > 0 && (
        <div className="productos-grid">
          {productosFiltrados.map((producto, index) => (
            <ProductoCard
              key={producto.id ?? producto.producto_id ?? index}
              producto={producto}
              onEditar={abrirEditar}
              onEliminar={(seleccionado) => {
                setProductoPorEliminar(seleccionado);
                setErrorEliminar("");
              }}
            />
          ))}
        </div>
      )}

      {modalAbierto && (
        <ProductoForm
          producto={productoEditando}
          onGuardar={guardarProducto}
          onCerrar={cerrarFormulario}
          guardando={guardando}
          error={errorFormulario}
        />
      )}

      {productoPorEliminar && (
        <div
          className="modal-overlay"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget && !eliminando) {
              setProductoPorEliminar(null);
              setErrorEliminar("");
            }
          }}
        >
          <section
            className="producto-modal confirmacion-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="eliminar-titulo"
          >
            <div className="confirmacion-icono">
              <Trash2 size={25} />
            </div>

            <h2 id="eliminar-titulo">¿Eliminar este producto?</h2>
            <p>
              Vas a eliminar{" "}
              <strong>
                {productoPorEliminar.nombre ??
                  productoPorEliminar.name ??
                  "este producto"}
              </strong>
              . Esta acción no se puede deshacer.
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
                  setProductoPorEliminar(null);
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
