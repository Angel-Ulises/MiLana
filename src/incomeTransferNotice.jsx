// Visible únicamente tras una transferencia voluntaria y de un solo uso.
export default function IncomeTransferNotice({ onClear }) {
  return (
    <aside className="ml-income-arrived" aria-label="Ingreso importado de Bruto a Neto">
      <div>
        <span>Desde Bruto a Neto</span>
        <strong>Ya colocamos tu ingreso neto estimado.</strong>
        <p>Comprueba el dato antes de continuar: la estimación no incluye otros descuentos de nómina. Puedes editarlo normalmente.</p>
      </div>
      <button type="button" onClick={onClear}>Quitar dato</button>
    </aside>
  );
}
