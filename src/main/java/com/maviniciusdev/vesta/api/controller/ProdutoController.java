package com.maviniciusdev.vesta.api.controller;

import com.maviniciusdev.vesta.api.dto.ProdutoCadastroRequest;
import com.maviniciusdev.vesta.api.dto.ProdutoDashboardMetricasResponse;
import com.maviniciusdev.vesta.api.dto.ProdutoEstoqueBaixoResponse;
import com.maviniciusdev.vesta.api.dto.ProdutoHistoricoResponse;
import com.maviniciusdev.vesta.api.dto.ProdutoResponse;
import com.maviniciusdev.vesta.application.usecase.ProdutoUseCase;
import com.maviniciusdev.vesta.domain.model.Produto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Libera para o seu celular acessar via Wi-Fi sem erro de CORS
public class ProdutoController {

    private final ProdutoUseCase produtoUseCase;

    // Endpoint 1: Cadastro completo via Celular (Recebe JSON/Form e até 5 fotos)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProdutoResponse> cadastrar(
            @RequestPart("dados") ProdutoCadastroRequest request,
            @RequestPart(value = "fotos", required = false) List<MultipartFile> fotos) {

        Produto novoProduto = new Produto(
                request.nome(),
                request.categoria(),
                request.custo(),
                request.precoVenda(),
                request.quantidade(),
                null
        );

        Produto produtoSalvo = produtoUseCase.cadastrarNovoProduto(novoProduto, fotos);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ProdutoResponse.fromEntity(produtoSalvo));
    }

    // Endpoint para edição de produto (aceita até 5 fotos)
    @PutMapping(value = "/{sku}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProdutoResponse> editar(
            @PathVariable String sku,
            @RequestPart("dados") ProdutoCadastroRequest request,
            @RequestPart(value = "fotos", required = false) List<MultipartFile> fotos) {

        Produto dadosAtualizados = new Produto(
                request.nome(),
                request.categoria(),
                request.custo(),
                request.precoVenda(),
                request.quantidade(),
                null
        );

        Produto produtoAtualizado = produtoUseCase.editarProduto(sku, dadosAtualizados, fotos);
        return ResponseEntity.ok(ProdutoResponse.fromEntity(produtoAtualizado));
    }

    // Endpoint para exclusão de produto
    @DeleteMapping("/{sku}")
    public ResponseEntity<Void> excluir(@PathVariable String sku) {
        produtoUseCase.excluirProduto(sku);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/ultimos")
    public ResponseEntity<List<ProdutoHistoricoResponse>> listarUltimosCadastrados(
            @RequestParam(defaultValue = "20") int limite) {

        List<ProdutoHistoricoResponse> historico = produtoUseCase.listarUltimosCadastrados(limite)
                .stream()
                .map(ProdutoHistoricoResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(historico);
    }

    @GetMapping("/metricas")
    public ResponseEntity<ProdutoDashboardMetricasResponse> buscarMetricasDashboard(
            @RequestParam(defaultValue = "15") int limiarEstoqueBaixo) {

        long totalItens = produtoUseCase.obterTotalItensEmEstoque();
        long estoqueBaixo = produtoUseCase.contarProdutosComEstoqueBaixo(limiarEstoqueBaixo);

        return ResponseEntity.ok(new ProdutoDashboardMetricasResponse(totalItens, estoqueBaixo));
    }

    @GetMapping("/estoque-baixo")
    public ResponseEntity<List<ProdutoEstoqueBaixoResponse>> listarEstoqueBaixo(
            @RequestParam(defaultValue = "15") int limiar) {

        List<ProdutoEstoqueBaixoResponse> produtos = produtoUseCase.listarProdutosComEstoqueBaixo(limiar)
                .stream()
                .map(ProdutoEstoqueBaixoResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(produtos);
    }

    // Endpoint 2: Bipagem Rápida (Atualiza o estoque na velocidade da luz)
    // Ex: PATCH http://192.168.x.x:8080/api/produtos/LF-CAM-00001/estoque?quantidade=10&entrada=true
    @PatchMapping("/{sku}/estoque")
    public ResponseEntity<ProdutoResponse> movimentarEstoque(
            @PathVariable String sku,
            @RequestParam int quantidade,
            @RequestParam boolean entrada) {

        Produto produtoAtualizado = produtoUseCase.movimentarEstoque(sku, quantidade, entrada);

        return ResponseEntity.ok(ProdutoResponse.fromEntity(produtoAtualizado));
    }
}