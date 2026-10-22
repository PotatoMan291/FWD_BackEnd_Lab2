import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";

export default function RecetaForm({
  receta,
  productos,
  insumos,
  onGuardar,
  onCerrar,
  guardando,
}) {
  const [productoId, setProductoId] = useState("");
  const [insumoId, setInsumoId] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setProductoId(receta ? String(receta.producto_id) : "");
    setInsumoId(receta ? String(receta.insumo_id) : "");
    setCantidad(receta ? String(receta.cantidad) : "");
    setError("");
  }, [receta]);

  const insumoSeleccionado = insumos.find(
    (insumo) => String(insumo.id) === insumoId,
  );

  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    setError("");

    if (!productoId || !insumoId) {
      setError("Selecciona un producto y un insumo.");
      return;
    }

    const cantidadNumerica = Number(cantidad);

    if (!Number.isFinite(cantidadNumerica) || cantidadNumerica <= 0) {
      setError("La cantidad debe ser un número mayor que cero.");
      return;
    }

    try {
      await onGuardar({
        producto_id: Number(productoId),
        insumo_id: Number(insumoId),
        cantidad: cantidadNumerica,
      });
    } catch (err) {
      setError(err.message || "No se pudo guardar la receta.");
    }
  };

  return (
    <div
      className="recetas-overlay"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget && !guardando) {
          onCerrar();
        }
      }}
    >
      <section
        className="recetas-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-formulario-receta"
      >
        <header className="recetas-modal-encabezado">
          <div>
            <span className="recetas-modal-icono">
              <AlertCircle size={21} />
            </span>
            <div>
              <h2 id="titulo-formulario-receta">
                {receta ? "Editar receta" : "Nueva receta"}
              </h2>
              <p>Define el insumo y la cantidad necesaria para el producto.</p>
            </div>
          </div>

          <button
            type="button"
            className="recetas-cerrar"
            onClick={onCerrar}
            disabled={guardando}
            aria-label="Cerrar formulario"
          >
            <X size={19} />
          </button>
        </header>

        <form onSubmit={manejarEnvio}>
          {error && (
            <div className="recetas-error" role="alert">
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}

          <div className="recetas-campo">
            <label htmlFor="receta-producto">Producto</label>
            <select
              id="receta-producto"
              value={productoId}
              onChange={(evento) => setProductoId(evento.target.value)}
              disabled={guardando || Boolean(receta)}
              required
            >
              <option value="">Selecciona un producto</option>
              {productos.map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre}
                </option>
              ))}
            </select>
            {receta && (
              <small>
                Para cambiar el producto, elimina esta relación y crea otra.
              </small>
            )}
          </div>

          <div className="recetas-campo">
            <label htmlFor="receta-insumo">Insumo</label>
            <select
              id="receta-insumo"
              value={insumoId}
              onChange={(evento) => setInsumoId(evento.target.value)}
              disabled={guardando || Boolean(receta)}
              required
            >
              <option value="">Selecciona un insumo</option>
              {insumos.map((insumo) => (
                <option key={insumo.id} value={insumo.id}>
                  {insumo.nombre} ({insumo.unidad})
                </option>
              ))}
            </select>
            {receta && (
              <small>
                Para cambiar el insumo, elimina esta relación y crea otra.
              </small>
            )}
          </div>

          <div className="recetas-campo">
            <label htmlFor="receta-cantidad">
              Cantidad necesaria
              {insumoSeleccionado ? ` (${insumoSeleccionado.unidad})` : ""}
            </label>
            <input
              id="receta-cantidad"
              type="number"
              min="0.01"
              step="any"
              value={cantidad}
              onChange={(evento) => setCantidad(evento.target.value)}
              placeholder="Ej. 18"
              required
              disabled={guardando}
            />
            <small>
              Introduce una cantidad mayor que cero usando la unidad del insumo.
            </small>
          </div>

          <footer className="recetas-modal-acciones">
            <button
              className="btn-secondary"
              type="button"
              onClick={onCerrar}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              className="btn-primary"
              type="submit"
              disabled={
                guardando || productos.length === 0 || insumos.length === 0
              }
            >
              {guardando
                ? "Guardando..."
                : receta
                  ? "Guardar cambios"
                  : "Crear receta"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
