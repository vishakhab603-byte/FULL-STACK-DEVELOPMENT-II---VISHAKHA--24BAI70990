package com.example.backend.util;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AesUtil {
    private static final int NONCE_LENGTH = 12;
    private static final int TAG_LENGTH_BITS = 128;
    private final SecretKeySpec key;

    public AesUtil(@Value("${aes.secret}") String secret) {
        byte[] keyBytes = Base64.getDecoder().decode(secret);
        if (keyBytes.length != 16 && keyBytes.length != 24 && keyBytes.length != 32) {
            throw new IllegalArgumentException("AES_SECRET must be base64-encoded 16, 24, or 32 byte key material.");
        }
        key = new SecretKeySpec(keyBytes, "AES");
    }

    public String encrypt(String data) throws Exception {
        byte[] nonce = new byte[NONCE_LENGTH];
        new SecureRandom().nextBytes(nonce);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BITS, nonce));
        byte[] ciphertext = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));
        ByteBuffer payload = ByteBuffer.allocate(nonce.length + ciphertext.length);
        payload.put(nonce);
        payload.put(ciphertext);
        return Base64.getEncoder().encodeToString(payload.array());
    }

    public String decrypt(String encryptedData) throws Exception {
        byte[] payload = Base64.getDecoder().decode(encryptedData);
        if (payload.length < NONCE_LENGTH + TAG_LENGTH_BITS / Byte.SIZE) {
            throw new IllegalArgumentException("Encrypted value is too short.");
        }
        ByteBuffer buffer = ByteBuffer.wrap(payload);
        byte[] nonce = new byte[NONCE_LENGTH];
        buffer.get(nonce);
        byte[] ciphertext = new byte[buffer.remaining()];
        buffer.get(ciphertext);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BITS, nonce));
        return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
    }
}
