package com.example.CRUDG.dto;

import java.time.LocalDate;

import com.example.CRUDG.entity.PatientAllergy.AllergySeverity;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PatientAllergyDTO {
    
    private Long id;
    
    private Long patientId;
    
    @NotBlank(message = "Allergen is required")
    private String allergen;
    
    private String reaction;
    private AllergySeverity severity;
    private LocalDate diagnosedDate;
    private String notes;
}

// Made with Bob
