package com.example.CRUDG.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.CRUDG.entity.PatientCondition;

@Repository
public interface PatientConditionRepository extends JpaRepository<PatientCondition, Long> {
    
    List<PatientCondition> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    
    List<PatientCondition> findByPatientIdAndStatus(Long patientId, PatientCondition.ConditionStatus status);
}

// Made with Bob
