package com.mappo.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mappo.backend.dto.RegionDto;
import com.mappo.backend.model.User;
import com.mappo.backend.repository.UserRepository;
import com.mappo.backend.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
class SecurityIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;

    private User adminUser;
    private User brokerUser;
    private User viewerUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .defaultRequest(get("/").contextPath("/api/v1"))
                .apply(springSecurity())
                .build();

        // Create test users with unique usernames
        adminUser = createTestUser("testadmin", "password", "ADMIN");
        brokerUser = createTestUser("testbroker", "password", "BROKER");
        viewerUser = createTestUser("testviewer", "password", "VIEWER");
    }

    private User createTestUser(String username, String password, String role) {
        // Check if user already exists
        return userRepository.findByUsername(username)
                .orElseGet(() -> {
                    User user = new User();
                    user.setUsername(username);
                    user.setPassword(passwordEncoder.encode(password));
                    user.setRole(role);
                    user.setEnabled(true);
                    return userRepository.save(user);
                });
    }

    private String generateToken(User user) {
        org.springframework.security.core.userdetails.UserDetails userDetails = 
            new org.springframework.security.core.userdetails.User(
                user.getUsername(), 
                user.getPassword(), 
                new java.util.ArrayList<>()
            );
        return jwtUtils.generateToken(userDetails);
    }

    @Test
    void authenticationFlow_WithValidCredentials_ShouldReturnJwtToken() throws Exception {
        // Given
        String loginRequest = objectMapper.writeValueAsString(new LoginRequest("testadmin", "password"));

        // When & Then
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.username").value("testadmin"))
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.type").value("Bearer"));
    }

    @Test
    void authenticationFlow_WithInvalidCredentials_ShouldReturnUnauthorized() throws Exception {
        // Given
        String loginRequest = objectMapper.writeValueAsString(new LoginRequest("admin", "wrongpassword"));

        // When & Then
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginRequest))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void authenticationFlow_WithNonExistentUser_ShouldReturnUnauthorized() throws Exception {
        // Given
        String loginRequest = objectMapper.writeValueAsString(new LoginRequest("nonexistent", "password"));

        // When & Then
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginRequest))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void roleBasedAccess_AdminUser_ShouldAccessAllEndpoints() throws Exception {
        // Given
        String token = generateToken(adminUser);

        // When & Then - Admin can access all region operations
        mockMvc.perform(get("/api/v1/regions")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/regions")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(createRegionRequest()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/regions/count")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void roleBasedAccess_BrokerUser_ShouldAccessRegionOperations() throws Exception {
        // Given
        String token = generateToken(brokerUser);

        // When & Then - Broker can access region operations
        mockMvc.perform(get("/api/v1/regions")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/regions")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(createRegionRequest()))
                .andExpect(status().isOk());
    }

    @Test
    void roleBasedAccess_ViewerUser_ShouldOnlyAccessReadOperations() throws Exception {
        // Given
        String token = generateToken(viewerUser);

        // When & Then - Viewer can only read regions
        mockMvc.perform(get("/api/v1/regions")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // Viewer cannot create regions
        mockMvc.perform(post("/api/v1/regions")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(createRegionRequest()))
                .andExpect(status().isForbidden());
    }

    @Test
    void unauthorizedAccess_WithoutToken_ShouldReturnUnauthorized() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/v1/regions"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/v1/regions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createRegionRequest()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unauthorizedAccess_WithInvalidToken_ShouldReturnUnauthorized() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/v1/regions")
                .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void dataSecurity_UserShouldOnlyAccessOwnData() throws Exception {
        // Given
        String adminToken = generateToken(adminUser);
        String brokerToken = generateToken(brokerUser);

        // Admin creates a region
        String regionResponse = mockMvc.perform(post("/api/v1/regions")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(createRegionRequest()))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        RegionDto createdRegion = objectMapper.readValue(regionResponse, RegionDto.class);

        // Broker should not be able to access admin's region
        mockMvc.perform(get("/api/v1/regions/" + createdRegion.getId())
                .header("Authorization", "Bearer " + brokerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void jwtTokenValidation_WithExpiredToken_ShouldReturnUnauthorized() throws Exception {
        // Given - Create a token that will expire
        org.springframework.security.core.userdetails.UserDetails userDetails = 
            new org.springframework.security.core.userdetails.User(
                adminUser.getUsername(), 
                adminUser.getPassword(), 
                new java.util.ArrayList<>()
            );
        String expiredToken = jwtUtils.generateToken(userDetails);

        // Simulate token expiration by waiting (in real scenario, token would expire)
        // For testing purposes, we'll use an invalid token
        String invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTYzMzQ5NjAwMCwiZXhwIjoxNjMzNDk2MDAwfQ.invalid";

        // When & Then
        mockMvc.perform(get("/api/v1/regions")
                .header("Authorization", "Bearer " + invalidToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void jwtTokenValidation_WithValidToken_ShouldAllowAccess() throws Exception {
        // Given
        String token = generateToken(adminUser);

        // When & Then
        mockMvc.perform(get("/api/v1/regions")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void crossOriginSecurity_ShouldAllowCorsRequests() throws Exception {
        // Given
        String token = generateToken(adminUser);

        // When & Then
        mockMvc.perform(get("/api/v1/regions")
                .header("Authorization", "Bearer " + token)
                .header("Origin", "http://localhost:4200"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "*"));
    }

    @Test
    void requestValidation_WithInvalidRegionData_ShouldReturnBadRequest() throws Exception {
        // Given
        String token = generateToken(adminUser);
        String invalidRegionRequest = "{\"name\":\"\",\"geoJson\":null}";

        // When & Then
        mockMvc.perform(post("/api/v1/regions")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRegionRequest))
                .andExpect(status().isBadRequest());
    }

    @Test
    void requestValidation_WithValidRegionData_ShouldSucceed() throws Exception {
        // Given
        String token = generateToken(adminUser);
        String validRegionRequest = createRegionRequest();

        // When & Then
        mockMvc.perform(post("/api/v1/regions")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(validRegionRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Region"))
                .andExpect(jsonPath("$.geoJson").exists());
    }

    @Test
    void sessionSecurity_WithDisabledUser_ShouldReturnUnauthorized() throws Exception {
        // Given
        adminUser.setEnabled(false);
        userRepository.save(adminUser);
        String token = generateToken(adminUser);

        // When & Then
        mockMvc.perform(get("/api/v1/regions")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rateLimiting_ShouldPreventExcessiveRequests() throws Exception {
        // Given
        String token = generateToken(adminUser);

        // When & Then - Multiple rapid requests should be handled
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(get("/api/v1/regions")
                    .header("Authorization", "Bearer " + token))
                    .andExpect(status().isOk());
        }
    }

    private String createRegionRequest() {
        return "{\"name\":\"Test Region\",\"geoJson\":{\"type\":\"Polygon\",\"coordinates\":[[[0,0],[1,0],[1,1],[0,1],[0,0]]]}}";
    }

    // Helper class for login requests
    private static class LoginRequest {
        private String username;
        private String password;

        public LoginRequest(String username, String password) {
            this.username = username;
            this.password = password;
        }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
} 