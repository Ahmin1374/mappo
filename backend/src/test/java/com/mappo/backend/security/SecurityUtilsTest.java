package com.mappo.backend.security;

import com.mappo.backend.model.User;
import com.mappo.backend.service.CustomUserDetailsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SecurityUtilsTest {

    @Mock
    private CustomUserDetailsService userDetailsService;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    private SecurityUtils securityUtils;

    @BeforeEach
    void setUp() {
        securityUtils = new SecurityUtils(userDetailsService);
    }

    @Test
    void getCurrentUser_WithAuthenticatedUser_ShouldReturnUser() {
        // Given
        String username = "testuser";
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            username, "password", java.util.Collections.emptyList()
        );
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername(username);

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(userDetailsService.findUserByUsername(username)).thenReturn(Optional.of(user));
        SecurityContextHolder.setContext(securityContext);

        // When
        Optional<User> currentUser = securityUtils.getCurrentUser();

        // Then
        assertThat(currentUser).isPresent();
        assertThat(currentUser.get().getUsername()).isEqualTo(username);
    }

    @Test
    void getCurrentUser_WithNoAuthentication_ShouldReturnEmpty() {
        // Given
        when(securityContext.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(securityContext);

        // When
        Optional<User> currentUser = securityUtils.getCurrentUser();

        // Then
        assertThat(currentUser).isEmpty();
    }

    @Test
    void getCurrentUser_WithUserNotFound_ShouldReturnEmpty() {
        // Given
        String username = "nonexistentuser";
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            username, "password", java.util.Collections.emptyList()
        );

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(userDetailsService.findUserByUsername(username)).thenReturn(Optional.empty());
        SecurityContextHolder.setContext(securityContext);

        // When
        Optional<User> currentUser = securityUtils.getCurrentUser();

        // Then
        assertThat(currentUser).isEmpty();
    }

    @Test
    void getCurrentUsername_WithAuthenticatedUser_ShouldReturnUsername() {
        // Given
        String username = "testuser";
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            username, "password", java.util.Collections.emptyList()
        );

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(authentication.isAuthenticated()).thenReturn(true);
        SecurityContextHolder.setContext(securityContext);

        // When
        Optional<String> currentUsername = securityUtils.getCurrentUsername();

        // Then
        assertThat(currentUsername).isPresent();
        assertThat(currentUsername.get()).isEqualTo(username);
    }

    @Test
    void getCurrentUsername_WithNoAuthentication_ShouldReturnEmpty() {
        // Given
        when(securityContext.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(securityContext);

        // When
        Optional<String> currentUsername = securityUtils.getCurrentUsername();

        // Then
        assertThat(currentUsername).isEmpty();
    }

    @Test
    void isAuthenticated_WithAuthenticatedUser_ShouldReturnTrue() {
        // Given
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        SecurityContextHolder.setContext(securityContext);

        // When
        boolean isAuthenticated = securityUtils.isAuthenticated();

        // Then
        assertThat(isAuthenticated).isTrue();
    }

    @Test
    void isAuthenticated_WithNoAuthentication_ShouldReturnFalse() {
        // Given
        when(securityContext.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(securityContext);

        // When
        boolean isAuthenticated = securityUtils.isAuthenticated();

        // Then
        assertThat(isAuthenticated).isFalse();
    }
} 