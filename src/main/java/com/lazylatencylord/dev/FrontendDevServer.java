package com.lazylatencylord.dev;

import org.springframework.boot.context.event.ApplicationReadyEvent; // ✅ correct
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.net.Socket;
import java.util.Locale;

@Component
@Profile("dev")
public class FrontendDevServer implements ApplicationListener<ApplicationReadyEvent>, AutoCloseable {

    @org.springframework.beans.factory.annotation.Value("${frontend.autostart:true}")
    private boolean autostart;

    @org.springframework.beans.factory.annotation.Value("${frontend.dir:frontend}")
    private String frontendDir;

    @org.springframework.beans.factory.annotation.Value("${frontend.dev.port:5173}")
    private int devPort;

    private Process viteProcess;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        if (!autostart) return;
        if (isPortOpen("127.0.0.1", devPort, 200)) return;

        File dir = new File(System.getProperty("user.dir"), frontendDir);
        if (!dir.exists()) {
            System.err.println("[FE] frontend directory not found: " + dir.getAbsolutePath());
            return;
        }

        try {
            npmInstall(dir); // install deps on first run

            ProcessBuilder pb = new ProcessBuilder(npmCmd(), "run", "dev", "--", "--strictPort")
                    .directory(dir)
                    .redirectErrorStream(true);
            viteProcess = pb.start();
            new Thread(() -> {
                try {
                    viteProcess.getInputStream().transferTo(System.out);
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }).start();

            System.out.println("[FE] Vite dev server starting at http://localhost:" + devPort);
        } catch (IOException | InterruptedException e) {
            System.err.println("[FE] Failed to start frontend dev server: " + e.getMessage());
            Thread.currentThread().interrupt();
        }
    }

    private void npmInstall(File dir) throws IOException, InterruptedException {
        boolean hasLock = new File(dir, "package-lock.json").exists();
        Process p = new ProcessBuilder(npmCmd(), hasLock ? "ci" : "install")
                .directory(dir)
                .inheritIO()
                .start();
        p.waitFor();
    }

    private boolean isPortOpen(String host, int port, int timeoutMs) {
        try (Socket s = new Socket()) {
            s.connect(new java.net.InetSocketAddress(host, port), timeoutMs);
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    private String npmCmd() {
        String os = System.getProperty("os.name").toLowerCase(Locale.ROOT);
        return os.contains("win") ? "npm.cmd" : "npm";
    }

    @Override
    public void close() {
        if (viteProcess != null && viteProcess.isAlive()) {
            viteProcess.destroy();
            System.out.println("[FE] Vite dev server stopped.");
        }
    }
}
