package com.maviniciusdev.vesta.api.controller;

import com.maviniciusdev.vesta.api.exception.GlobalExceptionHandler;
import com.maviniciusdev.vesta.application.usecase.ProdutoUseCase;
import com.maviniciusdev.vesta.domain.model.Produto;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ProdutoController.class)
@Import({GlobalExceptionHandler.class, ProdutoControllerIntegrationTest.MockConfig.class})
class ProdutoControllerIntegrationTest {

    @TestConfiguration
    static class MockConfig {
        @Bean
        ProdutoUseCase produtoUseCase() {
            return Mockito.mock(ProdutoUseCase.class);
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProdutoUseCase produtoUseCase;

    @Test
    void deveEditarProdutoERetornar200() throws Exception {
        Produto produtoAtualizado = novoProduto("LF-CAM-00001", "Cama Casal", "Cama", 12);
        when(produtoUseCase.editarProduto(eq("LF-CAM-00001"), any(Produto.class), any())).thenReturn(produtoAtualizado);

        MockMultipartHttpServletRequestBuilder request = multipart("/api/produtos/{sku}", "LF-CAM-00001")
                .file(jsonDados("""
                        {"nome":"Cama Casal","categoria":"Cama","custo":100.00,"precoVenda":199.99,"quantidade":12}
                        """))
                .with(httpRequest -> {
                    httpRequest.setMethod("PUT");
                    return httpRequest;
                });

        mockMvc.perform(request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value("LF-CAM-00001"))
                .andExpect(jsonPath("$.nome").value("Cama Casal"))
                .andExpect(jsonPath("$.quantidade").value(12));
    }

    @Test
    void deveRetornar404QuandoEditarSkuInexistente() throws Exception {
        when(produtoUseCase.editarProduto(eq("LF-XXX-99999"), any(Produto.class), any()))
                .thenThrow(new IllegalArgumentException("Produto com SKU LF-XXX-99999 nao encontrado na base."));

        MockMultipartHttpServletRequestBuilder request = multipart("/api/produtos/{sku}", "LF-XXX-99999")
                .file(jsonDados("""
                        {"nome":"Item","categoria":"Diversos","custo":10.00,"precoVenda":20.00,"quantidade":1}
                        """))
                .with(httpRequest -> {
                    httpRequest.setMethod("PUT");
                    return httpRequest;
                });

        mockMvc.perform(request)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.path").value("/api/produtos/LF-XXX-99999"));
    }

    @Test
    void deveExcluirProdutoERetornar204() throws Exception {
        doNothing().when(produtoUseCase).excluirProduto("LF-CAM-00001");

        mockMvc.perform(delete("/api/produtos/{sku}", "LF-CAM-00001"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deveRetornar400QuandoExcluirReceberErroDeRegra() throws Exception {
        doThrow(new IllegalArgumentException("SKU invalido para exclusao."))
                .when(produtoUseCase)
                .excluirProduto("SKU-INVALIDO");

        mockMvc.perform(delete("/api/produtos/{sku}", "SKU-INVALIDO"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    void deveListarUltimosProdutosCadastrados() throws Exception {
        Produto produtoA = novoProduto("LF-CAM-00001", "Cama Casal", "Cama", 12);
        Produto produtoB = novoProduto("LF-MES-00002", "Mesa 8 Lugares", "Mesa", 4);

        when(produtoUseCase.listarUltimosCadastrados(5)).thenReturn(List.of(produtoA, produtoB));

        mockMvc.perform(get("/api/produtos/ultimos").param("limite", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sku").value("LF-CAM-00001"))
                .andExpect(jsonPath("$[0].nome").value("Cama Casal"))
                .andExpect(jsonPath("$[1].sku").value("LF-MES-00002"));
    }

    @Test
    void deveRetornarMetricasDaDashboard() throws Exception {
        when(produtoUseCase.obterTotalItensEmEstoque()).thenReturn(1284L);
        when(produtoUseCase.contarProdutosComEstoqueBaixo(15)).thenReturn(12L);

        mockMvc.perform(get("/api/produtos/metricas").param("limiarEstoqueBaixo", "15"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItens").value(1284))
                .andExpect(jsonPath("$.estoqueBaixo").value(12));
    }

    @Test
    void deveListarProdutosComEstoqueBaixo() throws Exception {
        Produto produtoA = novoProduto("LF-CAM-00001", "Toalha Banho", "Banho", 3);
        Produto produtoB = novoProduto("LF-CAM-00002", "Lencol Solteiro", "Cama", 10);

        when(produtoUseCase.listarProdutosComEstoqueBaixo(15)).thenReturn(List.of(produtoA, produtoB));

        mockMvc.perform(get("/api/produtos/estoque-baixo").param("limiar", "15"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sku").value("LF-CAM-00001"))
                .andExpect(jsonPath("$[0].quantidade").value(3))
                .andExpect(jsonPath("$[1].sku").value("LF-CAM-00002"))
                .andExpect(jsonPath("$[1].quantidade").value(10));
    }

    private MockMultipartFile jsonDados(String json) {
        return new MockMultipartFile(
                "dados",
                "dados.json",
                MediaType.APPLICATION_JSON_VALUE,
                json.getBytes(StandardCharsets.UTF_8)
        );
    }

    private Produto novoProduto(String sku, String nome, String categoria, int quantidade) {
        Produto produto = new Produto(
                nome,
                categoria,
                new BigDecimal("100.00"),
                new BigDecimal("199.99"),
                quantidade,
                "imagens/cama.jpg"
        );
        ReflectionTestUtils.setField(produto, "sku", sku);
        return produto;
    }
}
