package com.maviniciusdev.vesta;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.scheduling.annotation.EnableAsync;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.io.InputStream;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

@SpringBootApplication
@EnableAsync
public class VestaApplication {

    public static void main(String[] args) {
        // 1. Inicia o Spring Boot ativando o suporte a interfaces gráficas (AWT)
        ConfigurableApplicationContext context = new SpringApplicationBuilder(VestaApplication.class)
                .headless(false)
                .run(args);

        // 2. Configura o ícone na bandeja do sistema
        configurarSystemTray(context);
    }

    private static void configurarSystemTray(ConfigurableApplicationContext context) {
        // Verifica se o sistema operacional suporta o System Tray
        if (!SystemTray.isSupported()) {
            System.out.println("SystemTray não suportado. O servidor rodará apenas no terminal.");
            System.out.println(gerarTextoConexao(context));
            return;
        }

        try {
            SystemTray tray = SystemTray.getSystemTray();

            // Carrega o ícone de dentro do JAR do Spring Boot de forma segura
            InputStream iconStream = VestaApplication.class.getResourceAsStream("/vesta-icon.png");
            if (iconStream == null) {
                System.out.println("Ícone não encontrado. O aplicativo iniciará sem ele.");
                return;
            }
            Image image = ImageIO.read(iconStream);

            // Cria o menu que aparece ao clicar com o botão direito no ícone
            PopupMenu menu = new PopupMenu();

            // Opção 1: Descobrir o IP para digitar no celular
            MenuItem ipItem = new MenuItem("Ver IP Local (Para Celular)");
            ipItem.addActionListener(e -> mostrarIpLocal(context));
            menu.add(ipItem);

            menu.addSeparator();

            // Opção 2: Encerrar o servidor com segurança
            MenuItem exitItem = new MenuItem("Encerrar Vesta");
            exitItem.addActionListener(e -> {
                context.close(); // Desliga o Spring Boot graciosamente (salvando o SQLite)
                System.exit(0);
            });
            menu.add(exitItem);

            // Monta o ícone final
            TrayIcon trayIcon = new TrayIcon(image, "Vesta - Controle de Estoque", menu);
            trayIcon.setImageAutoSize(true);

            // Clique esquerdo no ícone também mostra os endereços de conexão.
            trayIcon.addMouseListener(new MouseAdapter() {
                @Override
                public void mouseClicked(MouseEvent e) {
                    if (e.getButton() == MouseEvent.BUTTON1) {
                        mostrarIpLocal(context);
                    }
                }
            });

            // Adiciona na barra do Windows
            tray.add(trayIcon);

            // Exibe um balão de notificação quando o sistema subir!
            trayIcon.displayMessage("Vesta Iniciado", "Servidor rodando. Conecte o celular na rede Wi-Fi.", TrayIcon.MessageType.INFO);
            System.out.println(gerarTextoConexao(context));

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void mostrarIpLocal(ConfigurableApplicationContext context) {
        try {
            Dialog dialog = new Dialog((Frame) null, "Conexão Celular");
            dialog.setLayout(new FlowLayout());
            dialog.add(new Label("Conecte o celular na mesma rede e use um destes endereços:"));

            TextArea area = new TextArea(gerarTextoConexao(context), 6, 42, TextArea.SCROLLBARS_VERTICAL_ONLY);
            area.setEditable(false);
            dialog.add(area);

            Button btnOk = new Button("OK");
            btnOk.addActionListener(e -> dialog.dispose());
            dialog.add(btnOk);

            dialog.setSize(420, 220);
            dialog.setLocationRelativeTo(null);
            dialog.setVisible(true);

        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    private static String gerarTextoConexao(ConfigurableApplicationContext context) {
        int porta = obterPortaExecutando(context);
        List<String> urls = obterUrlsDeRede(porta);

        if (urls.isEmpty()) {
            return "Nao foi possivel detectar IPs de rede. Use localhost:" + porta;
        }

        StringBuilder sb = new StringBuilder();
        for (String url : urls) {
            sb.append(url).append(System.lineSeparator());
        }
        return sb.toString().trim();
    }

    private static int obterPortaExecutando(ConfigurableApplicationContext context) {
        String porta = context.getEnvironment().getProperty("local.server.port");
        if (porta == null || porta.isBlank()) {
            porta = context.getEnvironment().getProperty("server.port", "8080");
        }
        return Integer.parseInt(porta);
    }

    private static List<String> obterUrlsDeRede(int porta) {
        List<String> urls = new ArrayList<>();
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces != null && interfaces.hasMoreElements()) {
                NetworkInterface ni = interfaces.nextElement();
                if (!ni.isUp() || ni.isLoopback() || ni.isVirtual()) {
                    continue;
                }

                Enumeration<InetAddress> addresses = ni.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress addr = addresses.nextElement();
                    if (addr instanceof Inet4Address && !addr.isLoopbackAddress()) {
                        urls.add("http://" + addr.getHostAddress() + ":" + porta);
                    }
                }
            }
        } catch (Exception ignored) {
            // Mantém fluxo robusto; fallback tratado no chamador.
        }
        return urls;
    }
}