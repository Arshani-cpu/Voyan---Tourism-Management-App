package com.voyan.backend;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class FirebaseIdentityVerifier {
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String firebaseConfigPath;

    @Value("${voyan.firebase-api-key:}")
    private String firebaseApiKey;

    public FirebaseIdentityVerifier(
            ObjectMapper objectMapper,
            @Value("${voyan.firebase-config}") String firebaseConfigPath) {
        this.objectMapper = objectMapper;
        this.firebaseConfigPath = firebaseConfigPath;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    public String verify(String idToken) {
        return lookup(idToken).uid();
    }

    public FirebaseUser lookup(String idToken) {
        String apiKey = resolveApiKey();
        String endpoint = "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + apiKey;

        try {
            String requestBody = objectMapper.writeValueAsString(java.util.Map.of("idToken", idToken));
            HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint))
                    .timeout(Duration.ofSeconds(8))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 400 || response.statusCode() == 401) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired Firebase token");
            }
            if (response.statusCode() != 200) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Firebase verification is unavailable");
            }

            JsonNode users = objectMapper.readTree(response.body()).path("users");
            JsonNode user = users.isArray() && !users.isEmpty() ? users.get(0) : null;
            String userId = user == null ? "" : user.path("localId").asText("");
            if (userId.isBlank()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Firebase token");
            }
            return new FirebaseUser(
                    userId,
                    user.path("email").asText(""),
                    user.path("emailVerified").asBoolean(false));
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Firebase verification was interrupted");
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Firebase verification is unavailable");
        }
    }

    public record FirebaseUser(String uid, String email, boolean emailVerified) {}

    private String resolveApiKey() {
        if (firebaseApiKey != null && !firebaseApiKey.isBlank()) {
            return firebaseApiKey;
        }
        try {
            JsonNode config = objectMapper.readTree(Files.readString(Path.of(firebaseConfigPath)));
            String configuredKey = config.path("apiKey").asText("");
            if (!configuredKey.isBlank()) {
                return configuredKey;
            }
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Firebase configuration is unavailable");
        }
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Firebase API key is not configured");
    }
}