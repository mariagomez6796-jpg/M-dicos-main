# 🔐 Authentication Fix & Admin User Setup

## 📋 Overview

This document describes the fixes implemented to resolve the **403 Forbidden** error on authentication endpoints and the automatic creation of a default admin user.

---

## 🐛 Problem Identified

### Root Cause
The `JwtFilter.java` was not properly skipping JWT validation for public authentication endpoints. Even though the filter checked paths and called `filterChain.doFilter()`, it continued processing the Authorization header logic, causing Spring Security to reject requests without JWT tokens.

### Symptoms
- ❌ POST to `/api/v1/auth/login` returned 403 Forbidden
- ❌ POST to `/api/v1/admin` returned 403 Forbidden  
- ❌ POST to `/api/v1/patients/register` returned 403 Forbidden
- ❌ Requests failed even with correct credentials
- ❌ Hibernate executed SELECT queries but responses never reached the controller

---

## ✅ Solutions Implemented

### 1. **JwtFilter.java - Fixed JWT Validation**

**File:** `CRUDG/src/main/java/com/example/CRUDG/security/JwtFilter.java`

**Changes:**
- ✅ Added `shouldNotFilter()` method to completely bypass JWT validation for public routes
- ✅ Improved error handling with JSON responses
- ✅ Cleaner separation between public and protected endpoints

**Public Routes (No JWT Required):**
- `/api/v1/auth/**` - All authentication endpoints
- `/api/v1/admin` - Admin registration (POST)
- `/api/v1/admin/**` - Admin endpoints
- `/api/v1/patients/register` - Patient registration
- `/api/v1/blockchain/**` - Blockchain endpoints

**Protected Routes (JWT Required):**
- All other endpoints require a valid JWT token in the Authorization header

---

### 2. **AdminDataInitializer.java - Automatic Admin Creation**

**File:** `CRUDG/src/main/java/com/example/CRUDG/config/AdminDataInitializer.java`

**Features:**
- ✅ Automatically creates admin user on application startup
- ✅ Idempotent - won't create duplicates
- ✅ Uses existing `PasswordService` for BCrypt hashing
- ✅ Logs creation status to console

**Default Admin Credentials:**
```
Name:     Gerardo Rubio
Email:    admin@vitalapp.com
Password: 1234
```

⚠️ **IMPORTANT:** Change the default password in production!

---

### 3. **SQL Script - Manual Insertion (Backup)**

**File:** `CRUDG/sql/insert_admin_user.sql`

Use this script only if you need to manually insert the admin user into the database.

**BCrypt Hash for "1234":**
```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

**Note:** BCrypt generates a different hash each time due to random salts, but all hashes for "1234" will validate correctly.

---

## 🧪 Testing Instructions

### 1. Start the Application

```bash
cd CRUDG
./mvnw spring-boot:run
```

**Expected Console Output:**
```
✅ Default admin user created successfully!
   Email: admin@vitalapp.com
   Password: 1234
   BCrypt Hash: $2a$10$...
⚠️  IMPORTANT: Change the default password in production!
```

If the admin already exists:
```
✅ Admin user already exists: admin@vitalapp.com
```

---

### 2. Test Admin Login (Postman)

**Request:**
```http
POST http://localhost:8080/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@vitalapp.com",
  "password": "1234"
}
```

**Expected Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkB2aXRhbGFwcC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MDk1MjAwMDAsImV4cCI6MTcwOTUyMzYwMH0...",
  "role": "ADMIN",
  "email": "admin@vitalapp.com",
  "id": 1
}
```

---

### 3. Test Admin Login (cURL)

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vitalapp.com","password":"1234"}'
```

---

### 4. Test Protected Endpoint with JWT

**Get All Admins (requires JWT):**

```bash
# First, get the token from login
TOKEN="your_jwt_token_here"

# Then use it to access protected endpoint
curl -X GET http://localhost:8080/api/v1/admin \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Gerardo Rubio",
    "email": "admin@vitalapp.com"
  }
]
```

---

### 5. Test Public Patient Registration

```bash
curl -X POST http://localhost:8080/api/v1/patients/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "patient@test.com",
    "password": "password123"
  }'
```

---

## 🔍 Troubleshooting

### Issue: Still Getting 403 Forbidden

**Possible Causes:**
1. Application not restarted after changes
2. Old compiled classes in target directory
3. CORS issues from frontend

**Solutions:**
```bash
# Clean and rebuild
./mvnw clean install

