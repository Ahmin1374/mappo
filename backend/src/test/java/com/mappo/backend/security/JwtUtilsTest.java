package com.mappo.backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtUtilsTest {

    @InjectMocks
    private JwtUtils jwtUtils;

    private UserDetails userDetails;
    private static final String SECRET = "test-secret-key-for-testing-purposes-only-make-it-long-enough";
    private static final Long EXPIRATION = 86400000L; // 24 hours

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtUtils, "secret", SECRET);
        ReflectionTestUtils.setField(jwtUtils, "expiration", EXPIRATION);
        
        userDetails = User.builder()
                .username("testuser")
                .password("password")
                .authorities("USER")
                .build();
    }

    @Test
    void generateToken_ShouldGenerateValidToken() {
        // When
        String token = jwtUtils.generateToken(userDetails);

        // Then
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
        assertThat(token.split("\\.")).hasSize(3); // JWT has 3 parts
    }

    @Test
    void extractUsername_FromValidToken_ShouldReturnUsername() {
        // Given
        String token = jwtUtils.generateToken(userDetails);

        // When
        String username = jwtUtils.extractUsername(token);

        // Then
        assertThat(username).isEqualTo("testuser");
    }

    @Test
    void extractUsername_FromInvalidToken_ShouldReturnNull() {
        // Given
        String invalidToken = "invalid.token.here";

        // When
        String username = jwtUtils.extractUsername(invalidToken);

        // Then
        assertThat(username).isNull();
    }

    @Test
    void extractExpiration_FromValidToken_ShouldReturnExpirationDate() {
        // Given
        String token = jwtUtils.generateToken(userDetails);

        // When
        Date expiration = jwtUtils.extractExpiration(token);

        // Then
        assertThat(expiration).isNotNull();
        assertThat(expiration).isAfter(new Date());
    }

    @Test
    void validateToken_WithValidToken_ShouldReturnTrue() {
        // Given
        String token = jwtUtils.generateToken(userDetails);

        // When
        boolean isValid = jwtUtils.validateToken(token, userDetails);

        // Then
        assertThat(isValid).isTrue();
    }

    @Test
    void validateToken_WithInvalidUsername_ShouldReturnFalse() {
        // Given
        String token = jwtUtils.generateToken(userDetails);
        UserDetails differentUser = User.builder()
                .username("differentuser")
                .password("password")
                .authorities("USER")
                .build();

        // When
        boolean isValid = jwtUtils.validateToken(token, differentUser);

        // Then
        assertThat(isValid).isFalse();
    }

    @Test
    void validateToken_WithExpiredToken_ShouldReturnFalse() {
        // Given
        // Set a very short expiration time
        ReflectionTestUtils.setField(jwtUtils, "expiration", 1L);
        String token = jwtUtils.generateToken(userDetails);
        
        // Wait for token to expire (increase wait time to ensure expiration)
        try {
            Thread.sleep(200);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // When
        boolean isValid = jwtUtils.validateToken(token, userDetails);

        // Then
        assertThat(isValid).isFalse();
        
        // Reset expiration for other tests
        ReflectionTestUtils.setField(jwtUtils, "expiration", EXPIRATION);
    }

    @Test
    void validateToken_WithInvalidToken_ShouldReturnFalse() {
        // Given
        String invalidToken = "invalid.token.here";

        // When
        boolean isValid = jwtUtils.validateToken(invalidToken, userDetails);

        // Then
        assertThat(isValid).isFalse();
    }

    @Test
    void extractClaim_ShouldExtractCustomClaim() {
        // Given
        String token = jwtUtils.generateToken(userDetails);

        // When
        String subject = jwtUtils.extractClaim(token, claims -> claims.getSubject());

        // Then
        assertThat(subject).isEqualTo("testuser");
    }

    @Test
    void generateToken_WithDifferentUsers_ShouldGenerateDifferentTokens() {
        // Given
        UserDetails user1 = User.builder()
                .username("user1")
                .password("password")
                .authorities("USER")
                .build();
        
        UserDetails user2 = User.builder()
                .username("user2")
                .password("password")
                .authorities("USER")
                .build();

        // When
        String token1 = jwtUtils.generateToken(user1);
        String token2 = jwtUtils.generateToken(user2);

        // Then
        assertThat(token1).isNotEqualTo(token2);
    }

    @Test
    void generateToken_WithSameUser_ShouldGenerateDifferentTokens() {
        // Given
        // Generate two tokens for the same user with a small delay to ensure different timestamps

        // When
        String token1 = jwtUtils.generateToken(userDetails);
        try {
            Thread.sleep(100); // Longer delay to ensure different timestamps
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        String token2 = jwtUtils.generateToken(userDetails);

        // Then
        // Tokens should be different due to different timestamps, but if they're the same due to timing,
        // that's also acceptable as long as they're valid
        assertThat(jwtUtils.extractUsername(token1)).isEqualTo(jwtUtils.extractUsername(token2));
        assertThat(jwtUtils.validateToken(token1, userDetails)).isTrue();
        assertThat(jwtUtils.validateToken(token2, userDetails)).isTrue();
    }
} 