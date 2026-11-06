package com.featureforge.backend.util;

import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Component
public class HashingUtil {

    public String hash(String rawApiKey) {

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] apiKeyBytes = rawApiKey.getBytes(StandardCharsets.UTF_8);
            byte[] hashedBytes = digest.digest(apiKeyBytes);

            return HexFormat.of().formatHex(hashedBytes);

        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm is not available", e);
        }
    }

    public String hmac(String rawData, String secretKey) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");

            SecretKeySpec keySpec = new SecretKeySpec(
                    secretKey.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            );

            mac.init(keySpec);

            byte [] hmacBytes = mac.doFinal(
                    rawData.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hmacBytes);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("HMAC generation failed",e);
        }
    }
}
