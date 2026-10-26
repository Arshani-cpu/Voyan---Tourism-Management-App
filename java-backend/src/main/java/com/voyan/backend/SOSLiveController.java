package com.voyan.backend;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/sos")
public class SOSLiveController {
    private static final long SESSION_LIFETIME_MS = Duration.ofHours(8).toMillis();
    private static final int SESSION_CREATION_LIMIT = 5;
    private static final long SESSION_CREATION_WINDOW_MS = Duration.ofMinutes(10).toMillis();
    private static final int MAX_ACTIVE_SESSIONS = 1000;
    private static final String TOKEN_PATTERN = "^[A-Za-z0-9_-]{43}$";
    private static final RowMapper<SessionRow> SESSION_MAPPER = (result, rowNumber) -> new SessionRow(
            result.getString("id"),
            result.getString("share_token"),
            result.getString("update_token_hash"),
            result.getLong("expires_at"),
            result.getObject("ended_at") == null ? null : result.getLong("ended_at"),
            result.getObject("latitude") == null ? null : result.getDouble("latitude"),
            result.getObject("longitude") == null ? null : result.getDouble("longitude"),
            result.getObject("accuracy") == null ? null : result.getDouble("accuracy"),
            result.getObject("updated_at") == null ? null : result.getLong("updated_at"));

    private final JdbcTemplate jdbcTemplate;
    private final SecureRandom secureRandom = new SecureRandom();
    private final ConcurrentHashMap<String, ArrayDeque<Long>> creationAttempts = new ConcurrentHashMap<>();
    private final String publicBaseUrl;

    public SOSLiveController(JdbcTemplate jdbcTemplate, @Value("${voyan.public-base-url}") String publicBaseUrl) {
        this.jdbcTemplate = jdbcTemplate;
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
    }

