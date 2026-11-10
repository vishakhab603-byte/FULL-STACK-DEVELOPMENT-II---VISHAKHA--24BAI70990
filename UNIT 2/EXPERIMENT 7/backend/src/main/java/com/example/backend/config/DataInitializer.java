package com.example.backend.config;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${demo.admin.password:}")
    private String adminPassword;

    @Value("${demo.user.password:}")
    private String userPassword;

    @Override
    public void run(String... args) {
        createAccountIfConfigured("admin", adminPassword, "ROLE_ADMIN");
        createAccountIfConfigured("user", userPassword, "ROLE_USER");
    }

    private void createAccountIfConfigured(String username, String password, String role) {
        if (StringUtils.hasText(password) && userRepository.findByUsername(username).isEmpty()) {
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            userRepository.save(user);
        }
    }
}
