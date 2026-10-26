package com.voyan.backend;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Enumeration;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UtilityController {
    private final String publicBaseUrl;
    public UtilityController(@Value("${voyan.public-base-url}") String publicBaseUrl) {
        this.publicBaseUrl = publicBaseUrl;
    }

    @GetMapping("/api/mobile-app-url")
    public Map<String, String> mobileAppUrl(HttpServletRequest request) {
        if (!publicBaseUrl.isBlank()) return Map.of("url", stripSlash(publicBaseUrl));

        String referer = request.getHeader("Referer");
        if (referer != null) {
            try {
                java.net.URI uri = java.net.URI.create(referer);
                if (uri.getScheme() != null && uri.getAuthority() != null) {
                    return Map.of("url", uri.getScheme() + "://" + uri.getAuthority());
                }
            } catch (IllegalArgumentException ignored) {
                // Fall through to the request host when the referer is not a valid URI.
            }
        }

        String host = request.getServerName();
        if (host.equals("localhost") || host.equals("127.0.0.1")) {
            host = firstLanAddress().orElse(host);
        }
        int port = request.getServerPort();
        return Map.of("url", request.getScheme() + "://" + host + (port == 80 || port == 443 ? "" : ":" + port));
    }

    private java.util.Optional<String> firstLanAddress() {
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface networkInterface = interfaces.nextElement();
                Enumeration<InetAddress> addresses = networkInterface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress address = addresses.nextElement();
                    if (!address.isLoopbackAddress() && address instanceof java.net.Inet4Address
                            && !address.getHostAddress().startsWith("169.254.")) {
                        return java.util.Optional.of(address.getHostAddress());
                    }
                }
            }
        } catch (Exception ignored) {
            return java.util.Optional.empty();
        }
        return java.util.Optional.empty();
    }

    private String stripSlash(String value) {
        return value.replaceAll("/+$", "");
    }
}
