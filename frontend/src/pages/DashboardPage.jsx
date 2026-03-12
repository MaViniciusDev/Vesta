import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import BottomNavigation from '../components/BottomNavigation'
import StatCard from '../components/StatCard'
import { listarHistoricoCadastros } from '../services/historicoStorage'
import { buscarMetricasDashboard, listarProdutosEstoqueBaixo, listarUltimosProdutos } from '../services/produtoApi'

const LIMIAR = 15

function DashboardPage() {
  const navigate = useNavigate()
  const [atividadesRecentes, setAtividadesRecentes] = useState([])
  const [metricas, setMetricas] = useState({ totalItens: null, estoqueBaixo: null })
  const [produtosEstoqueBaixo, setProdutosEstoqueBaixo] = useState([])
  const [mostrarModalEstoqueBaixo, setMostrarModalEstoqueBaixo] = useState(false)
  const botaoEstoqueBaixoRef = useRef(null)
  const botaoFecharEstoqueRef = useRef(null)

  useEffect(() => {
    let ativo = true

    const carregarMetricas = async () => {
      try {
        const [dados, lista] = await Promise.all([
          buscarMetricasDashboard(LIMIAR),
          listarProdutosEstoqueBaixo(LIMIAR),
        ])
        if (ativo) {
          setMetricas(dados)
          setProdutosEstoqueBaixo(Array.isArray(lista) ? lista : [])
        }
      } catch {
        if (ativo) {
          setMetricas({ totalItens: null, estoqueBaixo: null })
        }
      }
    }

    carregarMetricas()

    return () => { ativo = false }
  }, [])

  useEffect(() => {
    if (!mostrarModalEstoqueBaixo) return undefined

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMostrarModalEstoqueBaixo(false)
        botaoEstoqueBaixoRef.current?.focus()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    setTimeout(() => botaoFecharEstoqueRef.current?.focus(), 0)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [mostrarModalEstoqueBaixo])

  useEffect(() => {
    let ativo = true

    const carregarAtividades = async () => {
      try {
        const historicoApi = await listarUltimosProdutos(2)
        if (ativo) {
          setAtividadesRecentes(historicoApi)
        }
      } catch {
        if (ativo) {
          setAtividadesRecentes(listarHistoricoCadastros().slice(0, 2))
        }
      }
    }

    carregarAtividades()

    return () => {
      ativo = false
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <AppHeader title="Ola, Usuario" showRightAction={false} />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6">
        <section className="grid grid-cols-2 gap-4">
          <StatCard icon="inventory_2" title="Total de Itens" value={metricas.totalItens} />
          <StatCard
            ref={botaoEstoqueBaixoRef}
            icon="warning"
            title="Estoque Baixo"
            value={metricas.estoqueBaixo}
            trendColor="red"
            onClick={() => setMostrarModalEstoqueBaixo(true)}
          />
        </section>

        <section className="space-y-4">
          <h2 className="px-1 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Acoes Principais</h2>

          <button
            type="button"
            onClick={() => navigate('/cadastro')}
            className="group flex w-full items-center justify-between rounded-xl bg-primary p-6 text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-white/20 p-3">
                <span className="material-symbols-outlined text-3xl">add_box</span>
              </div>
              <div className="text-left">
                <p className="text-lg font-bold">Novo Produto</p>
                <p className="text-sm text-white/80">Cadastrar item no catalogo</p>
              </div>
            </div>
            <span className="material-symbols-outlined opacity-50 transition-opacity group-hover:opacity-100">chevron_right</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/bipagem')}
            className="group flex w-full items-center justify-between rounded-xl border border-primary/20 bg-white p-6 text-slate-900 shadow-sm transition-all hover:border-primary dark:bg-slate-900 dark:text-slate-100"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <span className="material-symbols-outlined text-3xl">barcode_scanner</span>
              </div>
              <div className="text-left">
                <p className="text-lg font-bold">Bipagem Rapida</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Entrada e saida via scanner</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-300 transition-colors group-hover:text-primary">chevron_right</span>
          </button>
        </section>

        <section className="rounded-xl border border-primary/10 bg-primary/5 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Atividades Recentes</h3>
            <button
              type="button"
              onClick={() => navigate('/historico')}
              className="text-xs font-bold uppercase text-primary"
            >
              Ver mais
            </button>
          </div>
          {atividadesRecentes.length > 0 ? (
            <div className="space-y-3">
              {atividadesRecentes.map((atividade) => (
                <div key={`${atividade.id}-${atividade.criadoEm}`} className="flex items-center gap-3">
                  <div className="size-2 rounded-full bg-primary" />
                  <p className="flex-1 text-sm">
                    Novo produto <span className="font-semibold">{atividade.nome}</span>
                  </p>
                  <span className="text-xs text-slate-400">{new Date(atividade.criadoEm).toLocaleDateString('pt-BR')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-primary/20 bg-white/60 p-3 text-sm text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
              Nenhuma atividade registrada ainda.
            </p>
          )}
        </section>
      </main>


      <BottomNavigation />

      {mostrarModalEstoqueBaixo ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4"
          onClick={() => {
            setMostrarModalEstoqueBaixo(false)
            botaoEstoqueBaixoRef.current?.focus()
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Produtos com estoque baixo"
            className="sheet-enter w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/30">
                  <span className="material-symbols-outlined text-xl text-red-500">warning</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Estoque Baixo</h4>
                  <p className="text-xs text-slate-400">Abaixo de {LIMIAR} unidades · {produtosEstoqueBaixo.length} produto{produtosEstoqueBaixo.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button
                ref={botaoFecharEstoqueRef}
                type="button"
                onClick={() => {
                  setMostrarModalEstoqueBaixo(false)
                  botaoEstoqueBaixoRef.current?.focus()
                }}
                aria-label="Fechar"
                className="flex size-9 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined text-slate-400">close</span>
              </button>
            </div>

            {/* Lista de produtos */}
            {produtosEstoqueBaixo.length > 0 ? (
              <ul className="max-h-[55vh] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
                {produtosEstoqueBaixo.map((produto) => {
                  const critico = produto.quantidade <= 3
                  const alerta = produto.quantidade <= 8

                  const badgeClass = critico
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                    : alerta
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'

                  const barClass = critico
                    ? 'bg-red-500'
                    : alerta
                    ? 'bg-amber-400'
                    : 'bg-primary'

                  const barWidth = Math.max(4, Math.round((produto.quantidade / LIMIAR) * 100))

                  return (
                    <li key={produto.sku} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {produto.nome}
                        </p>
                        <p className="text-xs text-slate-400">{produto.sku} · {produto.categoria}</p>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={`h-full rounded-full ${barClass} transition-all`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${badgeClass}`}>
                        {produto.quantidade} un
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="p-4">
                <p className="rounded-lg border border-dashed border-primary/20 bg-primary/5 p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  <span className="material-symbols-outlined mb-1 block text-2xl text-primary">check_circle</span>
                  Nenhum produto com estoque baixo. Tudo certo!
                </p>
              </div>
            )}

            {/* Rodapé */}
            {produtosEstoqueBaixo.length > 0 ? (
              <div className="border-t border-slate-100 p-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModalEstoqueBaixo(false)
                    navigate('/bipagem')
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white"
                >
                  <span className="material-symbols-outlined text-base">barcode_scanner</span>
                  Repor estoque via bipagem
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default DashboardPage

