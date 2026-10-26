package com.voyan.backend;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class AiController {
    private static final String CHAT_MODEL = "gemini-2.5-flash";
    private final ObjectMapper mapper;
    private final String apiKey;
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

    public AiController(ObjectMapper mapper, @Value("${voyan.gemini-api-key}") String apiKey) {
        this.mapper = mapper;
        this.apiKey = apiKey;
    }

    @PostMapping("/api/generate-music")
    public Map<String, Object> generateMusic(@RequestBody JsonNode request) {
        String prompt = request.path("prompt").asText("");
        if (prompt.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Prompt is required for music generation");
        requireApiKey();
        String modelType = request.path("modelType").asText("clip");
        String model = "pro".equals(modelType) ? "lyria-3-pro-preview" : "lyria-3-clip-preview";
        String destination = request.path("destination").asText("");
        String detailedPrompt = destination.isBlank() ? prompt : prompt + ". Destination mood: " + destination + ". High-fidelity travel soundscape.";

        try {
            JsonNode response = generate(model, detailedPrompt, false);
            String audio = "";
            String mimeType = "audio/wav";
            String lyrics = "";
            JsonNode parts = response.path("candidates").path(0).path("content").path("parts");
            if (parts.isArray()) {
                for (JsonNode part : parts) {
                    JsonNode inline = part.path("inlineData");
                    if (!inline.isMissingNode() && !inline.path("data").asText("").isBlank()) {
                        if (audio.isEmpty()) mimeType = inline.path("mimeType").asText(mimeType);
                        audio += inline.path("data").asText("");
                    }
                    if (lyrics.isEmpty()) lyrics = part.path("text").asText("");
                }
            }
            if (audio.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "No audio was returned by the music model.");
            }
            return Map.of("audioBase64", audio, "mimeType", mimeType, "lyrics", lyrics, "model", model,
                    "duration", "pro".equals(modelType) ? "Full-length track" : "30s clip");
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not generate music with Gemini.");
        }
    }

    @PostMapping("/api/realtime-google-intel")
    public Map<String, Object> realtimeIntel(@RequestBody JsonNode request) {
        String destination = request.path("destination").asText("Ooty & Nilgiris");
        if (apiKey.isBlank()) return fallbackIntel(destination);
        String prompt = """
                You are a real-time travel intelligence assistant. Provide the latest live conditions for "%s".
                Respond in concise valid JSON with keys: weather (temp, condition, high, low, precipitation, updatedAt),
                trafficStatus, advisory, crowdLevel. Output only raw JSON.
                """.formatted(destination);
        try {
            JsonNode response = generate(CHAT_MODEL, prompt, true);
            String text = responseText(response).replaceAll("(?s)^```json\\s*|\\s*```$", "").trim();
            JsonNode data = mapper.readTree(text);
            return Map.of(
                    "destination", destination,
                    "weather", data.path("weather"),
                    "trafficStatus", data.path("trafficStatus").asText(""),
                    "advisory", data.path("advisory").asText(""),
                    "crowdLevel", data.path("crowdLevel").asText(""),
                    "grounded", true,
                    "sources", sources(response, 4, "Google Live Search Grounding",
                            "https://www.google.com/search?q=" + encode(destination + " travel updates")));
        } catch (Exception exception) {
            if (exception instanceof ResponseStatusException statusException) throw statusException;
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not retrieve current travel intelligence.");
        }
    }

    @PostMapping("/api/realtime-ask")
    public Map<String, Object> realtimeAsk(@RequestBody JsonNode request) {
        String question = request.path("question").asText("");
        String destination = request.path("destination").asText("");
        if (question.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Question is required");
        if (apiKey.isBlank()) {
            return Map.of("answer", "For " + (destination.isBlank() ? "your destination" : destination)
                    + ", check local transit authorities for current travel conditions.",
                    "sources", List.of(Map.of("title", "Google Live Travel", "uri", "https://www.google.com")));
        }
        String prompt = "You are a real-time travel assistant grounded in Google Search. Answer this question about "
                + destination + ": \"" + question + "\". Keep your answer under 100 words, direct, actionable, and cite current alerts.";
        try {
            JsonNode response = generate(CHAT_MODEL, prompt, true);
            return Map.of("answer", responseText(response), "sources",
                    sources(response, 3, "Google Web Source", "https://www.google.com"));
        } catch (Exception exception) {
            if (exception instanceof ResponseStatusException statusException) throw statusException;
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to process the real-time travel query.");
        }
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleAiError(ResponseStatusException exception) {
        String reason = exception.getReason();
        return ResponseEntity.status(exception.getStatusCode())
                .body(Map.of("error", reason == null ? "AI request failed." : reason));
    }

    private JsonNode generate(String model, String prompt, boolean googleSearch) throws IOException, InterruptedException {
        ObjectNode body = mapper.createObjectNode();
        ArrayNode contents = body.putArray("contents");
        contents.addObject().putArray("parts").addObject().put("text", prompt);
        if (googleSearch) body.putArray("tools").addObject().putObject("google_search");
        String payload = mapper.writeValueAsString(body);
        HttpRequest request = HttpRequest.newBuilder(URI.create(
                        "https://generativelanguage.googleapis.com/v1beta/models/" + model
                                + ":generateContent?key=" + apiKey))
                .timeout(Duration.ofSeconds(90))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 429) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Gemini API quota is exhausted.");
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini API request failed (" + response.statusCode() + ").");
        }
        return mapper.readTree(response.body());
    }

    private String responseText(JsonNode response) {
        JsonNode parts = response.path("candidates").path(0).path("content").path("parts");
        if (parts.isArray()) for (JsonNode part : parts) {
            String text = part.path("text").asText("");
            if (!text.isBlank()) return text;
        }
        throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "Gemini returned no text. Please try again.");
    }

    private List<Map<String, String>> sources(JsonNode response, int max, String defaultTitle, String defaultUri) {
        List<Map<String, String>> result = new ArrayList<>();
        JsonNode chunks = response.path("candidates").path(0).path("groundingMetadata").path("groundingChunks");
        if (chunks.isArray()) for (JsonNode chunk : chunks) {
            JsonNode web = chunk.path("web");
            String uri = web.path("uri").asText("");
            if (!uri.isBlank()) result.add(Map.of("title", web.path("title").asText(defaultTitle), "uri", uri));
            if (result.size() >= max) break;
        }
        if (result.isEmpty()) result.add(Map.of("title", defaultTitle, "uri", defaultUri));
        return result;
    }

    private Map<String, Object> fallbackIntel(String destination) {
        return Map.of(
                "destination", destination,
                "weather", Map.of("temp", "17°C", "condition", "Partly Sunny", "high", "20°C",
                        "low", "13°C", "precipitation", "10%", "updatedAt", "Not live"),
                "trafficStatus", "Check local transport authorities for current road conditions.",
                "advisory", "Confirm permits, weather, and opening hours with local authorities before travelling.",
                "crowdLevel", "Unknown",
                "grounded", false,
                "sources", List.of(Map.of("title", "Google Maps", "uri",
                        "https://www.google.com/maps/search/?api=1&query=" + encode(destination))));
    }

    private String encode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }

    private void requireApiKey() {
        if (apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Gemini is not configured. Add GEMINI_API_KEY to the server environment.");
        }
    }
}
