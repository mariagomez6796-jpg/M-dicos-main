package com.example.CRUDG.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class MedicalHistoryResponseDTO {
    
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialty;
    private Long appointmentId;
    private LocalDateTime consultationDate;
    private String chiefComplaint;
    private String presentIllness;
    private String physicalExamination;
    private String diagnosis;
    private String treatmentPlan;
    private String clinicalNotes;
    private LocalDate followUpDate;
    private VitalSignsDTO vitalSigns;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

// Made with Bob
