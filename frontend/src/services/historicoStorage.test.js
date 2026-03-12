import { beforeEach, describe, expect, it } from 'vitest'
import { listarHistoricoCadastros, salvarCadastroNoHistorico } from './historicoStorage'

function criarLocalStorageMock() {
  const store = {}
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value)
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key])
    },
  }
}

describe('historicoStorage', () => {
  beforeEach(() => {
    globalThis.window = {
      localStorage: criarLocalStorageMock(),
    }
  })

  it('salva e lista produtos cadastrados em ordem mais recente', () => {
    salvarCadastroNoHistorico({ sku: 'SKU-1', nome: 'Produto A', categoria: 'Cama', quantidade: 2 })
    salvarCadastroNoHistorico({ sku: 'SKU-2', nome: 'Produto B', categoria: 'Mesa', quantidade: 1 })

    const itens = listarHistoricoCadastros()

    expect(itens).toHaveLength(2)
    expect(itens[0].sku).toBe('SKU-2')
    expect(itens[1].sku).toBe('SKU-1')
  })

  it('retorna lista vazia quando storage esta vazio', () => {
    expect(listarHistoricoCadastros()).toEqual([])
  })
})

