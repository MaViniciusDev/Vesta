import { describe, expect, it } from 'vitest'
import { normalizarMetricasDashboard, normalizarProdutoHistorico, toMovimentacaoParams } from './produtoApi'

describe('toMovimentacaoParams', () => {
  it('envia entrada true para quantidade positiva', () => {
    expect(toMovimentacaoParams(7)).toEqual({ quantidade: 7, entrada: true })
  })

  it('envia entrada false para quantidade negativa', () => {
    expect(toMovimentacaoParams(-5)).toEqual({ quantidade: 5, entrada: false })
  })

  it('normaliza valores invalidos para 0', () => {
    expect(toMovimentacaoParams('abc')).toEqual({ quantidade: 0, entrada: false })
  })
})

describe('normalizarProdutoHistorico', () => {
  it('converte payload do backend para formato da UI', () => {
    const item = normalizarProdutoHistorico({
      sku: 'LF-CAM-00001',
      nome: 'Cadeira',
      categoria: 'Sala',
      quantidade: 3,
      dataCadastro: '2026-03-12T10:00:00',
      caminhoFoto: '/tmp/foto.webp',
    })

    expect(item).toMatchObject({
      id: 'LF-CAM-00001',
      sku: 'LF-CAM-00001',
      nome: 'Cadeira',
      categoria: 'Sala',
      quantidade: 3,
      criadoEm: '2026-03-12T10:00:00',
      fotoUrl: '/tmp/foto.webp',
    })
  })
})

describe('normalizarMetricasDashboard', () => {
  it('normaliza as metricas retornadas pelo backend', () => {
    expect(normalizarMetricasDashboard({ totalItens: 1284, estoqueBaixo: 12 })).toEqual({
      totalItens: 1284,
      estoqueBaixo: 12,
    })
  })

  it('retorna null para valores invalidos', () => {
    expect(normalizarMetricasDashboard({ totalItens: 'abc', estoqueBaixo: undefined })).toEqual({
      totalItens: null,
      estoqueBaixo: null,
    })
  })
})

