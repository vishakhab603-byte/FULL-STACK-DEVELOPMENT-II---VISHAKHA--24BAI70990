package com.example.backend.util;

import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AesUtilTest {

    private final AesUtil aesUtil = new AesUtil(Base64.getEncoder().encodeToString(new byte[32]));

    @Test
    void encryptsAndDecryptsUtf8WithRandomizedCiphertext() throws Exception {
        String plaintext = "credential π";

        String first = aesUtil.encrypt(plaintext);
        String second = aesUtil.encrypt(plaintext);

        assertThat(first).isNotEqualTo(second);
        assertThat(aesUtil.decrypt(first)).isEqualTo(plaintext);
        assertThat(aesUtil.decrypt(second)).isEqualTo(plaintext);
    }

    @Test
    void rejectsTamperedCiphertext() throws Exception {
        byte[] encrypted = Base64.getDecoder().decode(aesUtil.encrypt("credential"));
        encrypted[encrypted.length - 1] ^= 1;
        String tampered = Base64.getEncoder().encodeToString(encrypted);

        assertThatThrownBy(() -> aesUtil.decrypt(tampered))
            .isInstanceOf(javax.crypto.AEADBadTagException.class);
    }

    @Test
    void rejectsInvalidKeySize() {
        String shortKey = Base64.getEncoder().encodeToString(new byte[8]);

        assertThatThrownBy(() -> new AesUtil(shortKey))
            .isInstanceOf(IllegalArgumentException.class);
    }
}
