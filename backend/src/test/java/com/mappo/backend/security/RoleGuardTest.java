package com.mappo.backend.security;

import com.mappo.backend.model.User;
import com.mappo.backend.service.CustomUserDetailsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Arrays;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoleGuardTest {

    @Mock
    private CustomUserDetailsService userDetailsService;

    private RoleGuard roleGuard;

    @BeforeEach
    void setUp() {
        roleGuard = new RoleGuard(userDetailsService);
    }

    @Test
    void hasRole_WithAdminUser_ShouldReturnTrue() {
        // Given
        UserDetails adminUser = new org.springframework.security.core.userdetails.User(
            "admin",
            "password",
            Arrays.asList(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );

        // When
        boolean hasRole = roleGuard.hasRole(adminUser, "ADMIN");

        // Then
        assertThat(hasRole).isTrue();
    }

    @Test
    void hasRole_WithBrokerUser_ShouldReturnTrue() {
        // Given
        UserDetails brokerUser = new org.springframework.security.core.userdetails.User(
            "broker",
            "password",
            Arrays.asList(new SimpleGrantedAuthority("ROLE_BROKER"))
        );

        // When
        boolean hasRole = roleGuard.hasRole(brokerUser, "BROKER");

        // Then
        assertThat(hasRole).isTrue();
    }

    @Test
    void hasRole_WithViewerUser_ShouldReturnTrue() {
        // Given
        UserDetails viewerUser = new org.springframework.security.core.userdetails.User(
            "viewer",
            "password",
            Arrays.asList(new SimpleGrantedAuthority("ROLE_VIEWER"))
        );

        // When
        boolean hasRole = roleGuard.hasRole(viewerUser, "VIEWER");

        // Then
        assertThat(hasRole).isTrue();
    }

    @Test
    void hasRole_WithInsufficientRole_ShouldReturnFalse() {
        // Given
        UserDetails viewerUser = new org.springframework.security.core.userdetails.User(
            "viewer",
            "password",
            Arrays.asList(new SimpleGrantedAuthority("ROLE_VIEWER"))
        );

        // When
        boolean hasRole = roleGuard.hasRole(viewerUser, "ADMIN");

        // Then
        assertThat(hasRole).isFalse();
    }

    @Test
    void hasRole_WithNoRoles_ShouldReturnFalse() {
        // Given
        UserDetails userWithNoRoles = new org.springframework.security.core.userdetails.User(
            "user",
            "password",
            Collections.emptyList()
        );

        // When
        boolean hasRole = roleGuard.hasRole(userWithNoRoles, "ADMIN");

        // Then
        assertThat(hasRole).isFalse();
    }

    @Test
    void hasAnyRole_WithMultipleRoles_ShouldReturnTrue() {
        // Given
        UserDetails userWithMultipleRoles = new org.springframework.security.core.userdetails.User(
            "user",
            "password",
            Arrays.asList(
                new SimpleGrantedAuthority("ROLE_BROKER"),
                new SimpleGrantedAuthority("ROLE_VIEWER")
            )
        );

        // When
        boolean hasRole = roleGuard.hasAnyRole(userWithMultipleRoles, "ADMIN", "BROKER");

        // Then
        assertThat(hasRole).isTrue();
    }

    @Test
    void hasAnyRole_WithNoMatchingRoles_ShouldReturnFalse() {
        // Given
        UserDetails userWithRoles = new org.springframework.security.core.userdetails.User(
            "user",
            "password",
            Arrays.asList(new SimpleGrantedAuthority("ROLE_VIEWER"))
        );

        // When
        boolean hasRole = roleGuard.hasAnyRole(userWithRoles, "ADMIN", "BROKER");

        // Then
        assertThat(hasRole).isFalse();
    }
} 