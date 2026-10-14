package com.buildtrack.config;

import com.buildtrack.model.Project;
import com.buildtrack.model.User;
import com.buildtrack.repository.ProjectRepository;
import com.buildtrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Equivalent of the Node backend's `node seed.js`. Disabled by default;
 * run once with:
 *   mvn spring-boot:run -Dspring-boot.run.arguments=--app.seed.enabled=true
 * or set app.seed.enabled=true in application.properties temporarily.
 *
 * Like the original seed script, this WIPES the users and projects
 * collections first, so only run it against a database you're OK clearing.
 */
@Component
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    public DataSeeder(UserRepository userRepository, ProjectRepository projectRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!seedEnabled) return;

        userRepository.deleteAll();
        projectRepository.deleteAll();

        User admin = new User();
        admin.setName("Admin User");
        admin.setEmail("admin@buildtrack.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(User.ROLE_ADMIN);
        admin = userRepository.save(admin);

        User engineer = new User();
        engineer.setName("Ali Engineer");
        engineer.setEmail("engineer@buildtrack.com");
        engineer.setPassword(passwordEncoder.encode("eng123"));
        engineer.setRole(User.ROLE_ENGINEER);
        engineer = userRepository.save(engineer);

        User client = new User();
        client.setName("Sara Client");
        client.setEmail("client@buildtrack.com");
        client.setPassword(passwordEncoder.encode("client123"));
        client.setRole(User.ROLE_CLIENT);
        client = userRepository.save(client);

        Project bridge = new Project();
        bridge.setTitle("Highway Bridge Construction");
        bridge.setDescription("A major infrastructure project connecting two cities.");
        bridge.setLocation("Colombo, Sri Lanka");
        bridge.setStatus("active");
        bridge.setProgress(45);
        bridge.setStartDate(LocalDate.of(2024, 1, 15));
        bridge.setEndDate(LocalDate.of(2025, 6, 30));
        bridge.setBudget(5_000_000);
        bridge.setAdmin(admin.getId());
        bridge.setEngineers(List.of(engineer.getId()));
        bridge.setClients(List.of(client.getId()));
        projectRepository.save(bridge);

        Project tower = new Project();
        tower.setTitle("Commercial Tower \u2013 Phase 1");
        tower.setDescription("20-floor commercial building in the city centre.");
        tower.setLocation("Kandy, Sri Lanka");
        tower.setStatus("planning");
        tower.setProgress(10);
        tower.setStartDate(LocalDate.of(2024, 3, 1));
        tower.setEndDate(LocalDate.of(2026, 1, 1));
        tower.setBudget(12_000_000);
        tower.setAdmin(admin.getId());
        tower.setEngineers(List.of(engineer.getId()));
        tower.setClients(List.of(client.getId()));
        projectRepository.save(tower);

        System.out.println("\u2705 Seed complete!");
        System.out.println("   admin@buildtrack.com    / admin123");
        System.out.println("   engineer@buildtrack.com / eng123");
        System.out.println("   client@buildtrack.com   / client123");
    }
}
