package com.voyan.backend;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class EmailController {
    private static final Logger logger = LoggerFactory.getLogger(EmailController.class);
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private final FirebaseIdentityVerifier identityVerifier;
    private final String smtpHost;
    private final int smtpPort;
    private final String smtpUser;
    private final String smtpPass;
    private final String mailFrom;
    private final String firebaseServiceAccount;
    private final ConcurrentHashMap<String, Long> lastVerificationSent = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, java.util.ArrayDeque<Long>> sendAttempts = new ConcurrentHashMap<>();

    public EmailController(
            FirebaseIdentityVerifier identityVerifier,
            @Value("${voyan.smtp-host}") String smtpHost,
            @Value("${voyan.smtp-port}") int smtpPort,
            @Value("${voyan.smtp-user}") String smtpUser,
            @Value("${voyan.smtp-pass}") String smtpPass,
            @Value("${voyan.mail-from}") String mailFrom,
            @Value("${voyan.firebase-service-account}") String firebaseServiceAccount) {
        this.identityVerifier = identityVerifier;
        this.smtpHost = smtpHost;
        this.smtpPort = smtpPort;
        this.smtpUser = smtpUser;
        this.smtpPass = smtpPass;
        this.mailFrom = mailFrom;
        this.firebaseServiceAccount = firebaseServiceAccount;
    }

    @PostMapping("/api/send-email")
    public Map<String, Object> sendTripEmail(@RequestBody TripEmailRequest request,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        requireValidEmail(request.to());
        enforceRateLimit(servletRequest.getRemoteAddr());
        String tripTitle = cleanHeader(request.tripTitle(), "Your trip");
        String destination = cleanText(request.destination());
        String shareUrl = cleanText(request.shareUrl());
        String text = "Your Voyan itinerary: " + tripTitle + "\nDestination: " + destination
                + "\n\nView your itinerary: " + shareUrl;
        String html = "<div style=\"font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#292524\">"
                + "<h1 style=\"font-size:22px;color:#115e59\">Your Voyan itinerary</h1><h2 style=\"font-size:18px\">"
                + escapeHtml(tripTitle) + "</h2><p style=\"color:#57534e\">Destination: "
                + escapeHtml(destination) + "</p><p><a href=\"" + escapeHtml(shareUrl)
                + "\" style=\"display:inline-block;padding:12px 18px;background:#115e59;color:#fff;text-decoration:none;border-radius:8px\">View itinerary</a></p><p style=\"font-size:12px;color:#78716c\">"
                + escapeHtml(shareUrl) + "</p></div>";
        send(request.to(), "Your Voyan itinerary: " + tripTitle, text, html);
        return Map.of("ok", true);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleEmailError(ResponseStatusException exception) {
        String reason = exception.getReason();
        return ResponseEntity.status(exception.getStatusCode())
                .body(Map.of("error", reason == null ? "Email request failed." : reason));
    }

    @PostMapping("/api/auth/send-verification-email")
    public Map<String, Object> sendVerificationEmail(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "A Firebase sign-in token is required");
        }
        FirebaseIdentityVerifier.FirebaseUser user = identityVerifier.lookup(authorization.substring(7));
        if (user.email().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The signed-in Firebase account has no email address");
        }
        if (user.emailVerified()) return Map.of("sent", false, "verified", true);
        requireSmtp();

        long now = System.currentTimeMillis();
        Long previousAttempt = lastVerificationSent.get(user.uid());
        if (previousAttempt != null && now - previousAttempt < 60_000) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "A verification email was just sent. Check your inbox before retrying.");
        }

        try {
            FirebaseAuth firebaseAuth = firebaseAuth();
            String verificationLink = firebaseAuth.generateEmailVerificationLink(user.email());
            String safeEmail = escapeHtml(user.email());
            String safeLink = escapeHtml(verificationLink);
            send(
                    user.email(),
                    "Verify your Voyan email address",
                    "Verify your email address to secure your Voyan account:\n\n" + verificationLink
                            + "\n\nIf you did not sign in to Voyan, you can ignore this email.",
                    "<div style=\"font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#292524\"><h1 style=\"font-size:22px;color:#115e59\">Verify your email</h1><p>Confirm <strong>"
                            + safeEmail
                            + "</strong> to secure your Voyan account.</p><p><a href=\""
                            + safeLink
                            + "\" style=\"display:inline-block;padding:12px 18px;background:#115e59;color:#fff;text-decoration:none;border-radius:8px\">Verify email address</a></p><p style=\"font-size:12px;color:#78716c\">If you did not sign in to Voyan, you can ignore this email.</p></div>");
            lastVerificationSent.put(user.uid(), now);
            return Map.of("sent", true, "verified", false);
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not send the verification email. Check Firebase Admin and SMTP configuration.");
        }
    }

    private FirebaseAuth firebaseAuth() throws Exception {
        if (firebaseServiceAccount.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Firebase Admin service account is not configured");
        }
        FirebaseApp app = FirebaseApp.getApps().stream()
                .filter(candidate -> candidate.getName().equals("voyan-email-verification"))
                .findFirst()
                .orElseGet(() -> {
                    try {
                        GoogleCredentials credentials = GoogleCredentials.fromStream(
                                new ByteArrayInputStream(firebaseServiceAccount.getBytes(StandardCharsets.UTF_8)));
                        return FirebaseApp.initializeApp(
                                FirebaseOptions.builder().setCredentials(credentials).build(),
                                "voyan-email-verification");
                    } catch (Exception exception) {
                        throw new IllegalStateException("Firebase Admin configuration is invalid", exception);
                    }
                });
        return FirebaseAuth.getInstance(app);
    }

    private void enforceRateLimit(String key) {
        long now = System.currentTimeMillis();
        var attempts = sendAttempts.computeIfAbsent(key, ignored -> new java.util.ArrayDeque<>());
        synchronized (attempts) {
            while (!attempts.isEmpty() && now - attempts.peekFirst() > 10 * 60_000) attempts.removeFirst();
            if (attempts.size() >= 5) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                        "Email sending limit exceeded. Try again in 10 minutes.");
            }
            attempts.addLast(now);
        }
    }

    private void requireValidEmail(String value) {
        if (value == null || !EMAIL.matcher(value).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A valid email address is required");
        }
    }

    private void requireSmtp() {
        if (smtpHost.isBlank() || smtpUser.isBlank() || smtpPass.isBlank() || mailFrom.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Email is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and MAIL_FROM in the backend environment.");
        }
        if (smtpPort < 1 || smtpPort > 65535) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "SMTP_PORT must be a valid port number");
        }
    }

    private void send(String to, String subject, String text, String html) {
        requireSmtp();
        try {
            JavaMailSenderImpl sender = new JavaMailSenderImpl();
            sender.setHost(smtpHost);
            sender.setPort(smtpPort);
            sender.setUsername(smtpUser);
            sender.setPassword(smtpPass);
            sender.setProtocol("smtp");
            sender.getJavaMailProperties().put("mail.smtp.auth", "true");
            sender.getJavaMailProperties().put("mail.smtp.starttls.enable", smtpPort != 465);
            sender.getJavaMailProperties().put("mail.smtp.ssl.enable", smtpPort == 465);
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(to);
            helper.setSubject(cleanHeader(subject, "Voyan"));
            helper.setText(text, html);
            sender.send(message);
        } catch (Exception exception) {
            logger.warn("SMTP delivery failed ({})", exception.getClass().getSimpleName());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "The SMTP provider rejected or could not deliver the email. Check the SMTP host, port, credentials, sender address, and provider app-password settings.");
        }
    }

    private String cleanHeader(String value, String fallback) {
        if (value == null || value.isBlank()) return fallback;
        return value.replaceAll("[\\r\\n]", " ").substring(0, Math.min(value.length(), 160));
    }

    private String cleanText(String value) {
        return value == null ? "" : value.substring(0, Math.min(value.length(), 4000));
    }

    private String escapeHtml(String value) {
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&#39;");
    }

    public record TripEmailRequest(String to, String tripTitle, String destination, String shareUrl) {}
}
