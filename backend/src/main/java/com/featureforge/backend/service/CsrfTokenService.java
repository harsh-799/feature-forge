package com.featureforge.backend.service;

import com.featureforge.backend.util.HashingUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class CsrfTokenService {

    @Value("${csrf.secret}")
    private String CSRF_SECRET_KEY;

    private final HashingUtil hashingUtil;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Duration TOKEN_EXPIRY = Duration.ofMinutes(15);

    public String generateNewCsrfToken() {

        byte[] randomBytes = new byte[32];

        SECURE_RANDOM.nextBytes(randomBytes);

        String nonce = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        long expiry = Instant.now()
                .plus(TOKEN_EXPIRY)
                .getEpochSecond();

        String data = nonce + ":" + expiry + ":";
        String signature = hashingUtil.hmac(data, CSRF_SECRET_KEY);

        return nonce + "." + expiry + "." + signature;
    }

    public boolean validateCsrfToken(String token) {

        if (token == null || token.isBlank()) {
            return false;
        }

        try {
            String[] parts = token.split("\\.", -1);

            if (parts.length != 3) {
                return false;
            }

            String nonce = parts[0];
            long expiry = Long.parseLong(parts[1]);
            String providedSignature = parts[2];

            // Validate nonce format and length
            byte[] decodedNonce = Base64.getUrlDecoder().decode(nonce);

            if (decodedNonce.length != 32) {
                return false;
            }

            // Check expiration
            if (Instant.now().getEpochSecond() >= expiry) {
                return false;
            }

            // Recalculate signature
            String data = nonce + ":" + expiry + ":";
            String expectedSignature = hashingUtil.hmac(data, CSRF_SECRET_KEY);

            // Constant-time signature comparison
            return MessageDigest.isEqual(
                    expectedSignature.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                    providedSignature.getBytes(java.nio.charset.StandardCharsets.UTF_8)
            );

        } catch (IllegalArgumentException ex) {
            return false;
        }
    }


}
