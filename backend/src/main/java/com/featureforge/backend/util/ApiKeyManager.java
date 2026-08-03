package com.featureforge.backend.util;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Component
public class ApiKeyManager {

    public String hashApiKey(String rawApiKey) {

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] apiKeyBytes = rawApiKey.getBytes(StandardCharsets.UTF_8);
            byte[] hashedBytes = digest.digest(apiKeyBytes);

            return HexFormat.of().formatHex(hashedBytes);

        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm is not available", e);
        }
    }
}
