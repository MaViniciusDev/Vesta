package com.maviniciusdev.vesta.api.dto;

import com.maviniciusdev.vesta.domain.model.Produto;

import java.time.LocalDateTime;

public record ProdutoHistoricoResponse(
        String sku,
        String nome,
        String categoria,
        Integer quantidade,
        LocalDateTime dataCadastro,
        String caminhoFoto
) {
    public static ProdutoHistoricoResponse fromEntity(Produto produto) {
        return new ProdutoHistoricoResponse(
                produto.getSku(),
                produto.getNome(),
                produto.getCategoria(),
                produto.getQuantidade(),
                produto.getDataCadastro(),
                produto.getCaminhoFoto()
        );
    }
}

