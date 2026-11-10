package com.example.backend.dto;

public class JwtResponse {
    private String token;
    private String refreshToken;
    private String type = "Bearer";
    private String username;
    private String role;

    public JwtResponse(String token, String refreshToken, String username, String role) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.username = username;
        this.role = role;
    }

    public String getToken() { return token; }
    public String getRefreshToken() { return refreshToken; }
    public void setToken(String token) { this.token = token;
        this.refreshToken = refreshToken; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