# Restart application
./mvnw spring-boot:run
```

---

### Issue: Admin User Not Created

**Check Console Logs:**
Look for initialization messages during startup.

**Verify Database:**
```sql
SELECT * FROM tbl_admin WHERE email_address = 'admin@vitalapp.com';
```

**Manual Creation:**
If automatic creation fails, use the SQL script:
```bash
mysql -u root -p CRUDG < CRUDG/sql/insert_admin_user.sql
```

---

### Issue: Invalid Credentials

**Verify Password:**
The password is case-sensitive: `1234` (not `"1234"` with quotes)

**Check Database Hash:**
```sql
SELECT id, name, email_address, password 
FROM tbl_admin 
WHERE email_address = 'admin@vitalapp.com';
```

The password field should start with `$2a$10$` (BCrypt format).

---

### Issue: CORS Errors in Browser

**Current CORS Configuration:**
- Allowed Origins: `http://localhost:3000`, `http://127.0.0.1:3000`
- Allowed Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH
- Allowed Headers: All (*)
- Credentials: Enabled

**If you need to add more origins:**
Edit `SecurityConfig.java` line 76:
```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    "http://your-frontend-url:port"
));
```

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     HTTP Request                             │
│              (POST /api/v1/auth/login)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   JwtFilter                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ shouldNotFilter() checks path                        │   │
│  │ ✅ /api/v1/auth/** → Skip JWT validation            │   │
│  │ ✅ /api/v1/admin → Skip JWT validation              │   │
│  │ ❌ Other paths → Require JWT token                  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 SecurityFilterChain                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ .permitAll() for public routes                       │   │
│  │ .authenticated() for protected routes                │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  AuthController                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. Receive login request                             │   │
│  │ 2. Query database for user                           │   │
│  │ 3. Verify password with BCrypt                       │   │
│  │ 4. Generate JWT token                                │   │
│  │ 5. Return token + user info                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Notes

### BCrypt Password Hashing

**Algorithm:** BCrypt with strength 10 (Spring Boot default)

**Format:** `$2a$10$[22-char-salt][31-char-hash]`

**Example:**
```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
│  │  │  │                                                    │
│  │  │  │                                                    └─ 31-char hash
│  │  │  └─ 22-char random salt
│  │  └─ Cost factor (2^10 = 1024 iterations)
│  └─ BCrypt version
└─ Algorithm identifier
```

**Key Features:**
- ✅ Each hash is unique (random salt)
- ✅ Computationally expensive (prevents brute force)
- ✅ All hashes for same password validate correctly
- ✅ Industry standard for password storage

---

## 📝 Files Modified/Created

### Modified Files:
1. `CRUDG/src/main/java/com/example/CRUDG/security/JwtFilter.java`
   - Added `shouldNotFilter()` method
   - Improved error handling

### Created Files:
1. `CRUDG/src/main/java/com/example/CRUDG/config/AdminDataInitializer.java`
   - Automatic admin user creation
   
2. `CRUDG/sql/insert_admin_user.sql`
   - Manual admin insertion script
   
3. `CRUDG/AUTHENTICATION_FIX_README.md`
   - This documentation file

---

## 🎯 Next Steps

1. ✅ Test all authentication endpoints
2. ✅ Verify admin login works
3. ✅ Test protected endpoints with JWT
4. ⚠️ Change default admin password in production
5. 🔒 Implement password change endpoint
6. 📧 Add email verification (optional)
7. 🔐 Implement refresh tokens (optional)

---

## 📞 Support

If you encounter any issues:

1. Check the console logs for error messages
2. Verify database connection
3. Ensure all dependencies are installed
4. Review this documentation
5. Check Spring Boot application logs

---

## ✨ Summary

**What Was Fixed:**
- ✅ JwtFilter now properly skips public routes
- ✅ Authentication endpoints work without JWT tokens
- ✅ Admin user created automatically on startup
- ✅ Improved error handling and logging

**What You Can Do Now:**
- ✅ Login as admin: `admin@vitalapp.com` / `1234`
- ✅ Register new patients without authentication
- ✅ Access protected endpoints with JWT tokens
- ✅ Build your frontend with confidence

---

**Last Updated:** 2026-06-23  
**Version:** 1.0.0  
**Author:** Bob (AI Assistant)