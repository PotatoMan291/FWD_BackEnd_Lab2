import { Package, Pencil, Trash2, AlertTriangle } from "lucide-react";

const formatoCantidad = new Intl.NumberFormat("es-CR", {
  maximumFractionDigits: 2,
});

const nombresUnidad = {
  g: "Gramos",
  ml: "Mililitros",
  unidad: "Unidades",
};

export default function InsumoCard({ insumo, onEditar, onEliminar }) {
  const stock = Number(insumo.stock);
  const stockMinimo = Number(insumo.stock_minimo);

  const stockBajo = stock <= stockMinimo;
  const nombreUnidad = nombresUnidad[insumo.unidad] ?? insumo.unidad;

  return (
    <article className={`insumo-card ${stockBajo ? "insumo-card-bajo" : ""}`}>
      <div className="insumo-card-top">
        <div className={`insumo-icono ${stockBajo ? "alerta" : ""}`}>
          {stockBajo ? (
            <AlertTriangle size={23} strokeWidth={1.8} />
          ) : (
            <Package size={23} strokeWidth={1.8} />
          )}
        </div>

        <span className={`insumo-estado ${stockBajo ? "bajo" : "normal"}`}>
          <span className="estado-dot" />
          {stockBajo ? "Stock bajo" : "Disponible"}
        </span>
      </div>

      <div className="insumo-info">
        <span className="insumo-unidad">{nombreUnidad}</span>
        <h3>{insumo.nombre}</h3>
        <p>Código: {insumo.id}</p>
      </div>

      <div className="insumo-stock">
        <div>
          <span>Existencias</span>
          <strong className={stockBajo ? "texto-stock-bajo" : ""}>
            {formatoCantidad.format(stock)} {insumo.unidad}
          </strong>
        </div>

        <div>
          <span>Stock mínimo</span>
          <strong>
            {formatoCantidad.format(stockMinimo)} {insumo.unidad}
          </strong>
        </div>
      </div>

      {stockBajo && (
        <p className="insumo-alerta-texto">
          Las existencias están en el mínimo o por debajo de él.
        </p>
      )}

      <div className="insumo-acciones">
        <button
          type="button"
          className="btn-accion btn-editar"
          onClick={() => onEditar(insumo)}
          aria-label={`Editar ${insumo.nombre}`}
        >
          <Pencil size={15} />
          Editar
        </button>

        <button
          type="button"
          className="btn-accion btn-eliminar"
          onClick={() => onEliminar(insumo)}
          aria-label={`Eliminar ${insumo.nombre}`}
        >
          <Trash2 size={15} />
          Eliminar
        </button>
      </div>
    </article>
  );
}
