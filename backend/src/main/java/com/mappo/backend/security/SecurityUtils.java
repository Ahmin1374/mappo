package com.mappo.backend.security;

import com.mappo.backend.model.User;
import com.mappo.backend.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final CustomUserDetailsService userDetailsService;

    /**
     * Get the current authenticated user
     */
    public Optional<User> getCurrentUser() {
        return getCurrentUsername()
                .flatMap(userDetailsService::findUserByUsername);
    }

    /**
     * Get the current authenticated username
     */
    public Optional<String> getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            return Optional.of(((UserDetails) principal).getUsername());
        } else if (principal instanceof String) {
            return Optional.of((String) principal);
        }

        return Optional.empty();
    }

    /**
     * Check if user is currently authenticated
     */
    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }

    /**
     * Get current user details
     */
    public Optional<UserDetails> getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            return Optional.of((UserDetails) principal);
        }

        return Optional.empty();
    }

    /**
     * Check if current user has a specific role
     */
    public boolean hasRole(String role) {
        return getCurrentUserDetails()
                .map(userDetails -> {
                    String roleWithPrefix = role.startsWith("ROLE_") ? role : "ROLE_" + role;
                    return userDetails.getAuthorities().stream()
                            .anyMatch(authority -> authority.getAuthority().equals(roleWithPrefix));
                })
                .orElse(false);
    }

    /**
     * Check if current user is admin
     */
    public boolean isAdmin() {
        return hasRole("ADMIN");
    }

    /**
     * Check if current user is broker
     */
    public boolean isBroker() {
        return hasRole("BROKER");
    }

    /**
     * Check if current user is viewer
     */
    public boolean isViewer() {
        return hasRole("VIEWER");
    }
} 