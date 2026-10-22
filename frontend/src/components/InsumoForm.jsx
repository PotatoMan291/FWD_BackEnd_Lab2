import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";

const formularioInicial = {
  nombre: "",
  unidad: "g",
  stock: "0",
  stock_minimo: "0",
};

export default function InsumoForm({
  insumo,
  onGuardar,
  onCerrar,
  guardando,
  error,
}) {
  const [formulario, setFormulario] = useState(formularioInicial);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (insumo) {
      setFormulario({
        nombre: insumo.nombre ?? "",
        unidad: insumo.unidad ?? "g",
        stock: String(insumo.stock ?? 0),
        stock_minimo: String(insumo.stock_minimo ?? 0),
      });
    } else {
      setFormulario(formularioInicial);
    }

    setErrores({});
  }, [insumo]);

  function cambiarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }));

    setErrores((actual) => ({
      ...actual,
      [name]: "",
    }));
  }

  function validar() {
    const nuevosErrores = {};
    const nombre = formulario.nombre.trim();

    if (!nombre) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    } else if (nombre.length > 100) {
      nuevosErrores.nombre = "El nombre no puede superar 100 caracteres.";
    }

    if (!["g", "ml", "unidad"].includes(formulario.unidad)) {
      nuevosErrores.unidad = "Selecciona una unidad válida.";
    }

    for (const campo of ["stock", "stock_minimo"]) {
      const valor = formulario[campo];

      if (valor.trim() === "") {
        nuevosErrores[campo] = "Este campo es obligatorio.";
        continue;
      }

      const cantidad = Number(valor);

      if (!Number.isFinite(cantidad) || cantidad < 0) {
        nuevosErrores[campo] =
          "La cantidad debe ser un número igual o mayor que cero.";
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();

    if (!validar()) return;

    await onGuardar({
      nombre: formulario.nombre.trim(),
      unidad: formulario.unidad,
      stock: Number(formulario.stock),
      stock_minimo: Number(formulario.stock_minimo),
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
        aria-labelledby="insumo-form-titulo"
      >
        <header className="producto-modal-header">
          <div>
            <span className="section-kicker">CONTROL DE INVENTARIO</span>

            <h2 id="insumo-form-titulo">
              {insumo ? "Editar insumo" : "Nuevo insumo"}
            </h2>

            <p>
              {insumo
                ? "Actualiza las existencias o el nivel mínimo."
                : "Registra un insumo para controlar las existencias."}
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
            Nombre del insumo
            <input
              name="nombre"
              value={formulario.nombre}
              onChange={cambiarCampo}
              maxLength={100}
              placeholder="Ej. Café en grano"
              aria-invalid={Boolean(errores.nombre)}
              required
            />
            {errores.nombre && (
              <span className="campo-error">{errores.nombre}</span>
            )}
          </label>

          <label className="campo-formulario">
            Unidad de medida
            <select
              name="unidad"
              value={formulario.unidad}
              onChange={cambiarCampo}
              aria-invalid={Boolean(errores.unidad)}
              required
            >
              <option value="g">Gramos (g)</option>
              <option value="ml">Mililitros (ml)</option>
              <option value="unidad">Unidades</option>
            </select>
            {errores.unidad && (
              <span className="campo-error">{errores.unidad}</span>
            )}
          </label>

          <label className="campo-formulario">
            Existencias actuales
            <input
              name="stock"
              type="number"
              min="0"
              step="0.01"
              value={formulario.stock}
              onChange={cambiarCampo}
              aria-invalid={Boolean(errores.stock)}
              required
            />
            {errores.stock && (
              <span className="campo-error">{errores.stock}</span>
            )}
          </label>

          <label className="campo-formulario">
            Nivel mínimo de existencias
            <input
              name="stock_minimo"
              type="number"
              min="0"
              step="0.01"
              value={formulario.stock_minimo}
              onChange={cambiarCampo}
              aria-invalid={Boolean(errores.stock_minimo)}
              required
            />
            {errores.stock_minimo && (
              <span className="campo-error">{errores.stock_minimo}</span>
            )}
          </label>

          {error && (
            <div className="mensaje-error-api" role="alert">
              <strong>No se pudo guardar el insumo.</strong>
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
                : insumo
                  ? "Guardar cambios"
                  : "Registrar insumo"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
