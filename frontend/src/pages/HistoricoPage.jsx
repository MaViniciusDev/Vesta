import { useEffect, useState } from 'react'
import AppHeader from '../components/AppHeader'
import { listarHistoricoCadastros } from '../services/historicoStorage'
import { listarUltimosProdutos } from '../services/produtoApi'

function HistoricoPage() {
  const [historico, setHistorico] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true

    const carregarHistorico = async () => {
      try {
        const dados = await listarUltimosProdutos(30)
        if (ativo) {
          setHistorico(dados)
          setErro('')
        }
      } catch {
        if (ativo) {
          setHistorico(listarHistoricoCadastros())
          setErro('Nao foi possivel atualizar com o servidor agora.')
        }
      } finally {
        if (ativo) {
          setLoading(false)
        }
      }
    }

    carregarHistorico()

    return () => {
      ativo = false
    }
  }, [])

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <AppHeader title="Historico de Cadastros" showBack showRightAction={false} />

      <main className="flex-1 space-y-4 px-4 py-6">
        <section className="rounded-xl border border-primary/10 bg-primary/5 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Ultimos produtos cadastrados
          </h2>
        </section>

        {erro ? (
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            {erro}
          </section>
        ) : null}

        {loading ? (
          <section className="rounded-xl border border-primary/10 bg-white/70 p-4 text-sm text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
            Carregando historico...
          </section>
        ) : null}

        {!loading && historico.length > 0 ? (
          <section className="space-y-3">
            {historico.map((item) => (
              <article key={`${item.id}-${item.criadoEm}`} className="rounded-xl border border-primary/10 bg-white p-4 shadow-sm dark:bg-slate-900">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">SKU: {item.sku}</p>
                  <span className="text-xs text-slate-400">
                    {new Date(item.criadoEm).toLocaleString('pt-BR')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{item.nome}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Categoria: {item.categoria}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Quantidade inicial: {item.quantidade}</p>
              </article>
            ))}
          </section>
        ) : null}

        {!loading && historico.length === 0 ? (
          <section className="rounded-xl border border-dashed border-primary/20 bg-white/70 p-4 text-sm text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
            Ainda nao existem produtos cadastrados para mostrar no historico.
          </section>
        ) : null}
      </main>
    </div>
  )
}

export default HistoricoPage

