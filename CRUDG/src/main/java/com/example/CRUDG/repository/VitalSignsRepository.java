package com.example.CRUDG.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.CRUDG.entity.VitalSigns;

@Repository
public interface VitalSignsRepository extends JpaRepository<VitalSigns, Long> {
    
    Optional<VitalSigns> findByMedicalHistoryId(Long medicalHistoryId);
    
    void deleteByMedicalHistoryId(Long medicalHistoryId);
}

// Made with Bob
