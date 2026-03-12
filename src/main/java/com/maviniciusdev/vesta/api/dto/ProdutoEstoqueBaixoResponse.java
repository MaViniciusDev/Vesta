package com.maviniciusdev.vesta.api.dto;

import com.maviniciusdev.vesta.domain.model.Produto;

import java.util.List;

public record ProdutoEstoqueBaixoResponse(
        String sku,
        String nome,
        String categoria,
        Integer quantidade,
        List<String> fotos
) {
    public static ProdutoEstoqueBaixoResponse fromEntity(Produto produto) {
        return new ProdutoEstoqueBaixoResponse(
                produto.getSku(),
                produto.getNome(),
                produto.getCategoria(),
                produto.getQuantidade(),
                produto.getCaminhosFotos()
        );
    }
}

