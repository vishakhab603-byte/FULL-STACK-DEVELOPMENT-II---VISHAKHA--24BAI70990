package com.example.backend.controller;

import com.example.backend.dto.JwtResponse;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RefreshRequest;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtUtils;
import com.example.backend.service.RefreshTokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository users;
    private final RefreshTokenService refreshTokens;

    public AuthController(AuthenticationManager authenticationManager, JwtUtils jwtUtils, UserRepository users, RefreshTokenService refreshTokens) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.users = users;
        this.refreshTokens = refreshTokens;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(auth);
        UserDetails principal = (UserDetails) auth.getPrincipal();
        String role = principal.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .findFirst()
            .orElse("ROLE_USER");
        User user = users.findByUsername(principal.getUsername()).orElseThrow();
        var issued = refreshTokens.issue(user);
        return ResponseEntity.ok(response(user, role, issued.value()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<JwtResponse> refresh(@RequestBody RefreshRequest request) {
        var issued = refreshTokens.rotate(request.getRefreshToken());
        User user = issued.user();
        return ResponseEntity.ok(response(user, user.getRole(), issued.value()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody RefreshRequest request) {
        refreshTokens.revoke(request.getRefreshToken());
        return ResponseEntity.noContent().build();
    }

    private JwtResponse response(User user, String role, String refresh) {
        return new JwtResponse(jwtUtils.generateToken(user.getUsername(), role), refresh,
            user.getUsername(), role, permissionsFor(role));
    }

    private List<String> permissionsFor(String role) {
        List<String> permissions = new ArrayList<>();
        permissions.add("tasks:read");
        if ("ROLE_USER".equals(role) || "ROLE_ADMIN".equals(role)) {
            permissions.add("tasks:create");
            permissions.add("tasks:update");
        }
        if ("ROLE_ADMIN".equals(role)) {
            permissions.add("tasks:delete");
        }
        return permissions;
    }
}
