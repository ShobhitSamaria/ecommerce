package com.ecommerce.userservice.controller;

import com.ecommerce.userservice.model.User;
import com.ecommerce.userservice.repository.UserRepository;
import com.ecommerce.userservice.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // --- REGISTRATION LOGIC ---
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        // Negative Test Case: Check if email already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Error: Email is already in use!");
        }

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(Map.of(
                "message", "User registered successfully",
                "userId", savedUser.getId(),
                "createdAt", savedUser.getCreatedAt().toString()
        ));
    }

    // --- GET USER ACCOUNT AGE ---
    @GetMapping("/account-age")
    public ResponseEntity<?> getAccountAge(@RequestParam("email") String email) {
        Optional<User> dbUser = userRepository.findByEmail(email);
        if (dbUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: User not found");
        }

        long daysSinceCreation = java.time.temporal.ChronoUnit.DAYS
                .between(dbUser.get().getCreatedAt(), LocalDateTime.now());

        return ResponseEntity.ok(Map.of(
                "email", email,
                "accountAgeInDays", daysSinceCreation
        ));
    }

    // --- LOGIN LOGIC (Common for User & Admin UI) ---
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        Optional<User> dbUser = userRepository.findByEmail(email);

        // Negative Test Case: User not found or Password mismatch
        if (dbUser.isEmpty() || !dbUser.get().getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error: Invalid email or password!");
        }

        // Success: Generate Token
        String token = jwtUtil.generateToken(dbUser.get().getEmail());

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("fullName", dbUser.get().getFullName());
        response.put("email", dbUser.get().getEmail());

        return ResponseEntity.ok(response);
    }
}