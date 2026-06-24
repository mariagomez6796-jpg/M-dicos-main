package com.example.CRUDG.exception;

public class MedicalHistoryNotFoundException extends RuntimeException {
    
    public MedicalHistoryNotFoundException(String message) {
        super(message);
    }
    
    public MedicalHistoryNotFoundException(Long id) {
        super("Medical history record not found with id: " + id);
    }
}

// Made with Bob
