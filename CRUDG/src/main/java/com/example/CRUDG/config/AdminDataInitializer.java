package com.example.CRUDG.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.example.CRUDG.entity.Admin;
import com.example.CRUDG.service.AdminService;
import com.example.CRUDG.service.PasswordService;

import java.util.Optional;

/**
 * AdminDataInitializer
 * 
 * This class automatically creates a default admin user on application startup
 * if one doesn't already exist in the database.
 * 
 * Default Admin Credentials:
 * - Name: Gerardo Rubio
 * - Email: admin@vitalapp.com
 * - Password: 1234 (stored as BCrypt hash)
 * 
 * The class implements CommandLineRunner to execute during Spring Boot startup.
 * It uses @Order(1) to ensure it runs early in the initialization sequence.
 */
@Component
@Order(1)
public class AdminDataInitializer implements CommandLineRunner {

    @Autowired
    private AdminService adminService;

    @Autowired
    private PasswordService passwordService;

    @Override
    public void run(String... args) throws Exception {
        initializeDefaultAdmin();
    }

    /**
     * Creates a default admin user if one doesn't exist.
     * This method is idempotent - it will not create duplicate admins.
     */
    private void initializeDefaultAdmin() {
        String defaultAdminEmail = "admin@vitalapp.com";
        
        // Check if admin already exists
        Optional<Admin> existingAdmin = adminService.findByEmail(defaultAdminEmail);
        
        if (existingAdmin.isPresent()) {
            System.out.println("✅ Admin user already exists: " + defaultAdminEmail);
            return;
        }

        // Create new admin user
        Admin admin = new Admin();
        admin.setName("Gerardo Rubio");
        admin.setEmail(defaultAdminEmail);
        
        // Hash the password using BCryptPasswordEncoder (via PasswordService)
        String plainPassword = "1234";
        String hashedPassword = passwordService.hashPassword(plainPassword);
        admin.setPassword(hashedPassword);

        // Save to database
        adminService.saveOrUpdate(admin);
        
        System.out.println("✅ Default admin user created successfully!");
        System.out.println("   Email: " + defaultAdminEmail);
        System.out.println("   Password: " + plainPassword);
        System.out.println("   BCrypt Hash: " + hashedPassword);
        System.out.println("⚠️  IMPORTANT: Change the default password in production!");
    }
}

// Made with Bob
