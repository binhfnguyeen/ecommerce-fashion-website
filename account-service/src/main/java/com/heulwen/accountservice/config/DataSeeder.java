package com.heulwen.accountservice.config;

import com.heulwen.accountservice.domain.enums.UserRole;
import com.heulwen.accountservice.domain.models.User;
import com.heulwen.accountservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.findByUsername("admin").isPresent()) {
            User adminUser = User.register(
                "admin",
                passwordEncoder.encode("admin"),
                "admin@fashionsc.com",
                "System Admin",
                UserRole.ADMIN
            );
            userRepository.save(adminUser);
            log.info(">>Admin have been created!");
        }
    }
}
