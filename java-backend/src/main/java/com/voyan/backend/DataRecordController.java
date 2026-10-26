package com.voyan.backend;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/data")
public class DataRecordController {
    private static final Pattern DATA_KEY = Pattern.compile("^[a-zA-Z0-9_-]{1,64}$");

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    private final FirebaseIdentityVerifier identityVerifier;

    public DataRecordController(
            JdbcTemplate jdbcTemplate,
            ObjectMapper objectMapper,
            FirebaseIdentityVerifier identityVerifier) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
        this.identityVerifier = identityVerifier;
    }

    @GetMapping("/{collection}")
    public Map<String, Object> list(
            @PathVariable String collection,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        validateKey(collection);
        String userId = requireUser(authorization);
        List<Map<String, Object>> records = jdbcTemplate.query(
                "SELECT record_id, payload, created_at, updated_at FROM app_records "
                        + "WHERE user_id = ? AND collection = ? ORDER BY updated_at DESC LIMIT 100",
                (result, rowNumber) -> toRecord(
                        result.getString("record_id"),
                        result.getString("payload"),
                        result.getString("created_at"),
                        result.getString("updated_at")),
                userId,
                collection);
        return Map.of("records", records);
    }

    @GetMapping("/{collection}/{recordId}")
    public Map<String, Object> get(
            @PathVariable String collection,
            @PathVariable String recordId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        validateKey(collection);
        validateKey(recordId);
        String userId = requireUser(authorization);
        List<Map<String, Object>> records = jdbcTemplate.query(
                "SELECT payload, created_at, updated_at FROM app_records "
                        + "WHERE user_id = ? AND collection = ? AND record_id = ?",
                (result, rowNumber) -> toRecord(
                        recordId,
                        result.getString("payload"),
                        result.getString("created_at"),
                        result.getString("updated_at")),
                userId,
                collection,
                recordId);
        if (records.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found");
        }
        return records.get(0);
    }

    @PutMapping("/{collection}/{recordId}")
    public Map<String, Object> save(
            @PathVariable String collection,
            @PathVariable String recordId,
            @RequestBody SaveRecordRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        validateKey(collection);
        validateKey(recordId);
        if (request.data() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A JSON data value is required");
        }

        String userId = requireUser(authorization);
        String payload;
        try {
            payload = objectMapper.writeValueAsString(request.data());
        } catch (JsonProcessingException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid JSON record");
        }
        if (payload.getBytes(StandardCharsets.UTF_8).length > 1_000_000) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Records must be 1 MB or smaller");
        }

        String now = Instant.now().toString();
        jdbcTemplate.update("""
                INSERT INTO app_records (user_id, collection, record_id, payload, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT (user_id, collection, record_id) DO UPDATE SET
                    payload = excluded.payload,
                    updated_at = excluded.updated_at
                """, userId, collection, recordId, payload, now, now);
        return Map.of("ok", true, "id", recordId, "updatedAt", now);
    }

    @DeleteMapping("/{collection}/{recordId}")
    public Map<String, Object> delete(
            @PathVariable String collection,
            @PathVariable String recordId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        validateKey(collection);
        validateKey(recordId);
        String userId = requireUser(authorization);
        int deleted = jdbcTemplate.update(
                "DELETE FROM app_records WHERE user_id = ? AND collection = ? AND record_id = ?",
                userId,
                collection,
                recordId);
        if (deleted == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found");
        }
        return Map.of("ok", true);
    }

    private String requireUser(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Firebase sign-in is required");
        }
        return identityVerifier.verify(authorization.substring(7));
    }

    private void validateKey(String value) {
        if (!DATA_KEY.matcher(value).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid collection name or record ID");
        }
    }

    private Map<String, Object> toRecord(String id, String payload, String createdAt, String updatedAt) {
        try {
            return Map.of(
                    "id", id,
                    "data", objectMapper.readTree(payload),
                    "createdAt", createdAt,
                    "updatedAt", updatedAt);
        } catch (JsonProcessingException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Stored record is invalid");
        }
    }

    public record SaveRecordRequest(JsonNode data) {}
}