package com.maviniciusdev.vesta.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "produtos")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // O JPA exige um construtor vazio, mas deixamos protegido
@EqualsAndHashCode(of = "id")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 20)
    private String sku;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String categoria;

    @Column(nullable = false)
    private BigDecimal custo;

    @Column(name = "preco_venda", nullable = false)
    private BigDecimal precoVenda;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(name = "caminho_foto")
    private String caminhoFoto;

    @Column(name = "caminho_foto_2")
    private String caminhoFoto2;

    @Column(name = "caminho_foto_3")
    private String caminhoFoto3;

    @Column(name = "caminho_foto_4")
    private String caminhoFoto4;

    @Column(name = "caminho_foto_5")
    private String caminhoFoto5;

    @Column(name = "data_cadastro", updatable = false)
    private LocalDateTime dataCadastro;

    // Construtor principal da Fábrica (Sem o SKU e ID, que são gerados)
    public Produto(String nome, String categoria, BigDecimal custo, BigDecimal precoVenda, Integer quantidade, String caminhoFoto) {
        this.nome = nome;
        this.categoria = categoria;
        this.custo = custo;
        this.precoVenda = precoVenda;
        this.quantidade = quantidade;
        this.caminhoFoto = caminhoFoto;
        this.dataCadastro = LocalDateTime.now();
    }

    // --- REGRAS DE NEGÓCIO (DDD) ---

    // O PostPersist roda logo após o SQLite gerar o ID da linha.
    @PostPersist
    public void gerarSkuApósSalvar() {
        if (this.sku == null && this.id != null) {
            // Pega as 3 primeiras letras da categoria. Ex: "Cama" -> "CAM"
            String prefixoCat = this.categoria.length() >= 3 ?
                    this.categoria.substring(0, 3).toUpperCase() :
                    this.categoria.toUpperCase();

            // Resultado: LF-CAM-00001
            this.sku = String.format("LF-%s-%05d", prefixoCat, this.id);
        }
    }

    public void atualizarDados(String nome, String categoria, BigDecimal custo, BigDecimal precoVenda, Integer quantidade) {
        if (nome != null && !nome.isBlank()) {
            this.nome = nome;
        }
        if (categoria != null && !categoria.isBlank()) {
            this.categoria = categoria;
        }
        if (custo != null) {
            this.custo = custo;
        }
        if (precoVenda != null) {
            this.precoVenda = precoVenda;
        }
        if (quantidade != null && quantidade >= 0) {
            this.quantidade = quantidade;
        }
    }

    public void adicionarEstoque(int qtd) {
        if (qtd > 0) {
            this.quantidade += qtd;
        }
    }

    public void removerEstoque(int qtd) {
        if (qtd > 0 && this.quantidade >= qtd) {
            this.quantidade -= qtd;
        } else {
            // No futuro, isso pode ser uma Exception customizada do seu domínio
            throw new IllegalArgumentException("Estoque insuficiente ou valor inválido.");
        }
    }

    public void atualizarFoto(String novoCaminhoFoto) {
        if (novoCaminhoFoto != null && !novoCaminhoFoto.isBlank()) {
            this.caminhoFoto = novoCaminhoFoto;
        }
    }

    /** Atualiza até 5 fotos de uma vez. A lista pode ter de 0 a 5 elementos. */
    public void atualizarFotos(List<String> caminhos) {
        this.caminhoFoto  = caminhos.size() > 0 ? caminhos.get(0) : this.caminhoFoto;
        this.caminhoFoto2 = caminhos.size() > 1 ? caminhos.get(1) : null;
        this.caminhoFoto3 = caminhos.size() > 2 ? caminhos.get(2) : null;
        this.caminhoFoto4 = caminhos.size() > 3 ? caminhos.get(3) : null;
        this.caminhoFoto5 = caminhos.size() > 4 ? caminhos.get(4) : null;
    }

    /** Retorna apenas os caminhos preenchidos, na ordem de 1 a 5. */
    public List<String> getCaminhosFotos() {
        List<String> lista = new ArrayList<>();
        if (caminhoFoto  != null) lista.add(caminhoFoto);
        if (caminhoFoto2 != null) lista.add(caminhoFoto2);
        if (caminhoFoto3 != null) lista.add(caminhoFoto3);
        if (caminhoFoto4 != null) lista.add(caminhoFoto4);
        if (caminhoFoto5 != null) lista.add(caminhoFoto5);
        return lista;
    }
}