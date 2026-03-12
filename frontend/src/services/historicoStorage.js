const HISTORICO_KEY = 'vesta.historico.cadastros'
const MAX_ITENS = 30

function lerHistoricoBruto() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const valor = window.localStorage.getItem(HISTORICO_KEY)
    if (!valor) {
      return []
    }

    const parsed = JSON.parse(valor)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function listarHistoricoCadastros() {
  const historico = lerHistoricoBruto()

  return historico.sort((a, b) => {
    const dataA = new Date(a.criadoEm || 0).getTime()
    const dataB = new Date(b.criadoEm || 0).getTime()
    return dataB - dataA
  })
}

export function salvarCadastroNoHistorico(produto) {
  const historicoAtual = lerHistoricoBruto()

  const item = {
    id: produto?.sku || `${Date.now()}`,
    sku: produto?.sku || 'Sem SKU',
    nome: produto?.nome || 'Produto sem nome',
    categoria: produto?.categoria || 'Sem categoria',
    quantidade: Number(produto?.quantidade || 0),
    criadoEm: new Date().toISOString(),
  }

  const novoHistorico = [item, ...historicoAtual].slice(0, MAX_ITENS)
  window.localStorage.setItem(HISTORICO_KEY, JSON.stringify(novoHistorico))
  return novoHistorico
}

