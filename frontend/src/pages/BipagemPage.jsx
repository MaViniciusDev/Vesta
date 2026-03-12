import { useState } from 'react'
import AppHeader from '../components/AppHeader'
import ProductCard from '../components/ProductCard'
import { movimentarEstoque } from '../services/produtoApi'

function BipagemPage() {
  const [sku, setSku] = useState('')
  const [quantidadeAjuste, setQuantidadeAjuste] = useState(1)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [produto, setProduto] = useState(null)

  const mockQrRead = () => {
    const skuLido = 'SKU-TESTE-0001'
    setSku(skuLido)
    setProduto((prev) => ({
      ...prev,
      sku: skuLido,
      nome: prev?.nome || 'Item lido no scanner',
      localizacao: prev?.localizacao || '',
      fotoUrl: prev?.fotoUrl || '',
    }))
    setMensagem(`SKU detectado: ${skuLido}`)
    setErro('')
  }

  const confirmar = async () => {
    setLoading(true)
    setErro('')
    setMensagem('')

    try {
      const response = await movimentarEstoque(sku, quantidadeAjuste)
      setProduto(response)
      setMensagem('Movimentacao enviada com sucesso.')
      setQuantidadeAjuste(1)
    } catch (apiError) {
      setErro(apiError.response?.data?.message || 'Falha ao atualizar estoque.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <AppHeader title="Escaneamento Vesta" showBack rightIcon="history" />

      <div className="relative flex-1 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60 opacity-60" />
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="relative flex h-64 w-64 items-center justify-center rounded-xl border-2 border-primary">
            <div className="absolute left-0 top-0 -ml-1 -mt-1 h-8 w-8 rounded-tl-lg border-l-4 border-t-4 border-primary" />
            <div className="absolute right-0 top-0 -mr-1 -mt-1 h-8 w-8 rounded-tr-lg border-r-4 border-t-4 border-primary" />
            <div className="absolute bottom-0 left-0 -mb-1 -ml-1 h-8 w-8 rounded-bl-lg border-b-4 border-l-4 border-primary" />
            <div className="absolute bottom-0 right-0 -mb-1 -mr-1 h-8 w-8 rounded-br-lg border-b-4 border-r-4 border-primary" />
            <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 bg-primary/50 shadow-[0_0_15px_rgba(47,127,51,0.8)]" />
            <button
              type="button"
              onClick={mockQrRead}
              className="absolute inset-0 opacity-0"
              aria-label="Simular leitura de QR Code"
            />
          </div>
        </div>
      </div>

      <section className="z-20 flex flex-col gap-4 rounded-t-xl bg-white p-4 shadow-2xl dark:bg-background-dark">
        {produto || sku ? (
          <ProductCard
            sku={produto?.sku || sku}
            nome={produto?.nome || 'Item lido no scanner'}
            localizacao={produto?.localizacao || ''}
            fotoUrl={produto?.fotoUrl || ''}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-primary/20 bg-primary/5 p-4 text-sm text-slate-500 dark:text-slate-400">
            Aguardando leitura do codigo de barras/QR Code.
          </div>
        )}

        <div className="py-2 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Quantidade Atual</p>
          <div className="flex items-center justify-between gap-6">
            <button
              type="button"
              onClick={() => setQuantidadeAjuste((prev) => prev - 1)}
              className="flex size-16 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-100 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <span className="material-symbols-outlined text-3xl">remove</span>
            </button>

            <div className="flex-1 text-center">
              <span className="text-6xl font-black tabular-nums text-primary">{quantidadeAjuste}</span>
            </div>

            <button
              type="button"
              onClick={() => setQuantidadeAjuste((prev) => prev + 1)}
              className="flex size-16 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30"
            >
              <span className="material-symbols-outlined text-3xl">add</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sku" className="text-xs font-semibold uppercase tracking-wide text-slate-500">SKU</label>
          <input
            id="sku"
            value={sku}
            onChange={(event) => setSku(event.target.value)}
            className="h-11 flex-1 rounded-lg border border-slate-200 px-3 text-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        {mensagem ? <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">{mensagem}</p> : null}
        {erro ? <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{erro}</p> : null}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => setQuantidadeAjuste(1)}
            className="flex-1 rounded-xl bg-slate-100 py-4 text-lg font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={confirmar}
            disabled={loading || !sku.trim()}
            className="flex-[2] rounded-xl bg-primary py-4 text-lg font-bold text-white shadow-xl shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Enviando...' : 'Confirmar'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default BipagemPage

