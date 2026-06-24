package com.example.CRUDG.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.CRUDG.entity.PatientAllergy;

@Repository
public interface PatientAllergyRepository extends JpaRepository<PatientAllergy, Long> {
    
    List<PatientAllergy> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    
    List<PatientAllergy> findByPatientIdAndSeverity(Long patientId, PatientAllergy.AllergySeverity severity);
}

// Made with Bob
