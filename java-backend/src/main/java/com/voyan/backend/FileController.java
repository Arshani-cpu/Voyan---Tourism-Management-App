package com.voyan.backend;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/files")
public class FileController {
    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;

    private final Path storageRoot;
    private final FirebaseIdentityVerifier identityVerifier;

    public FileController(
            @Value("${voyan.files-path}") String filesPath,
            FirebaseIdentityVerifier identityVerifier) {
        this.storageRoot = Path.of(filesPath).toAbsolutePath().normalize();
        this.identityVerifier = identityVerifier;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> upload(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "Authorization", required = false) String authorization) throws IOException {
        String userId = requireUser(authorization);
        if (file.isEmpty() || file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a file smaller than 10 MB");
        }

        String contentType = safeContentType(file.getContentType());
        String id = UUID.randomUUID() + fileExtension(contentType);
        Path userDirectory = storageRoot.resolve(userId).normalize();
        if (!userDirectory.startsWith(storageRoot)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid user storage path");
        }
        Files.createDirectories(userDirectory);
        Files.write(userDirectory.resolve(id), file.getBytes());
        return Map.of(
                "id", id,
                "name", safeFileName(file.getOriginalFilename()),
                "contentType", contentType,
                "size", file.getSize());
    }

    @GetMapping("/{fileId}")
    public ResponseEntity<ByteArrayResource> download(
            @PathVariable String fileId,
            @RequestHeader(value = "Authorization", required = false) String authorization) throws IOException {
        String userId = requireUser(authorization);
        Path file = resolveFile(userId, fileId);
        if (!Files.isRegularFile(file)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
        }
        byte[] content = Files.readAllBytes(file);
        String contentType = contentTypeFromId(fileId);
        ContentDisposition disposition = contentType.startsWith("image/")
                ? ContentDisposition.inline().filename(fileId).build()
                : ContentDisposition.attachment().filename(fileId).build();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .header("X-Content-Type-Options", "nosniff")
                .body(new ByteArrayResource(content));
    }

    @DeleteMapping("/{fileId}")
    public Map<String, Object> delete(
            @PathVariable String fileId,
            @RequestHeader(value = "Authorization", required = false) String authorization) throws IOException {
        String userId = requireUser(authorization);
        if (!Files.deleteIfExists(resolveFile(userId, fileId))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
        }
        return Map.of("ok", true);
    }

    private Path resolveFile(String userId, String fileId) {
        if (!fileId.matches("^[0-9a-fA-F-]{36}(\\.jpg|\\.png|\\.webp|\\.gif|\\.pdf|\\.txt|\\.bin)$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file ID");
        }
        Path userDirectory = storageRoot.resolve(userId).normalize();
        Path file = userDirectory.resolve(fileId).normalize();
        if (!userDirectory.startsWith(storageRoot) || !file.startsWith(userDirectory)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file path");
        }
        return file;
    }

    private String requireUser(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Firebase sign-in is required");
        }
        return identityVerifier.verify(authorization.substring(7));
    }

    private String safeContentType(String contentType) {
        if (contentType == null) return MediaType.APPLICATION_OCTET_STREAM_VALUE;
        return switch (contentType.toLowerCase()) {
            case "image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf", "text/plain" -> contentType;
            default -> MediaType.APPLICATION_OCTET_STREAM_VALUE;
        };
    }

    private String fileExtension(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            case "application/pdf" -> ".pdf";
            case "text/plain" -> ".txt";
            default -> ".bin";
        };
    }

    private String contentTypeFromId(String fileId) {
        return switch (fileId.substring(fileId.lastIndexOf('.') + 1)) {
            case "jpg" -> "image/jpeg";
            case "png" -> "image/png";
            case "webp" -> "image/webp";
            case "gif" -> "image/gif";
            case "pdf" -> "application/pdf";
            case "txt" -> "text/plain";
            default -> MediaType.APPLICATION_OCTET_STREAM_VALUE;
        };
    }

    private String safeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) return "upload";
        String sanitized = fileName.replaceAll("[\\\\/\\r\\n\\u0000]", "_");
        return sanitized.length() > 180 ? sanitized.substring(sanitized.length() - 180) : sanitized;
    }
}
