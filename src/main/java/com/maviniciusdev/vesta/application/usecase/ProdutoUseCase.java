package com.maviniciusdev.vesta.application.usecase;

import com.maviniciusdev.vesta.domain.model.Produto;
import com.maviniciusdev.vesta.domain.repository.ProdutoRepository;
import com.maviniciusdev.vesta.infrastructure.storage.ImageStorageService;
import com.maviniciusdev.vesta.infrastructure.sync.GoogleSheetsSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProdutoUseCase {

    private static final int LIMIAR_ESTOQUE_BAIXO_PADRAO = 15;
    private static final int MAX_FOTOS = 5;

    private final ProdutoRepository repository;
    private final ImageStorageService imageStorageService;
    private final GoogleSheetsSyncService sheetsSyncService;

    @Transactional
    public Produto cadastrarNovoProduto(Produto produto, List<MultipartFile> fotos) {

        Produto produtoSalvo = repository.save(produto);

        List<String> caminhos = salvarFotos(fotos, produtoSalvo.getSku());
        if (!caminhos.isEmpty()) {
            produtoSalvo.atualizarFotos(caminhos);
        }

        Produto produtoFinal = repository.save(produtoSalvo);
        sheetsSyncService.espelharNovoProduto(produtoFinal);

        return produtoFinal;
    }

    @Transactional
    public Produto editarProduto(String sku, Produto dadosAtualizados, List<MultipartFile> novasFotos) {
        Produto produto = repository.findBySku(sku)
                .orElseThrow(() -> new IllegalArgumentException("Produto com SKU " + sku + " não encontrado na base."));

        produto.atualizarDados(
                dadosAtualizados.getNome(),
                dadosAtualizados.getCategoria(),
                dadosAtualizados.getCusto(),
                dadosAtualizados.getPrecoVenda(),
                dadosAtualizados.getQuantidade()
        );

        List<String> caminhos = salvarFotos(novasFotos, produto.getSku());
        if (!caminhos.isEmpty()) {
            produto.atualizarFotos(caminhos);
        }

        Produto produtoAtualizado = repository.save(produto);
        sheetsSyncService.atualizarProduto(produtoAtualizado);

        return produtoAtualizado;
    }

    private List<String> salvarFotos(List<MultipartFile> fotos, String sku) {
        List<String> caminhos = new ArrayList<>();
        if (fotos == null) return caminhos;

        fotos.stream()
                .filter(f -> f != null && !f.isEmpty())
                .limit(MAX_FOTOS)
                .forEach(f -> {
                    String caminho = imageStorageService.salvarEComprimirFoto(f, sku);
                    if (caminho != null) caminhos.add(caminho);
                });

        return caminhos;
    }

    @Transactional
    public void excluirProduto(String sku) {
        Produto produto = repository.findBySku(sku)
                .orElseThrow(() -> new IllegalArgumentException("Produto com SKU " + sku + " não encontrado na base."));

        repository.delete(produto);
        sheetsSyncService.removerProduto(sku);
    }

    @Transactional
    public Produto movimentarEstoque(String sku, int quantidade, boolean entrada) {

        // Busca instantânea pelo código do produto
        Produto produto = repository.findBySku(sku)
                .orElseThrow(() -> new IllegalArgumentException("Produto com SKU " + sku + " não encontrado na base."));

        // Aplica a regra de negócio protegida dentro do Domínio
        if (entrada) {
            produto.adicionarEstoque(quantidade);
        } else {
            produto.removerEstoque(quantidade);
        }

        // O Hibernate faz o UPDATE automático na quantidade do estoque local
        Produto produtoAtualizado = repository.save(produto);
        sheetsSyncService.atualizarProduto(produtoAtualizado);

        return produtoAtualizado;
    }

    @Transactional(readOnly = true)
    public List<Produto> listarUltimosCadastrados(int limite) {
        int limiteValido = Math.max(1, Math.min(limite, 100));
        return repository.findAllByOrderByDataCadastroDesc(PageRequest.of(0, limiteValido));
    }

    @Transactional(readOnly = true)
    public long obterTotalItensEmEstoque() {
        return repository.somarTotalItensEmEstoque();
    }

    @Transactional(readOnly = true)
    public long contarProdutosComEstoqueBaixo(int limiarEstoqueBaixo) {
        int limiarValido = Math.max(0, limiarEstoqueBaixo);
        return repository.countByQuantidadeLessThanEqual(limiarValido);
    }

    @Transactional(readOnly = true)
    public List<Produto> listarProdutosComEstoqueBaixo(int limiarEstoqueBaixo) {
        int limiarValido = Math.max(0, limiarEstoqueBaixo);
        return repository.findByQuantidadeLessThanEqualOrderByQuantidadeAsc(limiarValido);
    }

    public static int getLimiarEstoqueBaixoPadrao() {
        return LIMIAR_ESTOQUE_BAIXO_PADRAO;
    }
}