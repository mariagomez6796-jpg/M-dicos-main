package com.example.CRUDG.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class MedicalHistoryUpdateDTO {
    
    private LocalDateTime consultationDate;
    private String chiefComplaint;
    private String presentIllness;
    private String physicalExamination;
    private String diagnosis;
    private String treatmentPlan;
    private String clinicalNotes;
    private LocalDate followUpDate;
}

// Made with Bob
