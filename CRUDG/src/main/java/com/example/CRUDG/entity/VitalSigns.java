package com.example.CRUDG.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "tbl_vital_signs")
public class VitalSigns {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "medical_history_id", nullable = false)
    private Long medicalHistoryId;

    @Column(name = "blood_pressure_systolic")
    private Integer bloodPressureSystolic;

    @Column(name = "blood_pressure_diastolic")
    private Integer bloodPressureDiastolic;

    @Column(name = "heart_rate")
    private Integer heartRate;

    @Column(name = "temperature", precision = 4, scale = 1)
    private BigDecimal temperature;

    @Column(name = "respiratory_rate")
    private Integer respiratoryRate;

    @Column(name = "oxygen_saturation")
    private Integer oxygenSaturation;

    @Column(name = "weight", precision = 5, scale = 2)
    private BigDecimal weight;

    @Column(name = "height", precision = 5, scale = 2)
    private BigDecimal height;

    @Column(name = "bmi", precision = 4, scale = 2)
    private BigDecimal bmi;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_history_id", insertable = false, updatable = false)
    private MedicalHistory medicalHistory;

    @PrePersist
    protected void onCreate() {
        recordedAt = LocalDateTime.now();
        calculateBmi();
    }

    @PreUpdate
    protected void onUpdate() {
        calculateBmi();
    }

    private void calculateBmi() {
        if (weight != null && height != null && height.compareTo(BigDecimal.ZERO) > 0) {
            // BMI = weight(kg) / (height(m))^2
            BigDecimal heightInMeters = height.divide(new BigDecimal("100"), 2, BigDecimal.ROUND_HALF_UP);
            bmi = weight.divide(heightInMeters.multiply(heightInMeters), 2, BigDecimal.ROUND_HALF_UP);
        }
    }
}

// Made with Bob
