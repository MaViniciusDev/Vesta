package com.maviniciusdev.vesta.infrastructure.storage;

import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ImageStorageService {

    // Lê o caminho da pasta lá do application.properties
    // Ex: lefil.storage.path=C:/Vesta/imagens (no Windows) ou /tmp/vesta/imagens (no Fedora)
    @Value("${lefil.storage.path:imagens_produtos}")
    private String diretorioRaiz;

    @Value("${vesta.image.max-width:1080}")
    private int maxWidth;

    @Value("${vesta.image.max-height:1080}")
    private int maxHeight;

    @Value("${vesta.image.quality:0.8}")
    private double imageQuality;

    public String salvarEComprimirFoto(MultipartFile foto, String sku) {
        if (foto == null || foto.isEmpty()) {
            return null;
        }

        try {
            // Garante que a pasta existe (se não existir, o Java cria na hora)
            Path diretorioPath = Paths.get(diretorioRaiz);
            if (!Files.exists(diretorioPath)) {
                Files.createDirectories(diretorioPath);
            }

            // Cria um nome único para o arquivo: SKU + UUID aleatório para evitar sobreposição
            String nomeArquivo = sku + "_" + UUID.randomUUID().toString().substring(0, 8) + ".jpg";
            Path caminhoCompleto = diretorioPath.resolve(nomeArquivo);

            // Reencoda sempre em JPG com resize/qualidade configuraveis para reduzir espaco em disco.
            Thumbnails.of(foto.getInputStream())
                    .size(maxWidth, maxHeight)
                    .outputFormat("jpg")
                    .outputQuality(imageQuality)
                    .toFile(caminhoCompleto.toFile());

            // Retorna o caminho relativo que será salvo no banco de dados
            return caminhoCompleto.toString();

        } catch (IOException e) {
            throw new RuntimeException("Falha ao salvar a imagem do produto: " + sku, e);
        }
    }
}