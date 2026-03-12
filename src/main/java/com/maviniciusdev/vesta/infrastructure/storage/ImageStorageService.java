package com.maviniciusdev.vesta.infrastructure.storage;

import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
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

            // A Mágica do Thumbnailator:
            // 1. Pega a foto original (que pode ter 5MB e 4000x4000px)
            // 2. Redimensiona para no máximo 1080x1080 (mantendo a proporção)
            // 3. Aplica 80% de qualidade (Otimização invisível a olho nu)
            // 4. Salva no HD local
            Thumbnails.of(foto.getInputStream())
                    .size(1080, 1080)
                    .outputQuality(0.8)
                    .toFile(caminhoCompleto.toFile());

            // Retorna o caminho relativo que será salvo no banco de dados
            return caminhoCompleto.toString();

        } catch (IOException e) {
            throw new RuntimeException("Falha ao salvar a imagem do produto: " + sku, e);
        }
    }
}