# Vesta Frontend

Aplicacao React + Vite + Tailwind CSS para o sistema interno mobile-first de estoque.

## Requisitos

- Node.js 20+
- Backend Spring Boot rodando na rede local

## Configuracao

1. Copie `.env.example` para `.env`.
2. Ajuste `VITE_API_BASE_URL` para o IP/porta do backend.

## Comandos

```bash
npm install
npm run dev
npm run test
npm run build
```

## Rotas

- `/` Dashboard
- `/cadastro` Registrar produto (multipart `foto` + `dados`)
- `/bipagem` Inventario rapido (PATCH de estoque)
- `/historico` Ultimos produtos cadastrados

> A rota `/historico` consome `GET /api/produtos/ultimos` e usa `localStorage` apenas como fallback se o backend estiver indisponivel.

## Integracoes de API

- `POST /api/produtos` via `cadastrarProduto`
- `PUT /api/produtos/{sku}` via `editarProduto`
- `DELETE /api/produtos/{sku}` via `excluirProduto`
- `PATCH /api/produtos/{sku}/estoque` via `movimentarEstoque`
- `GET /api/produtos/ultimos?limite=30` via `listarUltimosProdutos`
- `GET /api/produtos/metricas?limiarEstoqueBaixo=5` via `buscarMetricasDashboard`
