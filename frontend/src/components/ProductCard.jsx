function ProductCard({ sku, nome, localizacao, fotoUrl }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-primary/10 bg-primary/5 p-3">
      <div
        className="size-16 shrink-0 rounded-lg border border-primary/20 bg-cover bg-center"
        style={{ backgroundImage: `url('${fotoUrl || '/icon-192.png'}')` }}
      />
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">SKU: {sku}</p>
        <h3 className="truncate text-base font-bold text-slate-900 dark:text-slate-100">{nome}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{localizacao || 'Sem localizacao cadastrada'}</p>
      </div>
    </div>
  )
}

export default ProductCard

