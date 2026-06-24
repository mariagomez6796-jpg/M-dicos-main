-- Migration script to add signature and hospital logo fields to Doctor table
-- VitalApp Medical Electronic Signature Feature
-- Date: 2026-06-24

-- Add signature_data column to store Base64 encoded signature
ALTER TABLE tbl_doctor 
ADD COLUMN signature_data LONGTEXT NULL COMMENT 'Base64 encoded doctor signature image';

-- Add hospital_logo column to store Base64 encoded hospital logo
ALTER TABLE tbl_doctor 
ADD COLUMN hospital_logo LONGTEXT NULL COMMENT 'Base64 encoded hospital logo image';

-- Optional: Add index for faster queries if needed
-- CREATE INDEX idx_doctor_signature ON tbl_doctor(id) WHERE signature_data IS NOT NULL;

-- Verify the changes
DESCRIBE tbl_doctor;

-- Made with Bob
