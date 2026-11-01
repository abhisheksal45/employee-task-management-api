package com.example.employeetaskmanager.service;


import com.example.employeetaskmanager.DTO.LoginResponse;
import com.example.employeetaskmanager.security.JwtService;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private static final String SECRET = "unit-test-secret-that-is-definitely-longer-than-32-bytes";

    private JwtService jwtService;
    private JwtDecoder decoder;
    private Authentication adminAuth;

    @BeforeEach
    void setUp() {
        SecretKey key = new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        jwtService = new JwtService(new NimbusJwtEncoder(new ImmutableSecret<>(key)),
                "test-issuer", 30);
        decoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();

        adminAuth = UsernamePasswordAuthenticationToken.authenticated(
                "rahul", null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
    }

    @Test
    @DisplayName("token carries subject, roles, issuer and a future expiry")
    void generateToken_containsExpectedClaims() {
        LoginResponse response = jwtService.generateToken(adminAuth);

        Jwt jwt = decoder.decode(response.accessToken());

        assertEquals("rahul", jwt.getSubject());
        assertEquals(List.of("ROLE_ADMIN"), jwt.getClaimAsStringList("roles"));
        assertEquals("test-issuer", jwt.getClaimAsString("iss"));
        assertTrue(jwt.getExpiresAt().isAfter(Instant.now()));
        assertEquals("Bearer", response.tokenType());
        assertEquals(30 * 60, response.expiresInSeconds());
    }

    @Test
    @DisplayName("a tampered token is rejected")
    void tamperedToken_isRejected() {
        String token = jwtService.generateToken(adminAuth).accessToken();
        String tampered = token.substring(0, token.length() - 3) + "abc";   // signature badli

        assertThrows(JwtException.class, () -> decoder.decode(tampered));
    }

    @Test
    @DisplayName("a token signed with another secret is rejected")
    void tokenFromAnotherSecret_isRejected() {
        String token = jwtService.generateToken(adminAuth).accessToken();

        SecretKey otherKey = new SecretKeySpec(
                "a-completely-different-secret-key-of-enough-length!".getBytes(StandardCharsets.UTF_8),
                "HmacSHA256");
        JwtDecoder otherDecoder = NimbusJwtDecoder.withSecretKey(otherKey)
                .macAlgorithm(MacAlgorithm.HS256).build();

        assertThrows(JwtException.class, () -> otherDecoder.decode(token));
    }
}
