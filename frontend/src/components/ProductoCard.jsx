import { Coffee, Tag, Pencil, Trash2 } from "lucide-react";

const formatoPrecio = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
  minimumFractionDigits: 2,
});

export default function ProductoCard({ producto, onEditar, onEliminar }) {
  const nombre = producto.nombre ?? producto.name ?? "Producto sin nombre";
  const categoria = producto.categoria ?? producto.category ?? "Sin categoría";
  const precio = Number(producto.precio ?? producto.price ?? 0);
  const activo = producto.activo !== false;

  return (
    <article className="producto-card">
      <div className="producto-card-top">
        <div className="producto-icon">
          <Coffee size={23} strokeWidth={1.8} />
        </div>

        <span className={`producto-estado ${activo ? "activo" : "inactivo"}`}>
          <span className="estado-dot" />
          {activo ? "Disponible" : "Inactivo"}
        </span>
      </div>

      <div className="producto-info">
        <span className="producto-categoria">
          <Tag size={13} />
          {categoria}
        </span>

        <h3>{nombre}</h3>

        <p className="producto-id">
          Código: {producto.id ?? producto.producto_id ?? "—"}
        </p>
      </div>

      <div className="producto-card-footer">
        <span>Precio de venta</span>
        <strong>{formatoPrecio.format(precio)}</strong>
      </div>

      <div className="producto-acciones">
        <button
          type="button"
          className="btn-accion btn-editar"
          onClick={() => onEditar(producto)}
          aria-label={`Editar ${nombre}`}
        >
          <Pencil size={15} />
          Editar
        </button>

        <button
          type="button"
          className="btn-accion btn-eliminar"
          onClick={() => onEliminar(producto)}
          aria-label={`Eliminar ${nombre}`}
        >
          <Trash2 size={15} />
          Eliminar
        </button>
      </div>
    </article>
  );
}
