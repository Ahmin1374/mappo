package com.mappo.backend.config;

import com.mappo.backend.model.User;
import com.mappo.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds demo users (one per role) for local development.
 * Only runs when {@code app.demo-users.password} is set (env: DEMO_USER_PASSWORD).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.demo-users.password:}")
    private String demoPassword;

    @Override
    public void run(String... args) {
        if (demoPassword == null || demoPassword.isBlank()) {
            log.info("Demo users disabled (DEMO_USER_PASSWORD not set)");
            return;
        }
        createUserIfNotExists("testuser", "USER");
        createUserIfNotExists("admin", "ADMIN");
        createUserIfNotExists("broker", "BROKER");
        createUserIfNotExists("viewer", "VIEWER");
    }

    private void createUserIfNotExists(String username, String role) {
        if (userRepository.findByUsername(username).isPresent()) {
            log.debug("Demo user already exists: {}", username);
            return;
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(demoPassword));
        user.setRole(role);
        user.setEnabled(true);
        userRepository.save(user);
        log.info("Demo user created: {} (role {})", username, role);
    }
}
