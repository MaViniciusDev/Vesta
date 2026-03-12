package com.maviniciusdev.vesta.infrastructure.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.server.ConfigurableWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.ServerSocket;

@Component
public class AutoPortWebServerCustomizer implements WebServerFactoryCustomizer<ConfigurableWebServerFactory> {

    private static final Logger log = LoggerFactory.getLogger(AutoPortWebServerCustomizer.class);

    private final int preferredPort;
    private final int maxPortScan;

    public AutoPortWebServerCustomizer(
            @Value("${vesta.server.preferred-port:8080}") int preferredPort,
            @Value("${vesta.server.max-port-scan:100}") int maxPortScan) {
        this.preferredPort = preferredPort;
        this.maxPortScan = maxPortScan;
    }

    @Override
    public void customize(ConfigurableWebServerFactory factory) {
        int chosenPort = findAvailablePort(preferredPort, maxPortScan);
        factory.setPort(chosenPort);

        if (chosenPort == preferredPort) {
            log.info("Porta {} disponivel. Aplicacao iniciara nela.", chosenPort);
        } else {
            log.warn("Porta {} ocupada. Aplicacao iniciara automaticamente na porta {}.", preferredPort, chosenPort);
        }
    }

    private int findAvailablePort(int startPort, int scanWindow) {
        int range = Math.max(scanWindow, 0);

        for (int port = startPort; port <= startPort + range; port++) {
            if (isPortAvailable(port)) {
                return port;
            }
        }

        throw new IllegalStateException("Nenhuma porta livre encontrada entre " + startPort + " e " + (startPort + range));
    }

    private boolean isPortAvailable(int port) {
        try (ServerSocket socket = new ServerSocket()) {
            socket.setReuseAddress(false);
            socket.bind(new InetSocketAddress("0.0.0.0", port), 1);
            return true;
        } catch (IOException ignored) {
            return false;
        }
    }
}

