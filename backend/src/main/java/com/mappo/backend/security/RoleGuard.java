package com.mappo.backend.security;

import com.mappo.backend.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class RoleGuard {

    private final CustomUserDetailsService userDetailsService;

    /**
     * Check if user has a specific role
     */
    public boolean hasRole(UserDetails userDetails, String role) {
        if (userDetails == null || role == null) {
            return false;
        }

        String roleWithPrefix = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return userDetails.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals(roleWithPrefix));
    }

    /**
     * Check if user has any of the specified roles
     */
    public boolean hasAnyRole(UserDetails userDetails, String... roles) {
        if (userDetails == null || roles == null || roles.length == 0) {
            return false;
        }

        return Arrays.stream(roles)
                .anyMatch(role -> hasRole(userDetails, role));
    }

    /**
     * Check if user has all of the specified roles
     */
    public boolean hasAllRoles(UserDetails userDetails, String... roles) {
        if (userDetails == null || roles == null || roles.length == 0) {
            return false;
        }

        return Arrays.stream(roles)
                .allMatch(role -> hasRole(userDetails, role));
    }

    /**
     * Get user roles as a list of strings
     */
    public List<String> getUserRoles(UserDetails userDetails) {
        if (userDetails == null) {
            return List.of();
        }

        return userDetails.getAuthorities().stream()
                .map(authority -> {
                    String role = authority.getAuthority();
                    return role.startsWith("ROLE_") ? role.substring(5) : role;
                })
                .toList();
    }

    /**
     * Check if user is admin
     */
    public boolean isAdmin(UserDetails userDetails) {
        return hasRole(userDetails, "ADMIN");
    }

    /**
     * Check if user is broker
     */
    public boolean isBroker(UserDetails userDetails) {
        return hasRole(userDetails, "BROKER");
    }

    /**
     * Check if user is viewer
     */
    public boolean isViewer(UserDetails userDetails) {
        return hasRole(userDetails, "VIEWER");
    }
} 