import { useEffect, useRef, useState } from 'react'
import AppHeader from '../components/AppHeader'
import { cadastrarProduto } from '../services/produtoApi'
import { salvarCadastroNoHistorico } from '../services/historicoStorage'

const MAX_FOTOS = 5

const initialForm = {
  nome: '',
  categoria: '',
  custo: '',
  precoVenda: '',
  quantidade: 1,
}

// Cada slot: { arquivo: File | null, previewUrl: string | null }
const slotVazio = () => ({ arquivo: null, previewUrl: null })
const initialSlots = Array.from({ length: MAX_FOTOS }, slotVazio)

function CadastroPage() {
  const [form, setForm] = useState(initialForm)
  const [slots, setSlots] = useState(initialSlots)        // array fixo de 5 posições
  const [slotAtivo, setSlotAtivo] = useState(null)        // índice sendo editado
  const [mostrarEscolhaFoto, setMostrarEscolhaFoto] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const inputCameraRef = useRef(null)
  const inputGaleriaRef = useRef(null)
  const primeiraOpcaoRef = useRef(null)

  // Limpeza de URLs de objecto ao desmontar
  useEffect(() => {
    return () => {
      slots.forEach((s) => { if (s.previewUrl) URL.revokeObjectURL(s.previewUrl) })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!mostrarEscolhaFoto) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMostrarEscolhaFoto(false)
      }
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    setTimeout(() => primeiraOpcaoRef.current?.focus(), 0)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [mostrarEscolhaFoto])

  const atualizarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  const abrirEscolha = (index) => {
    setSlotAtivo(index)
    setMostrarEscolhaFoto(true)
  }

  const aplicarArquivo = (arquivo) => {
    if (!arquivo || slotAtivo === null) return
    setSlots((prev) => {
      const novo = [...prev]
      if (novo[slotAtivo].previewUrl) URL.revokeObjectURL(novo[slotAtivo].previewUrl)
      novo[slotAtivo] = { arquivo, previewUrl: URL.createObjectURL(arquivo) }
      return novo
    })
    setSlotAtivo(null)
  }

  const removerSlot = (index) => {
    setSlots((prev) => {
      const novo = [...prev]
      if (novo[index].previewUrl) URL.revokeObjectURL(novo[index].previewUrl)
      novo[index] = slotVazio()
      return novo
    })
  }

  const limparTudo = () => {
    slots.forEach((s) => { if (s.previewUrl) URL.revokeObjectURL(s.previewUrl) })
    setSlots(initialSlots.map(slotVazio))
    if (inputCameraRef.current) inputCameraRef.current.value = ''
    if (inputGaleriaRef.current) inputGaleriaRef.current.value = ''
  }

  const salvarProduto = async (event) => {
    event.preventDefault()
    setErro('')
    setMensagem('')
    setSalvando(true)
    try {
      const arquivos = slots.map((s) => s.arquivo).filter(Boolean)
      const produtoSalvo = await cadastrarProduto(form, arquivos)
      salvarCadastroNoHistorico(produtoSalvo)
      setMensagem('Produto cadastrado com sucesso.')
      setForm(initialForm)
      limparTudo()
    } catch (apiError) {
      setErro(apiError.response?.data?.message || 'Nao foi possivel salvar o produto.')
    } finally {
      setSalvando(false)
    }
  }

  const fotosPreenchidas = slots.filter((s) => s.arquivo).length

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <AppHeader title="Registrar Produto" showBack showRightAction={false} />

      <main className="flex-1 overflow-y-auto pb-32">
        <form className="space-y-6 px-4 py-6" onSubmit={salvarProduto}>

          {/* inputs ocultos */}
          <input ref={inputCameraRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={(e) => { aplicarArquivo(e.target.files?.[0]); e.target.value = '' }} />
          <input ref={inputGaleriaRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { aplicarArquivo(e.target.files?.[0]); e.target.value = '' }} />

          {/* ---- ÁREA DE FOTOS ---- */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Fotos do Produto
              </span>
              <span className={`text-xs font-bold ${fotosPreenchidas === MAX_FOTOS ? 'text-primary' : 'text-slate-400'}`}>
                {fotosPreenchidas}/{MAX_FOTOS}
              </span>
            </div>

            {/* Foto principal — slot 0 */}
            {slots[0].previewUrl ? (
              <div className="relative w-full overflow-hidden rounded-xl border-2 border-primary/40" style={{ maxHeight: '260px' }}>
                <img src={slots[0].previewUrl} alt="Foto principal" className="h-full w-full object-cover" style={{ maxHeight: '260px' }} />
                <div className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <button type="button" onClick={() => abrirEscolha(0)}
                    className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm">
                    <span className="material-symbols-outlined text-base">photo_camera</span>
                    Trocar
                  </button>
                  <button type="button" onClick={() => removerSlot(0)}
                    className="flex items-center gap-1.5 rounded-lg bg-red-500/80 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm">
                    <span className="material-symbols-outlined text-base">delete</span>
                    Remover
                  </button>
                </div>
                <span className="absolute left-2 top-2 rounded bg-black/50 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Principal
                </span>
              </div>
            ) : (
              <button type="button" onClick={() => abrirEscolha(0)}
                className="group flex w-full aspect-[4/3] max-h-[220px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 transition-all hover:bg-primary/10">
                <div className="flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                </div>
                <div className="text-center">
                  <span className="block text-base font-bold text-primary">Foto Principal</span>
                  <span className="text-xs text-slate-400">Toque para adicionar</span>
                </div>
              </button>
            )}

            {/* Slots secundários — slots 1 a 4 em grid 4 colunas */}
            <div className="grid grid-cols-4 gap-2">
              {slots.slice(1).map((slot, i) => {
                const index = i + 1
                return slot.previewUrl ? (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-lg border-2 border-primary/30">
                    <img src={slot.previewUrl} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removerSlot(index)}
                      className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-white">
                      <span className="material-symbols-outlined text-xs leading-none">close</span>
                    </button>
                    <button type="button" onClick={() => abrirEscolha(index)}
                      className="absolute inset-0 opacity-0" aria-label={`Trocar foto ${index + 1}`} />
                  </div>
                ) : (
                  <button key={index} type="button" onClick={() => abrirEscolha(index)}
                    className="aspect-square flex items-center justify-center rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 transition-colors hover:bg-primary/10">
                    <span className="material-symbols-outlined text-primary/50">add_a_photo</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ---- CAMPOS DO FORMULÁRIO ---- */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Nome do Produto</label>
            <input required value={form.nome} onChange={(e) => atualizarCampo('nome', e.target.value)}
              placeholder="Ex: Jogo de Lencol King 400 Fios"
              className="h-14 w-full rounded-xl border border-slate-200 bg-white p-4 text-base focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Categoria</label>
            <select required value={form.categoria} onChange={(e) => atualizarCampo('categoria', e.target.value)}
              className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800">
              <option value="" disabled>Selecione a categoria</option>
              <option value="Cama">Cama</option>
              <option value="Mesa">Mesa</option>
              <option value="Banho">Banho</option>
              <option value="Diversos">Diversos</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Custo (R$)</label>
              <input required min="0" step="0.01" type="number" value={form.custo}
                onChange={(e) => atualizarCampo('custo', e.target.value)}
                className="h-14 w-full rounded-xl border border-slate-200 bg-white p-4 text-base focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Preco (R$)</label>
              <input required min="0" step="0.01" type="number" value={form.precoVenda}
                onChange={(e) => atualizarCampo('precoVenda', e.target.value)}
                className="h-14 w-full rounded-xl border border-slate-200 bg-white p-4 text-base font-bold text-primary focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Quantidade em Estoque</label>
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
              <button type="button" onClick={() => atualizarCampo('quantidade', Math.max(0, Number(form.quantidade) - 1))}
                className="flex size-12 items-center justify-center rounded-lg text-primary hover:bg-white dark:hover:bg-slate-700">
                <span className="material-symbols-outlined">remove</span>
              </button>
              <input type="number" min="0" value={form.quantidade}
                onChange={(e) => atualizarCampo('quantidade', Number(e.target.value))}
                className="flex-1 border-none bg-transparent text-center text-xl font-bold focus:ring-0" />
              <button type="button" onClick={() => atualizarCampo('quantidade', Number(form.quantidade) + 1)}
                className="flex size-12 items-center justify-center rounded-lg text-primary hover:bg-white dark:hover:bg-slate-700">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>

          {mensagem ? <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{mensagem}</p> : null}
          {erro ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{erro}</p> : null}

          <footer className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-md border-t border-primary/10 bg-white/90 p-4 backdrop-blur-lg dark:bg-background-dark/90">
            <button disabled={salvando} type="submit"
              className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-lg font-bold text-white shadow-lg shadow-primary/30 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70">
              <span className="material-symbols-outlined">check_circle</span>
              <span>{salvando ? 'Salvando...' : 'Salvar Produto'}</span>
            </button>
          </footer>
        </form>

        {/* Bottom sheet: câmera ou galeria */}
        {mostrarEscolhaFoto ? (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4"
            onClick={() => setMostrarEscolhaFoto(false)}>
            <div id="seletor-fonte-foto" role="dialog" aria-modal="true" aria-label="Escolher fonte da foto"
              className="sheet-enter w-full max-w-md space-y-2 rounded-xl bg-white p-3 shadow-2xl dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}>
              <p className="pb-1 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                {slotAtivo === 0 ? 'Foto principal' : `Foto ${slotAtivo + 1}`}
              </p>
              <button ref={primeiraOpcaoRef} type="button"
                onClick={() => { setMostrarEscolhaFoto(false); inputCameraRef.current?.click() }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white">
                <span className="material-symbols-outlined text-base">photo_camera</span>
                Abrir camera
              </button>
              <button type="button"
                onClick={() => { setMostrarEscolhaFoto(false); inputGaleriaRef.current?.click() }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <span className="material-symbols-outlined text-base">photo_library</span>
                Escolher da galeria
              </button>
              <button type="button" onClick={() => setMostrarEscolhaFoto(false)}
                className="flex h-11 w-full items-center justify-center rounded-lg text-sm font-semibold text-slate-500">
                Cancelar
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}

export default CadastroPage
