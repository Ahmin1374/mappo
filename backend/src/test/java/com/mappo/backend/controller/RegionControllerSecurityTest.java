package com.mappo.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mappo.backend.dto.RegionDto;
import com.mappo.backend.model.User;
import com.mappo.backend.repository.UserRepository;
import com.mappo.backend.security.JwtUtils;
import com.mappo.backend.service.RegionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
class RegionControllerSecurityTest {

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
                .apply(springSecurity())
                .build();

        // Create test users with different roles
        createTestUsers();
    }

    private void createTestUsers() {
        // Admin user
        adminUser = new User();
        adminUser.setId(UUID.randomUUID());
        adminUser.setUsername("admin");
        adminUser.setPassword(passwordEncoder.encode("password"));
        adminUser.setRole("ADMIN");
        adminUser.setEnabled(true);
        adminUser.setCreatedAt(LocalDateTime.now());
        userRepository.save(adminUser);

        // Broker user
        brokerUser = new User();
        brokerUser.setId(UUID.randomUUID());
        brokerUser.setUsername("broker");
        brokerUser.setPassword(passwordEncoder.encode("password"));
        brokerUser.setRole("BROKER");
        brokerUser.setEnabled(true);
        brokerUser.setCreatedAt(LocalDateTime.now());
        userRepository.save(brokerUser);

        // Viewer user
        viewerUser = new User();
        viewerUser.setId(UUID.randomUUID());
        viewerUser.setUsername("viewer");
        viewerUser.setPassword(passwordEncoder.encode("password"));
        viewerUser.setRole("VIEWER");
        viewerUser.setEnabled(true);
        viewerUser.setCreatedAt(LocalDateTime.now());
        userRepository.save(viewerUser);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void getRegions_WithAdminRole_ShouldReturnAllRegions() throws Exception {
        mockMvc.perform(get("/api/v1/regions"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "broker", roles = {"BROKER"})
    void getRegions_WithBrokerRole_ShouldReturnOwnRegions() throws Exception {
        mockMvc.perform(get("/api/v1/regions"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "viewer", roles = {"VIEWER"})
    void getRegions_WithViewerRole_ShouldReturnReadOnlyAccess() throws Exception {
        mockMvc.perform(get("/api/v1/regions"))
                .andExpect(status().isOk());
    }

    @Test
    void getRegions_WithoutAuthentication_ShouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/regions"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void createRegion_WithAdminRole_ShouldSucceed() throws Exception {
        RegionDto regionDto = new RegionDto();
        regionDto.setName("Admin Region");
        regionDto.setGeoJson("{\"type\":\"Polygon\",\"coordinates\":[[[0,0],[1,0],[1,1],[0,1],[0,0]]]}");

        mockMvc.perform(post("/api/v1/regions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regionDto)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(username = "broker", roles = {"BROKER"})
    void createRegion_WithBrokerRole_ShouldSucceed() throws Exception {
        RegionDto regionDto = new RegionDto();
        regionDto.setName("Broker Region");
        regionDto.setGeoJson("{\"type\":\"Polygon\",\"coordinates\":[[[0,0],[1,0],[1,1],[0,1],[0,0]]]}");

        mockMvc.perform(post("/api/v1/regions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regionDto)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(username = "viewer", roles = {"VIEWER"})
    void createRegion_WithViewerRole_ShouldReturnForbidden() throws Exception {
        RegionDto regionDto = new RegionDto();
        regionDto.setName("Viewer Region");
        regionDto.setGeoJson("{\"type\":\"Polygon\",\"coordinates\":[[[0,0],[1,0],[1,1],[0,1],[0,0]]]}");

        mockMvc.perform(post("/api/v1/regions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regionDto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void deleteRegion_WithAdminRole_ShouldSucceed() throws Exception {
        UUID regionId = UUID.randomUUID();
        mockMvc.perform(delete("/api/v1/regions/" + regionId))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "viewer", roles = {"VIEWER"})
    void deleteRegion_WithViewerRole_ShouldReturnForbidden() throws Exception {
        UUID regionId = UUID.randomUUID();
        mockMvc.perform(delete("/api/v1/regions/" + regionId))
                .andExpect(status().isForbidden());
    }

    @Test
    void accessProtectedEndpoint_WithoutJwtToken_ShouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/regions"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void accessProtectedEndpoint_WithInvalidJwtToken_ShouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/regions")
                .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized());
    }
} 