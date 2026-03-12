package com.maviniciusdev.vesta.infrastructure.sync;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.SheetsScopes;
import com.google.api.services.sheets.v4.model.BatchUpdateSpreadsheetRequest;
import com.google.api.services.sheets.v4.model.DeleteDimensionRequest;
import com.google.api.services.sheets.v4.model.DimensionRange;
import com.google.api.services.sheets.v4.model.Request;
import com.google.api.services.sheets.v4.model.Sheet;
import com.google.api.services.sheets.v4.model.Spreadsheet;
import com.google.api.services.sheets.v4.model.ValueRange;
import com.maviniciusdev.vesta.domain.model.Produto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.OptionalInt;

@Service
public class GoogleSheetsSyncService {

    private static final Logger log = LoggerFactory.getLogger(GoogleSheetsSyncService.class);

    @Value("${google.sheets.spreadsheet-id}")
    private String spreadsheetId;

    @Value("${google.sheets.credentials-file-path}")
    private String credentialsFilePath;

    @Value("${google.sheets.worksheet-name:Pagina1}")
    private String worksheetName;

    private final ResourceLoader resourceLoader;

    public GoogleSheetsSyncService(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    // Configura o cliente de acesso ao Google
    private Sheets getSheetsService() throws Exception {
        Resource resource = resourceLoader.getResource(credentialsFilePath);
        try (InputStream in = resource.getInputStream()) {
            GoogleCredential credential = GoogleCredential.fromStream(in)
                    .createScoped(Collections.singleton(SheetsScopes.SPREADSHEETS));

            return new Sheets.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    JacksonFactory.getDefaultInstance(),
                    credential)
                    .setApplicationName("Vesta Gestão de Estoque")
                    .build();
        }
    }

    private List<Object> montarLinha(Produto produto) {
        return Arrays.asList(
                produto.getSku(),
                produto.getNome(),
                produto.getCategoria(),
                produto.getCusto().toString(),
                produto.getPrecoVenda().toString(),
                produto.getQuantidade(),
                produto.getCaminhoFoto(),
                produto.getDataCadastro().toString()
        );
    }

    private String faixaDados() {
        return worksheetName + "!A:H";
    }

    private OptionalInt buscarIndiceLinhaPorSku(Sheets sheetsService, String sku) throws Exception {
        ValueRange result = sheetsService.spreadsheets().values()
                .get(spreadsheetId, worksheetName + "!A:A")
                .execute();

        List<List<Object>> linhas = result.getValues();
        if (linhas == null || linhas.isEmpty()) {
            return OptionalInt.empty();
        }

        for (int i = 0; i < linhas.size(); i++) {
            List<Object> linha = linhas.get(i);
            if (!linha.isEmpty() && sku.equals(String.valueOf(linha.get(0)))) {
                return OptionalInt.of(i);
            }
        }

        return OptionalInt.empty();
    }

    private int buscarSheetIdPorNome(Sheets sheetsService) throws Exception {
        Spreadsheet spreadsheet = sheetsService.spreadsheets().get(spreadsheetId).execute();
        List<Sheet> abas = spreadsheet.getSheets();

        if (abas == null || abas.isEmpty()) {
            throw new IllegalStateException("Nenhuma aba encontrada na planilha configurada.");
        }

        for (Sheet aba : abas) {
            if (worksheetName.equals(aba.getProperties().getTitle())) {
                return aba.getProperties().getSheetId();
            }
        }

        throw new IllegalStateException("Aba " + worksheetName + " não encontrada na planilha configurada.");
    }

    // O @Async garante que isso rode em paralelo, sem travar o seu celular na loja!
    @Async
    public void espelharNovoProduto(Produto produto) {
        try {
            Sheets sheetsService = getSheetsService();
            ValueRange body = new ValueRange().setValues(Collections.singletonList(montarLinha(produto)));

            sheetsService.spreadsheets().values()
                    .append(spreadsheetId, faixaDados(), body)
                    .setValueInputOption("USER_ENTERED")
                    .execute();

            log.info("Produto {} sincronizado no Google Sheets com sucesso.", produto.getSku());

        } catch (Exception e) {
            log.error("Erro ao sincronizar produto {} com Google Sheets. O dado local foi mantido.", produto.getSku(), e);
        }
    }

    @Async
    public void atualizarProduto(Produto produto) {
        try {
            Sheets sheetsService = getSheetsService();
            OptionalInt indiceLinha = buscarIndiceLinhaPorSku(sheetsService, produto.getSku());

            if (indiceLinha.isEmpty()) {
                espelharNovoProduto(produto);
                return;
            }

            int numeroLinhaPlanilha = indiceLinha.getAsInt() + 1;
            String faixaLinha = worksheetName + "!A" + numeroLinhaPlanilha + ":H" + numeroLinhaPlanilha;

            ValueRange body = new ValueRange().setValues(Collections.singletonList(montarLinha(produto)));

            sheetsService.spreadsheets().values()
                    .update(spreadsheetId, faixaLinha, body)
                    .setValueInputOption("USER_ENTERED")
                    .execute();

            log.info("Produto {} atualizado no Google Sheets com sucesso.", produto.getSku());

        } catch (Exception e) {
            log.error("Erro ao atualizar produto {} no Google Sheets. O dado local foi mantido.", produto.getSku(), e);
        }
    }

    @Async
    public void removerProduto(String sku) {
        try {
            Sheets sheetsService = getSheetsService();
            OptionalInt indiceLinha = buscarIndiceLinhaPorSku(sheetsService, sku);

            if (indiceLinha.isEmpty()) {
                log.warn("SKU {} nao encontrado na aba {} durante remocao no Google Sheets.", sku, worksheetName);
                return;
            }

            int indiceBaseZero = indiceLinha.getAsInt();
            int sheetId = buscarSheetIdPorNome(sheetsService);

            DimensionRange dimensionRange = new DimensionRange()
                    .setSheetId(sheetId)
                    .setDimension("ROWS")
                    .setStartIndex(indiceBaseZero)
                    .setEndIndex(indiceBaseZero + 1);

            Request deleteRequest = new Request()
                    .setDeleteDimension(new DeleteDimensionRequest().setRange(dimensionRange));

            BatchUpdateSpreadsheetRequest batchRequest = new BatchUpdateSpreadsheetRequest()
                    .setRequests(Collections.singletonList(deleteRequest));

            sheetsService.spreadsheets()
                    .batchUpdate(spreadsheetId, batchRequest)
                    .execute();

            log.info("Produto {} removido do Google Sheets com sucesso.", sku);

        } catch (Exception e) {
            log.error("Erro ao remover produto {} do Google Sheets. O dado local foi removido.", sku, e);
        }
    }
}