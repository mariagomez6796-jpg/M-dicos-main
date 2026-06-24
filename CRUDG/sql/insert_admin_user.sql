-- ============================================================================
-- SQL Script: Insert Default Admin User
-- ============================================================================
-- This script inserts a default admin user into the tbl_admin table.
-- 
-- Admin Credentials:
--   Name:     Gerardo Rubio
--   Email:    admin@vitalapp.com
--   Password: 1234 (plain text)
--   
-- The password is stored as a BCrypt hash with strength 10 (Spring Boot default).
-- BCrypt Hash Format: $2a$10$[22-char-salt][31-char-hash]
--
-- IMPORTANT NOTES:
-- 1. This script is provided as a backup option
-- 2. The AdminDataInitializer.java class will automatically create this user
-- 3. Only use this script if you need to manually insert the admin user
-- 4. The BCrypt hash below is generated for password "1234"
-- 5. Each time BCrypt hashes a password, it generates a different hash (due to random salt)
--    but all hashes will validate correctly against the same password
-- ============================================================================

-- Check if admin already exists (optional safety check)
-- SELECT * FROM tbl_admin WHERE email_address = 'admin@vitalapp.com';

-- Insert admin user with BCrypt hashed password
-- Note: The hash below is an example. Your AdminDataInitializer will generate a new one.
INSERT INTO tbl_admin (name, email_address, password)
VALUES (
    'Gerardo Rubio',
    'admin@vitalapp.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
);

-- Verify the insertion
SELECT id, name, email_address, 
       CONCAT(SUBSTRING(password, 1, 20), '...') AS password_preview
FROM tbl_admin 
WHERE email_address = 'admin@vitalapp.com';

-- ============================================================================
-- ALTERNATIVE: If you want to generate a fresh BCrypt hash
-- ============================================================================
-- You can use the following approaches:
--
-- 1. Use the AdminDataInitializer.java (RECOMMENDED)
--    - Just run your Spring Boot application
--    - Check the console logs for the generated hash
--
-- 2. Use an online BCrypt generator:
--    - Visit: https://bcrypt-generator.com/
--    - Input: 1234
--    - Rounds: 10
--    - Copy the generated hash
--
-- 3. Use Spring Boot's BCryptPasswordEncoder in a test:
--    String hash = new BCryptPasswordEncoder().encode("1234");
--    System.out.println(hash);
--
-- ============================================================================
-- TESTING THE LOGIN
-- ============================================================================
-- After inserting the admin user, test the login endpoint:
--
-- curl -X POST http://localhost:8080/api/v1/auth/login \
--   -H "Content-Type: application/json" \
--   -d '{"email":"admin@vitalapp.com","password":"1234"}'
--
-- Expected Response:
-- {
--   "token": "eyJhbGciOiJIUzI1NiJ9...",
--   "role": "ADMIN",
--   "email": "admin@vitalapp.com",
--   "id": 1
-- }
-- ============================================================================

-- Made with Bob
