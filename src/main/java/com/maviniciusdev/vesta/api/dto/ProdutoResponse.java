package com.maviniciusdev.vesta.api.dto;

import com.maviniciusdev.vesta.domain.model.Produto;
import java.math.BigDecimal;
import java.util.List;

public record ProdutoResponse(
        String sku,
        String nome,
        String categoria,
        BigDecimal precoVenda,
        Integer quantidade,
        List<String> fotos
) {
    public static ProdutoResponse fromEntity(Produto produto) {
        return new ProdutoResponse(
                produto.getSku(),
                produto.getNome(),
                produto.getCategoria(),
                produto.getPrecoVenda(),
                produto.getQuantidade(),
                produto.getCaminhosFotos()
        );
    }
}