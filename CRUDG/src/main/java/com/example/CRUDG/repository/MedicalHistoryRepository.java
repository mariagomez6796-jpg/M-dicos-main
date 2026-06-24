package com.example.CRUDG.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.CRUDG.entity.MedicalHistory;

@Repository
public interface MedicalHistoryRepository extends JpaRepository<MedicalHistory, Long> {
    
    List<MedicalHistory> findByPatientIdOrderByConsultationDateDesc(Long patientId);
    
    List<MedicalHistory> findByDoctorIdOrderByConsultationDateDesc(Long doctorId);
    
    List<MedicalHistory> findByAppointmentId(Long appointmentId);
    
    @Query("SELECT mh FROM MedicalHistory mh WHERE mh.patientId = :patientId " +
           "AND mh.consultationDate BETWEEN :startDate AND :endDate " +
           "ORDER BY mh.consultationDate DESC")
    List<MedicalHistory> findByPatientIdAndDateRange(
        @Param("patientId") Long patientId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT mh FROM MedicalHistory mh WHERE mh.doctorId = :doctorId " +
           "AND mh.consultationDate BETWEEN :startDate AND :endDate " +
           "ORDER BY mh.consultationDate DESC")
    List<MedicalHistory> findByDoctorIdAndDateRange(
        @Param("doctorId") Long doctorId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}

// Made with Bob