    @PostMapping("/sessions")
    public SessionResponse create(HttpServletRequest request) {
        long now = System.currentTimeMillis();
        String clientKey = request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
        ArrayDeque<Long> attempts = creationAttempts.computeIfAbsent(clientKey, ignored -> new ArrayDeque<>());
        synchronized (attempts) {
            while (!attempts.isEmpty() && now - attempts.peekFirst() >= SESSION_CREATION_WINDOW_MS) attempts.removeFirst();
            if (attempts.size() >= SESSION_CREATION_LIMIT) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                        "Too many live SOS sessions were started. Try again later.");
            }
            attempts.addLast(now);
        }

        jdbcTemplate.update("DELETE FROM sos_live_sessions WHERE expires_at <= ?", now);
        Integer activeCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM sos_live_sessions WHERE ended_at IS NULL AND expires_at > ?", Integer.class, now);
        if (activeCount != null && activeCount >= MAX_ACTIVE_SESSIONS) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Live SOS sharing is temporarily at capacity.");
        }

        String id = randomToken();
        String shareToken = randomToken();
        String updateToken = randomToken();
        long expiresAt = now + SESSION_LIFETIME_MS;
        jdbcTemplate.update("""
                INSERT INTO sos_live_sessions (id, share_token, update_token_hash, created_at, expires_at)
                VALUES (?, ?, ?, ?, ?)
                """, id, shareToken, hashToken(updateToken), now, expiresAt);

        String baseUrl = publicBaseUrl.isBlank() ? requestBase(request) : validateConfiguredBaseUrl(publicBaseUrl);
        return new SessionResponse(id, updateToken, baseUrl + "/sos/live/" + shareToken,
                Instant.ofEpochMilli(expiresAt).toString());
    }

    @PatchMapping("/sessions/{id}")
    public Map<String, Object> update(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody LocationRequest location) {
        SessionRow session = requireSession(id, authorization);
        if (location.latitude() < -90 || location.latitude() > 90
                || location.longitude() < -180 || location.longitude() > 180
                || location.accuracy() < 0 || location.accuracy() > 100_000
                || !Double.isFinite(location.latitude()) || !Double.isFinite(location.longitude())
                || !Double.isFinite(location.accuracy())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A valid GPS location and accuracy are required.");
        }
        long now = System.currentTimeMillis();
        jdbcTemplate.update("""
                UPDATE sos_live_sessions SET latitude = ?, longitude = ?, accuracy = ?, updated_at = ?
                WHERE id = ?
                """, location.latitude(), location.longitude(), location.accuracy(), now, session.id());
        return Map.of("ok", true, "updatedAt", Instant.ofEpochMilli(now).toString());
    }

    @DeleteMapping("/sessions/{id}")
    public Map<String, Boolean> stop(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        SessionRow session = requireSession(id, authorization);
        jdbcTemplate.update("""
                UPDATE sos_live_sessions
                SET ended_at = ?, latitude = NULL, longitude = NULL, accuracy = NULL, updated_at = NULL
                WHERE id = ?
                """, System.currentTimeMillis(), session.id());
        return Map.of("ok", true);
    }

    @GetMapping("/live/{shareToken}")
    public LiveStatus status(@PathVariable String shareToken) {
        if (!shareToken.matches(TOKEN_PATTERN)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Live location link is invalid or expired.");
        }
        var rows = jdbcTemplate.query(
                "SELECT * FROM sos_live_sessions WHERE share_token = ?", SESSION_MAPPER, shareToken);
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Live location link is invalid or expired.");
        SessionRow session = rows.get(0);
        long now = System.currentTimeMillis();
        boolean active = session.endedAt() == null && session.expiresAt() > now;
        if (!active && session.endedAt() == null) {
            jdbcTemplate.update("""
                    UPDATE sos_live_sessions
                    SET ended_at = ?, latitude = NULL, longitude = NULL, accuracy = NULL, updated_at = NULL
                    WHERE id = ?
                    """, now, session.id());
        }
        LocationData location = active && session.updatedAt() != null
                ? new LocationData(session.latitude(), session.longitude(), session.accuracy(),
                        Instant.ofEpochMilli(session.updatedAt()).toString())
                : null;
        return new LiveStatus(active, Instant.ofEpochMilli(session.expiresAt()).toString(), location);
    }

    private SessionRow requireSession(String id, String authorization) {
        var rows = jdbcTemplate.query("SELECT * FROM sos_live_sessions WHERE id = ?", SESSION_MAPPER, id);
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Live SOS session not found.");
        SessionRow session = rows.get(0);
        if (!isAuthorized(authorization, session.updateTokenHash())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Live SOS session not found.");
        }
        if (session.endedAt() != null || session.expiresAt() <= System.currentTimeMillis()) {
            throw new ResponseStatusException(HttpStatus.GONE, "Live SOS session has ended or expired.");
        }
        return session;
    }

    private boolean isAuthorized(String authorization, String expectedHash) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return false;
        byte[] suppliedHash = hashToken(authorization.substring(7)).getBytes(StandardCharsets.UTF_8);
        byte[] storedHash = expectedHash.getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(suppliedHash, storedHash);
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (java.security.NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    private String randomToken() {
        byte[] token = new byte[32];
        secureRandom.nextBytes(token);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(token);
    }

    private String validateConfiguredBaseUrl(String value) {
        try {
            URI uri = URI.create(value);
            boolean local = "http".equals(uri.getScheme())
                    && ("localhost".equals(uri.getHost()) || "127.0.0.1".equals(uri.getHost()));
            if ((! "https".equals(uri.getScheme()) && !local) || uri.getRawPath() != null && !uri.getRawPath().isEmpty()
                    || uri.getQuery() != null || uri.getFragment() != null) {
                throw new IllegalArgumentException();
            }
            return uri.getScheme() + "://" + uri.getAuthority();
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "PUBLIC_APP_URL must be a public HTTPS origin without a path.");
        }
    }

    private String requestBase(HttpServletRequest request) {
        String referer = request.getHeader("Referer");
        if (referer != null) {
            try {
                URI uri = URI.create(referer);
                if (uri.getScheme() != null && uri.getAuthority() != null) {
                    return uri.getScheme() + "://" + uri.getAuthority();
                }
            } catch (IllegalArgumentException ignored) {
                // Fall through to the request host.
            }
        }
        return request.getScheme() + "://" + request.getServerName()
                + (request.getServerPort() == 80 || request.getServerPort() == 443
                        ? "" : ":" + request.getServerPort());
    }

    public record SessionResponse(String id, String updateToken, String liveUrl, String expiresAt) {}
    public record LocationRequest(double latitude, double longitude, double accuracy) {}
    public record LocationData(double latitude, double longitude, double accuracy, String updatedAt) {}
    public record LiveStatus(boolean active, String expiresAt, @JsonInclude(JsonInclude.Include.NON_NULL) LocationData location) {}
    private record SessionRow(String id, String shareToken, String updateTokenHash, long expiresAt, Long endedAt,
            Double latitude, Double longitude, Double accuracy, Long updatedAt) {}
}
