package com.ecommerce.userservice.service;

import com.ecommerce.userservice.model.User;
import com.ecommerce.userservice.repository.UserRepository;
import com.ecommerce.userservice.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserController — Registration and Login logic.
 * 5 test cases covering valid/invalid flows.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private com.ecommerce.userservice.controller.UserController userController;

    private User validUser;

    @BeforeEach
    void setUp() {
        validUser = new User();
        validUser.setId(1L);
        validUser.setFullName("John Doe");
        validUser.setEmail("john@example.com");
        validUser.setPassword("password123");
    }

    // ─────────────────────────────────────────────────────────────────────
    // TC-001: Successful User Registration
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-001: New user registers successfully → HTTP 200, user saved")
    void testRegister_NewUser_Success() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(validUser);

        ResponseEntity<?> response = userController.registerUser(validUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().toString().contains("User registered successfully"));
        verify(userRepository, times(1)).save(any(User.class));
    }

    // ─────────────────────────────────────────────────────────────────────
    // TC-002: Registration Fails — Email Already Exists
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-002: Duplicate email registration → HTTP 409 CONFLICT")
    void testRegister_DuplicateEmail_Conflict() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(validUser));

        ResponseEntity<?> response = userController.registerUser(validUser);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertTrue(response.getBody().toString().contains("Email is already in use"));
        verify(userRepository, never()).save(any(User.class));
    }

    // ─────────────────────────────────────────────────────────────────────
    // TC-003: Successful Login
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-003: Valid credentials → HTTP 200, JWT token returned")
    void testLogin_ValidCredentials_Success() {
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("email", "john@example.com");
        loginRequest.put("password", "password123");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(validUser));
        when(jwtUtil.generateToken("john@example.com")).thenReturn("eyJhbGciOiJIUzI1NiJ9.test");

        ResponseEntity<?> response = userController.loginUser(loginRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertNotNull(body.get("token"));
        assertEquals("John Doe", body.get("fullName"));
        assertEquals("john@example.com", body.get("email"));
    }

    // ─────────────────────────────────────────────────────────────────────
    // TC-004: Login Fails — User Not Found
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-004: Email not registered → HTTP 401 UNAUTHORIZED")
    void testLogin_UserNotFound_Unauthorized() {
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("email", "unknown@example.com");
        loginRequest.put("password", "password123");

        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        ResponseEntity<?> response = userController.loginUser(loginRequest);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertTrue(response.getBody().toString().contains("Invalid email or password"));
    }

    // ─────────────────────────────────────────────────────────────────────
    // TC-005: Login Fails — Wrong Password
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-005: Wrong password → HTTP 401 UNAUTHORIZED")
    void testLogin_WrongPassword_Unauthorized() {
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("email", "john@example.com");
        loginRequest.put("password", "wrongpassword");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(validUser));

        ResponseEntity<?> response = userController.loginUser(loginRequest);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertTrue(response.getBody().toString().contains("Invalid email or password"));
    }
}
