import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";

const estadoInicial = {
  nombre: "",
  categoria: "",
  precio: "",
  activo: true,
};

export default function ProductoForm({
  producto,
  onGuardar,
  onCerrar,
  guardando,
  error,
}) {
  const [formulario, setFormulario] = useState(estadoInicial);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (producto) {
      setFormulario({
        nombre: producto.nombre ?? producto.name ?? "",
        categoria: producto.categoria ?? producto.category ?? "",
        precio: String(producto.precio ?? producto.price ?? ""),
        activo: producto.activo !== false,
      });
    } else {
      setFormulario(estadoInicial);
    }

    setErrores({});
  }, [producto]);

  function cambiarCampo(evento) {
    const { name, value, type, checked } = evento.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrores((actual) => ({ ...actual, [name]: "" }));
  }

  function validar() {
    const nuevosErrores = {};
    const nombre = formulario.nombre.trim();
    const categoria = formulario.categoria.trim();
    const precio = Number(formulario.precio);

    if (!nombre) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    }

    if (!categoria) {
      nuevosErrores.categoria = "La categoría es obligatoria.";
    }

    if (formulario.precio === "" || !Number.isFinite(precio) || precio <= 0) {
      nuevosErrores.precio = "Ingresa un precio mayor que cero.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();

    if (!validar()) return;

    await onGuardar({
      nombre: formulario.nombre.trim(),
      categoria: formulario.categoria.trim(),
      precio: Number(formulario.precio),
      activo: formulario.activo,
    });
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget && !guardando) {
          onCerrar();
        }
      }}
    >
      <section
        className="producto-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="producto-form-titulo"
      >
        <header className="producto-modal-header">
          <div>
            <span className="section-kicker">CATÁLOGO</span>
            <h2 id="producto-form-titulo">
              {producto ? "Editar producto" : "Nuevo producto"}
            </h2>
            <p>
              {producto
                ? "Modifica los datos del producto seleccionado."
                : "Completa los datos para registrar un producto."}
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onCerrar}
            disabled={guardando}
            aria-label="Cerrar formulario"
          >
            <X size={20} />
          </button>
        </header>

        <form className="producto-form" onSubmit={manejarEnvio} noValidate>
          <label className="campo-formulario">
            Nombre del producto
            <input
              name="nombre"
              value={formulario.nombre}
              onChange={cambiarCampo}
              maxLength={100}
              placeholder="Ej. Cappuccino"
              aria-invalid={Boolean(errores.nombre)}
              required
            />
            {errores.nombre && (
              <span className="campo-error">{errores.nombre}</span>
            )}
          </label>

          <label className="campo-formulario">
            Categoría
            <input
              name="categoria"
              value={formulario.categoria}
              onChange={cambiarCampo}
              maxLength={60}
              placeholder="Ej. Café, Repostería, Bebidas"
              aria-invalid={Boolean(errores.categoria)}
              required
            />
            {errores.categoria && (
              <span className="campo-error">{errores.categoria}</span>
            )}
          </label>

          <label className="campo-formulario">
            Precio de venta (₡)
            <input
              name="precio"
              type="number"
              min="0.01"
              step="0.01"
              value={formulario.precio}
              onChange={cambiarCampo}
              placeholder="2500"
              aria-invalid={Boolean(errores.precio)}
              required
            />
            {errores.precio && (
              <span className="campo-error">{errores.precio}</span>
            )}
          </label>

          <label className="campo-checkbox">
            <input
              name="activo"
              type="checkbox"
              checked={formulario.activo}
              onChange={cambiarCampo}
            />
            Producto disponible para la venta
          </label>

          {error && (
            <div className="mensaje-error-api" role="alert">
              <strong>No se pudo guardar el producto.</strong>
              <span>{error}</span>
            </div>
          )}

          <footer className="producto-form-acciones">
            <button
              type="button"
              className="btn-secondary"
              onClick={onCerrar}
              disabled={guardando}
            >
              Cancelar
            </button>

            <button type="submit" className="btn-primary" disabled={guardando}>
              <Save size={16} />
              {guardando
                ? "Guardando..."
                : producto
                  ? "Guardar cambios"
                  : "Crear producto"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
