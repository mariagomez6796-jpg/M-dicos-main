package com.example.CRUDG.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MedicalHistoryCreateDTO {
    
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    private Long appointmentId;

    @NotNull(message = "Consultation date is required")
    private LocalDateTime consultationDate;

    private String chiefComplaint;

    private String presentIllness;

    private String physicalExamination;

    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    private String treatmentPlan;

    private String clinicalNotes;

    private LocalDate followUpDate;

    private VitalSignsDTO vitalSigns;
}

// Made with Bob
