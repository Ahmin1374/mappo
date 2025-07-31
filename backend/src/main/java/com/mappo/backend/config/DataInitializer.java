package com.mappo.backend.config;

import com.mappo.backend.model.User;
import com.mappo.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create test user if it doesn't exist
        if (!userRepository.findByUsername("testuser").isPresent()) {
            User testUser = new User();
            testUser.setUsername("testuser");
            testUser.setPassword(passwordEncoder.encode("password")); // BCrypt encoded password
            testUser.setRole("USER");
            testUser.setEnabled(true);
            // createdAt will be set automatically by @PrePersist
            
            userRepository.save(testUser);
            System.out.println("✅ Test user created: testuser / password");
        } else {
            System.out.println("ℹ️ Test user already exists");
        }
    }
} 