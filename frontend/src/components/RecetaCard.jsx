import { Beaker, Pencil, Trash2 } from "lucide-react";

export default function RecetaCard({ receta, onEditar, onEliminar }) {
  return (
    <article className="receta-card">
      <div className="receta-card-superior">
        <span className="receta-card-icono">
          <Beaker size={22} />
        </span>
        <span className="receta-card-id">Receta #{receta.id}</span>
      </div>

      <div className="receta-card-contenido">
        <span className="receta-card-etiqueta">PRODUCTO</span>
        <h3>{receta.producto || `Producto #${receta.producto_id}`}</h3>

        <div className="receta-card-relacion">
          <span className="receta-card-etiqueta">INSUMO REQUERIDO</span>
          <strong>{receta.insumo || `Insumo #${receta.insumo_id}`}</strong>
        </div>
      </div>

      <div className="receta-card-cantidad">
        <span>Cantidad por producto</span>
        <strong>
          {Number(receta.cantidad).toLocaleString("es-CR", {
            maximumFractionDigits: 4,
          })}{" "}
          <small>{receta.unidad}</small>
        </strong>
      </div>

      <footer className="receta-card-acciones">
        <button
          className="btn-secondary"
          type="button"
          onClick={() => onEditar(receta)}
        >
          <Pencil size={15} />
          Editar cantidad
        </button>
        <button
          className="btn-danger"
          type="button"
          onClick={() => onEliminar(receta)}
          aria-label={`Eliminar receta ${receta.id}`}
          title="Eliminar receta"
        >
          <Trash2 size={16} />
        </button>
      </footer>
    </article>
  );
}
