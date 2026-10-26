package com.voyan.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@SpringBootApplication
public class VoyanBackendApplication {
    public static void main(String[] args) {
        loadLocalEnvironment();
        SpringApplication.run(VoyanBackendApplication.class, args);
    }

    private static void loadLocalEnvironment() {
        Path envFile = Path.of(".env");
        if (!Files.isRegularFile(envFile)) return;
        try {
            for (String line : Files.readAllLines(envFile)) {
                String entry = line.trim();
                if (entry.isEmpty() || entry.startsWith("#")) continue;
                if (entry.startsWith("export ")) entry = entry.substring(7).trim();
                int separator = entry.indexOf('=');
                if (separator <= 0) continue;
                String key = entry.substring(0, separator).trim();
                if (!key.matches("[A-Za-z_][A-Za-z0-9_]*") || System.getenv(key) != null) continue;
                String value = entry.substring(separator + 1).trim();
                if (value.length() >= 2
                        && ((value.startsWith("\"") && value.endsWith("\""))
                                || (value.startsWith("'") && value.endsWith("'")))) {
                    value = value.substring(1, value.length() - 1);
                }
                System.setProperty(key, value);
            }
        } catch (IOException exception) {
            throw new IllegalStateException("Could not read the local environment file.", exception);
        }
    }
}