package com.example.CRUDG.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class VitalSignsDTO {
    private Integer bloodPressureSystolic;
    private Integer bloodPressureDiastolic;
    private Integer heartRate;
    private BigDecimal temperature;
    private Integer respiratoryRate;
    private Integer oxygenSaturation;
    private BigDecimal weight;
    private BigDecimal height;
    private BigDecimal bmi;
}

// Made with Bob
