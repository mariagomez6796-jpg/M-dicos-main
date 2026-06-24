package com.example.CRUDG.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.CRUDG.dto.MedicalHistoryCreateDTO;
import com.example.CRUDG.dto.MedicalHistoryResponseDTO;
import com.example.CRUDG.dto.MedicalHistoryUpdateDTO;
import com.example.CRUDG.dto.PatientAllergyDTO;
import com.example.CRUDG.dto.PatientConditionDTO;
import com.example.CRUDG.dto.VitalSignsDTO;
import com.example.CRUDG.service.MedicalHistoryService;

import jakarta.validation.Valid;

@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/v1")
public class MedicalHistoryController {

    @Autowired
    private MedicalHistoryService medicalHistoryService;

    // ==================== MEDICAL HISTORY ENDPOINTS ====================

    @PostMapping("/patients/{patientId}/medical-history")
    public ResponseEntity<MedicalHistoryResponseDTO> createMedicalHistory(
            @PathVariable Long patientId,
            @Valid @RequestBody MedicalHistoryCreateDTO dto) {
        dto.setPatientId(patientId);
        MedicalHistoryResponseDTO created = medicalHistoryService.createMedicalHistory(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/patients/{patientId}/medical-history")
    public ResponseEntity<List<MedicalHistoryResponseDTO>> getPatientMedicalHistory(
            @PathVariable Long patientId) {
        List<MedicalHistoryResponseDTO> history = medicalHistoryService.getPatientMedicalHistory(patientId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/doctors/{doctorId}/medical-history")
    public ResponseEntity<List<MedicalHistoryResponseDTO>> getDoctorMedicalHistory(
            @PathVariable Long doctorId) {
        List<MedicalHistoryResponseDTO> history = medicalHistoryService.getDoctorMedicalHistory(doctorId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/medical-history/{historyId}")
    public ResponseEntity<MedicalHistoryResponseDTO> getMedicalHistoryById(
            @PathVariable Long historyId) {
        MedicalHistoryResponseDTO history = medicalHistoryService.getMedicalHistoryById(historyId);
        return ResponseEntity.ok(history);
    }

    @PutMapping("/medical-history/{historyId}")
    public ResponseEntity<MedicalHistoryResponseDTO> updateMedicalHistory(
            @PathVariable Long historyId,
            @RequestBody MedicalHistoryUpdateDTO dto) {
        MedicalHistoryResponseDTO updated = medicalHistoryService.updateMedicalHistory(historyId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/medical-history/{historyId}")
    public ResponseEntity<Void> deleteMedicalHistory(@PathVariable Long historyId) {
        medicalHistoryService.deleteMedicalHistory(historyId);
        return ResponseEntity.noContent().build();
    }

    // ==================== VITAL SIGNS ENDPOINTS ====================

    @PostMapping("/medical-history/{historyId}/vital-signs")
    public ResponseEntity<VitalSignsDTO> createVitalSigns(
            @PathVariable Long historyId,
            @RequestBody VitalSignsDTO dto) {
        VitalSignsDTO created = medicalHistoryService.createVitalSigns(historyId, dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/medical-history/{historyId}/vital-signs")
    public ResponseEntity<VitalSignsDTO> getVitalSigns(@PathVariable Long historyId) {
        VitalSignsDTO vitalSigns = medicalHistoryService.getVitalSignsByMedicalHistoryId(historyId);
        if (vitalSigns == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(vitalSigns);
    }

    @PutMapping("/vital-signs/{vitalId}")
    public ResponseEntity<VitalSignsDTO> updateVitalSigns(
            @PathVariable Long vitalId,
            @RequestBody VitalSignsDTO dto) {
        VitalSignsDTO updated = medicalHistoryService.updateVitalSigns(vitalId, dto);
        return ResponseEntity.ok(updated);
    }

    // ==================== ALLERGY ENDPOINTS ====================

    @PostMapping("/patients/{patientId}/allergies")
    public ResponseEntity<PatientAllergyDTO> createAllergy(
            @PathVariable Long patientId,
            @Valid @RequestBody PatientAllergyDTO dto) {
        dto.setPatientId(patientId);
        PatientAllergyDTO created = medicalHistoryService.createAllergy(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/patients/{patientId}/allergies")
    public ResponseEntity<List<PatientAllergyDTO>> getPatientAllergies(
            @PathVariable Long patientId) {
        List<PatientAllergyDTO> allergies = medicalHistoryService.getPatientAllergies(patientId);
        return ResponseEntity.ok(allergies);
    }

    @PutMapping("/allergies/{allergyId}")
    public ResponseEntity<PatientAllergyDTO> updateAllergy(
            @PathVariable Long allergyId,
            @RequestBody PatientAllergyDTO dto) {
        PatientAllergyDTO updated = medicalHistoryService.updateAllergy(allergyId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/allergies/{allergyId}")
    public ResponseEntity<Void> deleteAllergy(@PathVariable Long allergyId) {
        medicalHistoryService.deleteAllergy(allergyId);
        return ResponseEntity.noContent().build();
    }

    // ==================== CONDITION ENDPOINTS ====================

    @PostMapping("/patients/{patientId}/conditions")
    public ResponseEntity<PatientConditionDTO> createCondition(
            @PathVariable Long patientId,
            @Valid @RequestBody PatientConditionDTO dto) {
        dto.setPatientId(patientId);
        PatientConditionDTO created = medicalHistoryService.createCondition(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/patients/{patientId}/conditions")
    public ResponseEntity<List<PatientConditionDTO>> getPatientConditions(
            @PathVariable Long patientId) {
        List<PatientConditionDTO> conditions = medicalHistoryService.getPatientConditions(patientId);
        return ResponseEntity.ok(conditions);
    }

    @PutMapping("/conditions/{conditionId}")
    public ResponseEntity<PatientConditionDTO> updateCondition(
            @PathVariable Long conditionId,
            @RequestBody PatientConditionDTO dto) {
        PatientConditionDTO updated = medicalHistoryService.updateCondition(conditionId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/conditions/{conditionId}")
    public ResponseEntity<Void> deleteCondition(@PathVariable Long conditionId) {
        medicalHistoryService.deleteCondition(conditionId);
        return ResponseEntity.noContent().build();
    }

    // ==================== COMPLETE HISTORY ENDPOINT ====================

    @GetMapping("/patients/{patientId}/complete-history")
    public ResponseEntity<CompletePatientHistoryResponse> getCompletePatientHistory(
            @PathVariable Long patientId) {
        CompletePatientHistoryResponse response = new CompletePatientHistoryResponse();
        response.setMedicalHistory(medicalHistoryService.getPatientMedicalHistory(patientId));
        response.setAllergies(medicalHistoryService.getPatientAllergies(patientId));
        response.setConditions(medicalHistoryService.getPatientConditions(patientId));
        return ResponseEntity.ok(response);
    }

    // Inner class for complete history response
    public static class CompletePatientHistoryResponse {
        private List<MedicalHistoryResponseDTO> medicalHistory;
        private List<PatientAllergyDTO> allergies;
        private List<PatientConditionDTO> conditions;

        public List<MedicalHistoryResponseDTO> getMedicalHistory() {
            return medicalHistory;
        }

        public void setMedicalHistory(List<MedicalHistoryResponseDTO> medicalHistory) {
            this.medicalHistory = medicalHistory;
        }

        public List<PatientAllergyDTO> getAllergies() {
            return allergies;
        }

        public void setAllergies(List<PatientAllergyDTO> allergies) {
            this.allergies = allergies;
        }

        public List<PatientConditionDTO> getConditions() {
            return conditions;
        }

        public void setConditions(List<PatientConditionDTO> conditions) {
            this.conditions = conditions;
        }
    }
}

// Made with Bob
