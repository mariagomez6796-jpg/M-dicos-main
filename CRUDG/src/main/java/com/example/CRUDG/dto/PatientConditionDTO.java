package com.example.CRUDG.dto;

import java.time.LocalDate;

import com.example.CRUDG.entity.PatientCondition.ConditionStatus;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PatientConditionDTO {
    
    private Long id;
    
    private Long patientId;
    
    @NotBlank(message = "Condition name is required")
    private String conditionName;
    
    private LocalDate diagnosedDate;
    private ConditionStatus status;
    private String notes;
}

// Made with Bob
