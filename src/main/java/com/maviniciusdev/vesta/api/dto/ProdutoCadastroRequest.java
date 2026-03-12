package com.maviniciusdev.vesta.api.dto;

import java.math.BigDecimal;

public record ProdutoCadastroRequest(
        String nome,
        String categoria,
        BigDecimal custo,
        BigDecimal precoVenda,
        Integer quantidade
) {}