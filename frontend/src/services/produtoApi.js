import axios from 'axios'

const fallbackHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${fallbackHost}:8080`

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
})

export function toMovimentacaoParams(quantidadeDigitada) {
  const valorNumerico = Number(quantidadeDigitada)
  const entrada = valorNumerico >= 0
  return {
    quantidade: Math.abs(Math.trunc(valorNumerico || 0)),
    entrada,
  }
}

export async function cadastrarProduto(dados, fotos = []) {
  const formData = new FormData()

  const payload = {
    nome: dados.nome,
    categoria: dados.categoria,
    custo: Number(dados.custo),
    precoVenda: Number(dados.precoVenda),
    quantidade: Number(dados.quantidade),
  }
  formData.append('dados', new Blob([JSON.stringify(payload)], { type: 'application/json' }))

  fotos.filter(Boolean).slice(0, 5).forEach((f) => formData.append('fotos', f))

  const { data } = await http.post('/api/produtos', formData)
  return data
}

export async function editarProduto(sku, dados, fotos = []) {
  const formData = new FormData()

  const payload = {
    nome: dados.nome,
    categoria: dados.categoria,
    custo: Number(dados.custo),
    precoVenda: Number(dados.precoVenda),
    quantidade: Number(dados.quantidade),
  }
  formData.append('dados', new Blob([JSON.stringify(payload)], { type: 'application/json' }))

  fotos.filter(Boolean).slice(0, 5).forEach((f) => formData.append('fotos', f))

  const { data } = await http.put(`/api/produtos/${sku}`, formData)
  return data
}

export async function excluirProduto(sku) {
  await http.delete(`/api/produtos/${sku}`)
}

export function normalizarProdutoHistorico(item) {
  return {
    id: item?.sku || `${Date.now()}`,
    sku: item?.sku || 'Sem SKU',
    nome: item?.nome || 'Produto sem nome',
    categoria: item?.categoria || 'Sem categoria',
    quantidade: Number(item?.quantidade || 0),
    criadoEm: item?.dataCadastro || new Date().toISOString(),
    fotoUrl: item?.caminhoFoto || '',
  }
}

export function normalizarMetricasDashboard(payload) {
  const totalItens = Number(payload?.totalItens)
  const estoqueBaixo = Number(payload?.estoqueBaixo)

  return {
    totalItens: Number.isFinite(totalItens) ? totalItens : null,
    estoqueBaixo: Number.isFinite(estoqueBaixo) ? estoqueBaixo : null,
  }
}

export async function buscarMetricasDashboard(limiarEstoqueBaixo = 15) {
  const { data } = await http.get('/api/produtos/metricas', {
    params: { limiarEstoqueBaixo },
  })

  return normalizarMetricasDashboard(data)
}

export async function listarProdutosEstoqueBaixo(limiar = 15) {
  const { data } = await http.get('/api/produtos/estoque-baixo', {
    params: { limiar },
  })

  if (!Array.isArray(data)) {
    return []
  }

  return data
}

export async function listarUltimosProdutos(limite = 20) {
  const { data } = await http.get('/api/produtos/ultimos', {
    params: { limite },
  })

  if (!Array.isArray(data)) {
    return []
  }

  return data.map(normalizarProdutoHistorico)
}

export async function movimentarEstoque(sku, quantidadeDigitada) {
  const { quantidade, entrada } = toMovimentacaoParams(quantidadeDigitada)

  const { data } = await http.patch(`/api/produtos/${sku}/estoque`, null, {
    params: { quantidade, entrada },
  })

  return data
}

