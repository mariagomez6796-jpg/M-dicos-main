-- Medical History Module Database Schema
-- VitalApp Medical Management System
-- Created: 2026-06-19

-- ============================================
-- 1. MEDICAL HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `tbl_medical_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `patient_id` BIGINT NOT NULL,
    `doctor_id` BIGINT NOT NULL,
    `appointment_id` BIGINT NULL,
    `consultation_date` DATETIME NOT NULL,
    `chief_complaint` TEXT,
    `present_illness` TEXT,
    `physical_examination` TEXT,
    `diagnosis` TEXT NOT NULL,
    `treatment_plan` TEXT,
    `clinical_notes` TEXT,
    `follow_up_date` DATE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`patient_id`) REFERENCES `tbl_patient`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`doctor_id`) REFERENCES `tbl_doctor`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`appointment_id`) REFERENCES `tbl_appointment`(`id`) ON DELETE SET NULL,
    INDEX `idx_patient` (`patient_id`),
    INDEX `idx_doctor` (`doctor_id`),
    INDEX `idx_consultation_date` (`consultation_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. VITAL SIGNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `tbl_vital_signs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `medical_history_id` BIGINT NOT NULL,
    `blood_pressure_systolic` INT,
    `blood_pressure_diastolic` INT,
    `heart_rate` INT,
    `temperature` DECIMAL(4,1),
    `respiratory_rate` INT,
    `oxygen_saturation` INT,
    `weight` DECIMAL(5,2),
    `height` DECIMAL(5,2),
    `bmi` DECIMAL(4,2),
    `recorded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`medical_history_id`) REFERENCES `tbl_medical_history`(`id`) ON DELETE CASCADE,
    INDEX `idx_medical_history` (`medical_history_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. PATIENT ALLERGIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `tbl_patient_allergy` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `patient_id` BIGINT NOT NULL,
    `allergen` VARCHAR(255) NOT NULL,
    `reaction` TEXT,
    `severity` VARCHAR(20),
    `diagnosed_date` DATE,
    `notes` TEXT,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`patient_id`) REFERENCES `tbl_patient`(`id`) ON DELETE CASCADE,
    INDEX `idx_patient` (`patient_id`),
    INDEX `idx_severity` (`severity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. PATIENT CONDITIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `tbl_patient_condition` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `patient_id` BIGINT NOT NULL,
    `condition_name` VARCHAR(255) NOT NULL,
    `diagnosed_date` DATE,
    `status` VARCHAR(20) DEFAULT 'ACTIVE',
    `notes` TEXT,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`patient_id`) REFERENCES `tbl_patient`(`id`) ON DELETE CASCADE,
    INDEX `idx_patient` (`patient_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- COMMENTS
-- ============================================
-- tbl_medical_history: Stores complete consultation records
-- tbl_vital_signs: Stores vital measurements per consultation
-- tbl_patient_allergy: Tracks patient allergies independently
-- tbl_patient_condition: Manages chronic conditions

-- SEVERITY values: MILD, MODERATE, SEVERE
-- STATUS values: ACTIVE, RESOLVED, MANAGED

-- Made with Bob
