-- ============================================================================
-- Chat API Database Schema for MySQL 8.0+
-- Healthcare Platform - Doctor-Patient Communication
-- ============================================================================

-- Use the existing CRUDG database
USE CRUDG;

-- ============================================================================
-- TABLE: tbl_chat_conversation
-- Purpose: Stores conversation metadata linked to appointments
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_chat_conversation (
    conversation_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    appointment_id INT NOT NULL UNIQUE,
    status ENUM('active', 'expired', 'archived') NOT NULL DEFAULT 'active',
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    
    -- Foreign key to existing appointments table
    CONSTRAINT fk_conversation_appointment 
        FOREIGN KEY (appointment_id) 
        REFERENCES tbl_appointments(appointment_id)
        ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_conversation_appointment (appointment_id),
    INDEX idx_conversation_status (status, deleted_at),
    INDEX idx_conversation_expires (expires_at, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: tbl_chat_participant
-- Purpose: Manages conversation participants (doctor, patient, dependent)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_chat_participant (
    participant_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    conversation_id CHAR(36) NOT NULL,
    user_id INT NOT NULL,
    user_type ENUM('doctor', 'patient', 'dependent') NOT NULL,
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at DATETIME NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    CONSTRAINT fk_participant_conversation 
        FOREIGN KEY (conversation_id) 
        REFERENCES tbl_chat_conversation(conversation_id)
        ON DELETE CASCADE,
    
    -- Prevent duplicate participants
    CONSTRAINT uq_participant_user_conversation 
        UNIQUE (conversation_id, user_id, user_type),
    
    -- Indexes
    INDEX idx_participant_conversation (conversation_id),
    INDEX idx_participant_user (user_id),
    INDEX idx_participant_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: tbl_chat_message
-- Purpose: Stores all messages exchanged in conversations
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_chat_message (
    message_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    conversation_id CHAR(36) NOT NULL,
    sender_id INT NOT NULL,
    sender_type ENUM('doctor', 'patient', 'dependent') NOT NULL,
    content TEXT NOT NULL,
    message_type ENUM('text', 'system', 'notification') NOT NULL DEFAULT 'text',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    
    CONSTRAINT fk_message_conversation 
        FOREIGN KEY (conversation_id) 
        REFERENCES tbl_chat_conversation(conversation_id)
        ON DELETE CASCADE,
    
    -- Validate content length
    CONSTRAINT chk_message_content_length 
        CHECK (CHAR_LENGTH(content) > 0 AND CHAR_LENGTH(content) <= 10000),
    
    -- Indexes
    INDEX idx_message_conversation (conversation_id, created_at DESC),
    INDEX idx_message_sender (sender_id),
    INDEX idx_message_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: tbl_message_status
-- Purpose: Tracks message delivery and read status per recipient
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_message_status (
    status_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    message_id CHAR(36) NOT NULL,
    recipient_id INT NOT NULL,
    status ENUM('sent', 'delivered', 'read') NOT NULL DEFAULT 'sent',
    status_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_status_message 
        FOREIGN KEY (message_id) 
        REFERENCES tbl_chat_message(message_id)
        ON DELETE CASCADE,
    
    -- One status per recipient per message
    CONSTRAINT uq_status_message_recipient 
        UNIQUE (message_id, recipient_id),
    
    -- Indexes
    INDEX idx_status_message (message_id),
    INDEX idx_status_recipient (recipient_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: tbl_appointment_rating
-- Purpose: Stores patient ratings for doctors post-appointment
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_appointment_rating (
    rating_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    appointment_id INT NOT NULL UNIQUE,
    doctor_id INT NOT NULL,
    patient_id INT NOT NULL,
    rating INT NOT NULL,
    review TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_rating_appointment 
        FOREIGN KEY (appointment_id) 
        REFERENCES tbl_appointments(appointment_id)
        ON DELETE CASCADE,
    
    -- Validate rating range
    CONSTRAINT chk_rating_range 
        CHECK (rating >= 1 AND rating <= 5),
    
    -- Validate review length
    CONSTRAINT chk_review_length 
        CHECK (review IS NULL OR CHAR_LENGTH(review) <= 2000),
    
    -- Indexes
    INDEX idx_rating_appointment (appointment_id),
    INDEX idx_rating_doctor (doctor_id),
    INDEX idx_rating_patient (patient_id),
    INDEX idx_rating_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: tbl_doctor_metrics
-- Purpose: Aggregated performance metrics for doctors
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_doctor_metrics (
    metric_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    doctor_id INT NOT NULL UNIQUE,
    total_ratings INT NOT NULL DEFAULT 0,
    average_rating DECIMAL(3,2) NULL,
    total_conversations INT NOT NULL DEFAULT 0,
    total_messages_sent INT NOT NULL DEFAULT 0,
    average_response_time_seconds INT NULL,
    last_message_at DATETIME NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Validate metrics
    CONSTRAINT chk_metrics_positive 
        CHECK (
            total_ratings >= 0 AND 
            total_conversations >= 0 AND 
            total_messages_sent >= 0
        ),
    
    CONSTRAINT chk_average_rating_range 
        CHECK (average_rating IS NULL OR (average_rating >= 1.0 AND average_rating <= 5.0)),
    
    -- Indexes
    INDEX idx_metrics_doctor (doctor_id),
    INDEX idx_metrics_rating (average_rating DESC),
    INDEX idx_metrics_conversations (total_conversations DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: tbl_websocket_session
-- Purpose: Tracks active WebSocket connections
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_websocket_session (
    session_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id INT NOT NULL,
    connection_id VARCHAR(255) NOT NULL UNIQUE,
    user_agent TEXT NULL,
    ip_address VARCHAR(45) NULL,
    connected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_ping_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    disconnected_at DATETIME NULL,
    
    -- Indexes
    INDEX idx_session_user (user_id, disconnected_at),
    INDEX idx_session_connection (connection_id),
    INDEX idx_session_active (connected_at, disconnected_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: tbl_chat_audit
-- Purpose: Audit log for compliance and security
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_chat_audit (
    audit_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255) NULL,
    details JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_resource (resource_type, resource_id),
    INDEX idx_audit_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Update doctor metrics on new rating
DELIMITER //

CREATE TRIGGER trg_rating_update_metrics
AFTER INSERT ON tbl_appointment_rating
FOR EACH ROW
BEGIN
    INSERT INTO tbl_doctor_metrics (doctor_id, total_ratings, average_rating, updated_at)
    VALUES (
        NEW.doctor_id,
        1,
        NEW.rating,
        CURRENT_TIMESTAMP
    )
    ON DUPLICATE KEY UPDATE
        total_ratings = total_ratings + 1,
        average_rating = ((average_rating * total_ratings) + NEW.rating) / (total_ratings + 1),
        updated_at = CURRENT_TIMESTAMP;
END//

DELIMITER ;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Active conversations with participant details
CREATE OR REPLACE VIEW vw_active_conversations AS
SELECT 
    c.conversation_id,
    c.appointment_id,
    c.status,
    c.expires_at,
    c.created_at,
    COUNT(DISTINCT m.message_id) as message_count,
    MAX(m.created_at) as last_message_at,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'user_id', p.user_id,
            'user_type', p.user_type,
            'last_seen_at', p.last_seen_at
        )
    ) as participants
FROM tbl_chat_conversation c
LEFT JOIN tbl_chat_message m ON c.conversation_id = m.conversation_id AND m.deleted_at IS NULL
LEFT JOIN tbl_chat_participant p ON c.conversation_id = p.conversation_id
WHERE c.deleted_at IS NULL
GROUP BY c.conversation_id, c.appointment_id, c.status, c.expires_at, c.created_at;

-- View: Unread message counts per user
CREATE OR REPLACE VIEW vw_unread_messages AS
SELECT 
    ms.recipient_id,
    m.conversation_id,
    COUNT(*) as unread_count
FROM tbl_message_status ms
JOIN tbl_chat_message m ON ms.message_id = m.message_id
WHERE ms.status IN ('sent', 'delivered')
AND m.deleted_at IS NULL
GROUP BY ms.recipient_id, m.conversation_id;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Procedure: Get conversation participants
DELIMITER //

CREATE PROCEDURE sp_get_conversation_participants(
    IN p_conversation_id CHAR(36)
)
BEGIN
    SELECT 
        user_id,
        user_type,
        is_active,
        joined_at,
        last_seen_at
    FROM tbl_chat_participant
    WHERE conversation_id = p_conversation_id;
END//

DELIMITER ;

-- Procedure: Check if conversation is accessible
DELIMITER //

CREATE PROCEDURE sp_is_conversation_accessible(
    IN p_conversation_id CHAR(36),
    IN p_user_id INT,
    OUT p_is_accessible BOOLEAN
)
BEGIN
    DECLARE v_is_participant BOOLEAN;
    DECLARE v_is_expired BOOLEAN;
    
    -- Check if user is a participant
    SELECT EXISTS(
        SELECT 1 
        FROM tbl_chat_participant 
        WHERE conversation_id = p_conversation_id 
        AND user_id = p_user_id
        AND is_active = TRUE
    ) INTO v_is_participant;
    
    IF NOT v_is_participant THEN
        SET p_is_accessible = FALSE;
    ELSE
        -- Check if conversation is expired
        SELECT (status = 'expired' OR expires_at < NOW())
        INTO v_is_expired
        FROM tbl_chat_conversation
        WHERE conversation_id = p_conversation_id;
        
        SET p_is_accessible = NOT v_is_expired;
    END IF;
END//

DELIMITER ;

-- ============================================================================
-- INITIAL DATA / COMMENTS
-- ============================================================================

-- Add table comments
ALTER TABLE tbl_chat_conversation COMMENT = 'Stores conversation metadata linked to appointments';
ALTER TABLE tbl_chat_participant COMMENT = 'Manages conversation participants (doctor, patient, dependent)';
ALTER TABLE tbl_chat_message COMMENT = 'Stores all messages exchanged in conversations';
ALTER TABLE tbl_message_status COMMENT = 'Tracks message delivery and read status per recipient';
ALTER TABLE tbl_appointment_rating COMMENT = 'Stores patient ratings for doctors post-appointment';
ALTER TABLE tbl_doctor_metrics COMMENT = 'Aggregated performance metrics for doctors';
ALTER TABLE tbl_websocket_session COMMENT = 'Tracks active WebSocket connections';
ALTER TABLE tbl_chat_audit COMMENT = 'Audit log for compliance and security';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Made with Bob
