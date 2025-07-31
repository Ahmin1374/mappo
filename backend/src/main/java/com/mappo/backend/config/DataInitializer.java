package com.mappo.backend.config;

import com.mappo.backend.model.User;
import com.mappo.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create test users with different roles if they don't exist
        createUserIfNotExists("testuser", "password", "USER");
        createUserIfNotExists("admin", "password", "ADMIN");
        createUserIfNotExists("broker", "password", "BROKER");
        createUserIfNotExists("viewer", "password", "VIEWER");
    }

    private void createUserIfNotExists(String username, String password, String role) {
        if (!userRepository.findByUsername(username).isPresent()) {
            User user = new User();
            // Don't set explicit UUID - let JPA generate it
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            user.setEnabled(true);
            // createdAt will be set automatically by @PrePersist
            
            userRepository.save(user);
            System.out.println("✅ Test user created: " + username + " / " + password + " (Role: " + role + ")");
        } else {
            System.out.println("ℹ️ Test user already exists: " + username);
        }
    }
} 