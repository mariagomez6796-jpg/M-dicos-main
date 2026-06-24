package com.example.CRUDG.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.CRUDG.dto.MedicalHistoryCreateDTO;
import com.example.CRUDG.dto.MedicalHistoryResponseDTO;
import com.example.CRUDG.dto.MedicalHistoryUpdateDTO;
import com.example.CRUDG.dto.PatientAllergyDTO;
import com.example.CRUDG.dto.PatientConditionDTO;
import com.example.CRUDG.dto.VitalSignsDTO;
import com.example.CRUDG.entity.MedicalHistory;
import com.example.CRUDG.entity.PatientAllergy;
import com.example.CRUDG.entity.PatientCondition;
import com.example.CRUDG.entity.VitalSigns;
import com.example.CRUDG.exception.InvalidMedicalDataException;
import com.example.CRUDG.exception.MedicalHistoryNotFoundException;
import com.example.CRUDG.repository.DoctorRepository;
import com.example.CRUDG.repository.MedicalHistoryRepository;
import com.example.CRUDG.repository.PatientAllergyRepository;
import com.example.CRUDG.repository.PatientConditionRepository;
import com.example.CRUDG.repository.PatientRepository;
import com.example.CRUDG.repository.VitalSignsRepository;

@Service
public class MedicalHistoryService {

    @Autowired
    private MedicalHistoryRepository medicalHistoryRepository;

    @Autowired
    private VitalSignsRepository vitalSignsRepository;

    @Autowired
    private PatientAllergyRepository patientAllergyRepository;

    @Autowired
    private PatientConditionRepository patientConditionRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private BlockService blockService;

    // ==================== MEDICAL HISTORY OPERATIONS ====================

    @Transactional
    public MedicalHistoryResponseDTO createMedicalHistory(MedicalHistoryCreateDTO dto) {
        // Validate patient and doctor exist
        validatePatientExists(dto.getPatientId());
        validateDoctorExists(dto.getDoctorId());

        // Create medical history entity
        MedicalHistory medicalHistory = new MedicalHistory();
        medicalHistory.setPatientId(dto.getPatientId());
        medicalHistory.setDoctorId(dto.getDoctorId());
        medicalHistory.setAppointmentId(dto.getAppointmentId());
        medicalHistory.setConsultationDate(dto.getConsultationDate());
        medicalHistory.setChiefComplaint(dto.getChiefComplaint());
        medicalHistory.setPresentIllness(dto.getPresentIllness());
        medicalHistory.setPhysicalExamination(dto.getPhysicalExamination());
        medicalHistory.setDiagnosis(dto.getDiagnosis());
        medicalHistory.setTreatmentPlan(dto.getTreatmentPlan());
        medicalHistory.setClinicalNotes(dto.getClinicalNotes());
        medicalHistory.setFollowUpDate(dto.getFollowUpDate());

        MedicalHistory saved = medicalHistoryRepository.save(medicalHistory);

        // Create vital signs if provided
        if (dto.getVitalSigns() != null) {
            createVitalSigns(saved.getId(), dto.getVitalSigns());
        }

        // Add to blockchain
        blockService.addBlock(
            "CREATE_MEDICAL_HISTORY ID=" + saved.getId() +
            " PATIENT_ID=" + saved.getPatientId() +
            " DOCTOR_ID=" + saved.getDoctorId() +
            " DIAGNOSIS=" + saved.getDiagnosis()
        );

        return convertToResponseDTO(saved);
    }

    public List<MedicalHistoryResponseDTO> getPatientMedicalHistory(Long patientId) {
        validatePatientExists(patientId);
        List<MedicalHistory> histories = medicalHistoryRepository.findByPatientIdOrderByConsultationDateDesc(patientId);
        return histories.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<MedicalHistoryResponseDTO> getDoctorMedicalHistory(Long doctorId) {
        validateDoctorExists(doctorId);
        List<MedicalHistory> histories = medicalHistoryRepository.findByDoctorIdOrderByConsultationDateDesc(doctorId);
        return histories.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public MedicalHistoryResponseDTO getMedicalHistoryById(Long id) {
        MedicalHistory history = medicalHistoryRepository.findById(id)
                .orElseThrow(() -> new MedicalHistoryNotFoundException(id));
        return convertToResponseDTO(history);
    }

    @Transactional
    public MedicalHistoryResponseDTO updateMedicalHistory(Long id, MedicalHistoryUpdateDTO dto) {
        MedicalHistory history = medicalHistoryRepository.findById(id)
                .orElseThrow(() -> new MedicalHistoryNotFoundException(id));

        String oldDiagnosis = history.getDiagnosis();

        if (dto.getConsultationDate() != null) {
            history.setConsultationDate(dto.getConsultationDate());
        }
        if (dto.getChiefComplaint() != null) {
            history.setChiefComplaint(dto.getChiefComplaint());
        }
        if (dto.getPresentIllness() != null) {
            history.setPresentIllness(dto.getPresentIllness());
        }
        if (dto.getPhysicalExamination() != null) {
            history.setPhysicalExamination(dto.getPhysicalExamination());
        }
        if (dto.getDiagnosis() != null) {
            history.setDiagnosis(dto.getDiagnosis());
        }
        if (dto.getTreatmentPlan() != null) {
            history.setTreatmentPlan(dto.getTreatmentPlan());
        }
        if (dto.getClinicalNotes() != null) {
            history.setClinicalNotes(dto.getClinicalNotes());
        }
        if (dto.getFollowUpDate() != null) {
            history.setFollowUpDate(dto.getFollowUpDate());
        }

        MedicalHistory updated = medicalHistoryRepository.save(history);

        // Add to blockchain
        blockService.addBlock(
            "UPDATE_MEDICAL_HISTORY ID=" + updated.getId() +
            " OLD_DIAGNOSIS=" + oldDiagnosis +
            " NEW_DIAGNOSIS=" + updated.getDiagnosis()
        );

        return convertToResponseDTO(updated);
    }

    @Transactional
    public void deleteMedicalHistory(Long id) {
        MedicalHistory history = medicalHistoryRepository.findById(id)
                .orElseThrow(() -> new MedicalHistoryNotFoundException(id));

        blockService.addBlock(
            "DELETE_MEDICAL_HISTORY ID=" + id +
            " PATIENT_ID=" + history.getPatientId()
        );

        medicalHistoryRepository.deleteById(id);
    }

    // ==================== VITAL SIGNS OPERATIONS ====================

    @Transactional
    public VitalSignsDTO createVitalSigns(Long medicalHistoryId, VitalSignsDTO dto) {
        // Validate medical history exists
        if (!medicalHistoryRepository.existsById(medicalHistoryId)) {
            throw new MedicalHistoryNotFoundException(medicalHistoryId);
        }

        VitalSigns vitalSigns = new VitalSigns();
        vitalSigns.setMedicalHistoryId(medicalHistoryId);
        vitalSigns.setBloodPressureSystolic(dto.getBloodPressureSystolic());
        vitalSigns.setBloodPressureDiastolic(dto.getBloodPressureDiastolic());
        vitalSigns.setHeartRate(dto.getHeartRate());
        vitalSigns.setTemperature(dto.getTemperature());
        vitalSigns.setRespiratoryRate(dto.getRespiratoryRate());
        vitalSigns.setOxygenSaturation(dto.getOxygenSaturation());
        vitalSigns.setWeight(dto.getWeight());
        vitalSigns.setHeight(dto.getHeight());

        VitalSigns saved = vitalSignsRepository.save(vitalSigns);
        return convertToVitalSignsDTO(saved);
    }

    public VitalSignsDTO getVitalSignsByMedicalHistoryId(Long medicalHistoryId) {
        return vitalSignsRepository.findByMedicalHistoryId(medicalHistoryId)
                .map(this::convertToVitalSignsDTO)
                .orElse(null);
    }

    @Transactional
    public VitalSignsDTO updateVitalSigns(Long vitalSignsId, VitalSignsDTO dto) {
        VitalSigns vitalSigns = vitalSignsRepository.findById(vitalSignsId)
                .orElseThrow(() -> new InvalidMedicalDataException("Vital signs not found with id: " + vitalSignsId));

        if (dto.getBloodPressureSystolic() != null) {
            vitalSigns.setBloodPressureSystolic(dto.getBloodPressureSystolic());
        }
        if (dto.getBloodPressureDiastolic() != null) {
            vitalSigns.setBloodPressureDiastolic(dto.getBloodPressureDiastolic());
        }
        if (dto.getHeartRate() != null) {
            vitalSigns.setHeartRate(dto.getHeartRate());
        }
        if (dto.getTemperature() != null) {
            vitalSigns.setTemperature(dto.getTemperature());
        }
        if (dto.getRespiratoryRate() != null) {
            vitalSigns.setRespiratoryRate(dto.getRespiratoryRate());
        }
        if (dto.getOxygenSaturation() != null) {
            vitalSigns.setOxygenSaturation(dto.getOxygenSaturation());
        }
        if (dto.getWeight() != null) {
            vitalSigns.setWeight(dto.getWeight());
        }
        if (dto.getHeight() != null) {
            vitalSigns.setHeight(dto.getHeight());
        }

        VitalSigns updated = vitalSignsRepository.save(vitalSigns);
        return convertToVitalSignsDTO(updated);
    }

    // ==================== ALLERGY OPERATIONS ====================

    @Transactional
    public PatientAllergyDTO createAllergy(PatientAllergyDTO dto) {
        validatePatientExists(dto.getPatientId());

        PatientAllergy allergy = new PatientAllergy();
        allergy.setPatientId(dto.getPatientId());
        allergy.setAllergen(dto.getAllergen());
        allergy.setReaction(dto.getReaction());
        allergy.setSeverity(dto.getSeverity());
        allergy.setDiagnosedDate(dto.getDiagnosedDate());
        allergy.setNotes(dto.getNotes());

        PatientAllergy saved = patientAllergyRepository.save(allergy);

        blockService.addBlock(
            "CREATE_ALLERGY PATIENT_ID=" + saved.getPatientId() +
            " ALLERGEN=" + saved.getAllergen() +
            " SEVERITY=" + saved.getSeverity()
        );

        return convertToAllergyDTO(saved);
    }

    public List<PatientAllergyDTO> getPatientAllergies(Long patientId) {
        validatePatientExists(patientId);
        return patientAllergyRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::convertToAllergyDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PatientAllergyDTO updateAllergy(Long allergyId, PatientAllergyDTO dto) {
        PatientAllergy allergy = patientAllergyRepository.findById(allergyId)
                .orElseThrow(() -> new InvalidMedicalDataException("Allergy not found with id: " + allergyId));

        if (dto.getAllergen() != null) {
            allergy.setAllergen(dto.getAllergen());
        }
        if (dto.getReaction() != null) {
            allergy.setReaction(dto.getReaction());
        }
        if (dto.getSeverity() != null) {
            allergy.setSeverity(dto.getSeverity());
        }
        if (dto.getDiagnosedDate() != null) {
            allergy.setDiagnosedDate(dto.getDiagnosedDate());
        }
        if (dto.getNotes() != null) {
            allergy.setNotes(dto.getNotes());
        }

        PatientAllergy updated = patientAllergyRepository.save(allergy);
        return convertToAllergyDTO(updated);
    }

    @Transactional
    public void deleteAllergy(Long allergyId) {
        PatientAllergy allergy = patientAllergyRepository.findById(allergyId)
                .orElseThrow(() -> new InvalidMedicalDataException("Allergy not found with id: " + allergyId));

        blockService.addBlock(
            "DELETE_ALLERGY ID=" + allergyId +
            " PATIENT_ID=" + allergy.getPatientId()
        );

        patientAllergyRepository.deleteById(allergyId);
    }

    // ==================== CONDITION OPERATIONS ====================

    @Transactional
    public PatientConditionDTO createCondition(PatientConditionDTO dto) {
        validatePatientExists(dto.getPatientId());

        PatientCondition condition = new PatientCondition();
        condition.setPatientId(dto.getPatientId());
        condition.setConditionName(dto.getConditionName());
        condition.setDiagnosedDate(dto.getDiagnosedDate());
        condition.setStatus(dto.getStatus() != null ? dto.getStatus() : PatientCondition.ConditionStatus.ACTIVE);
        condition.setNotes(dto.getNotes());

        PatientCondition saved = patientConditionRepository.save(condition);

        blockService.addBlock(
            "CREATE_CONDITION PATIENT_ID=" + saved.getPatientId() +
            " CONDITION=" + saved.getConditionName() +
            " STATUS=" + saved.getStatus()
        );

        return convertToConditionDTO(saved);
    }

    public List<PatientConditionDTO> getPatientConditions(Long patientId) {
        validatePatientExists(patientId);
        return patientConditionRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::convertToConditionDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PatientConditionDTO updateCondition(Long conditionId, PatientConditionDTO dto) {
        PatientCondition condition = patientConditionRepository.findById(conditionId)
                .orElseThrow(() -> new InvalidMedicalDataException("Condition not found with id: " + conditionId));

        String oldStatus = condition.getStatus().toString();

        if (dto.getConditionName() != null) {
            condition.setConditionName(dto.getConditionName());
        }
        if (dto.getDiagnosedDate() != null) {
            condition.setDiagnosedDate(dto.getDiagnosedDate());
        }
        if (dto.getStatus() != null) {
            condition.setStatus(dto.getStatus());
        }
        if (dto.getNotes() != null) {
            condition.setNotes(dto.getNotes());
        }

        PatientCondition updated = patientConditionRepository.save(condition);

        blockService.addBlock(
            "UPDATE_CONDITION ID=" + conditionId +
            " OLD_STATUS=" + oldStatus +
            " NEW_STATUS=" + updated.getStatus()
        );

        return convertToConditionDTO(updated);
    }

    @Transactional
    public void deleteCondition(Long conditionId) {
        PatientCondition condition = patientConditionRepository.findById(conditionId)
                .orElseThrow(() -> new InvalidMedicalDataException("Condition not found with id: " + conditionId));

        blockService.addBlock(
            "DELETE_CONDITION ID=" + conditionId +
            " PATIENT_ID=" + condition.getPatientId()
        );

        patientConditionRepository.deleteById(conditionId);
    }

    // ==================== HELPER METHODS ====================

    private void validatePatientExists(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new InvalidMedicalDataException("Patient not found with id: " + patientId);
        }
    }

    private void validateDoctorExists(Long doctorId) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new InvalidMedicalDataException("Doctor not found with id: " + doctorId);
        }
    }

    private MedicalHistoryResponseDTO convertToResponseDTO(MedicalHistory history) {
        MedicalHistoryResponseDTO dto = new MedicalHistoryResponseDTO();
        dto.setId(history.getId());
        dto.setPatientId(history.getPatientId());
        dto.setDoctorId(history.getDoctorId());
        dto.setAppointmentId(history.getAppointmentId());
        dto.setConsultationDate(history.getConsultationDate());
        dto.setChiefComplaint(history.getChiefComplaint());
        dto.setPresentIllness(history.getPresentIllness());
        dto.setPhysicalExamination(history.getPhysicalExamination());
        dto.setDiagnosis(history.getDiagnosis());
        dto.setTreatmentPlan(history.getTreatmentPlan());
        dto.setClinicalNotes(history.getClinicalNotes());
        dto.setFollowUpDate(history.getFollowUpDate());
        dto.setCreatedAt(history.getCreatedAt());
        dto.setUpdatedAt(history.getUpdatedAt());

        // Get patient and doctor names
        patientRepository.findById(history.getPatientId()).ifPresent(patient -> {
            dto.setPatientName(patient.getName());
        });

        doctorRepository.findById(history.getDoctorId()).ifPresent(doctor -> {
            dto.setDoctorName(doctor.getName());
            dto.setDoctorSpecialty(doctor.getSpecialty());
        });

        // Get vital signs if exists
        vitalSignsRepository.findByMedicalHistoryId(history.getId()).ifPresent(vitalSigns -> {
            dto.setVitalSigns(convertToVitalSignsDTO(vitalSigns));
        });

        return dto;
    }

    private VitalSignsDTO convertToVitalSignsDTO(VitalSigns vitalSigns) {
        VitalSignsDTO dto = new VitalSignsDTO();
        dto.setBloodPressureSystolic(vitalSigns.getBloodPressureSystolic());
        dto.setBloodPressureDiastolic(vitalSigns.getBloodPressureDiastolic());
        dto.setHeartRate(vitalSigns.getHeartRate());
        dto.setTemperature(vitalSigns.getTemperature());
        dto.setRespiratoryRate(vitalSigns.getRespiratoryRate());
        dto.setOxygenSaturation(vitalSigns.getOxygenSaturation());
        dto.setWeight(vitalSigns.getWeight());
        dto.setHeight(vitalSigns.getHeight());
        dto.setBmi(vitalSigns.getBmi());
        return dto;
    }

    private PatientAllergyDTO convertToAllergyDTO(PatientAllergy allergy) {
        PatientAllergyDTO dto = new PatientAllergyDTO();
        dto.setId(allergy.getId());
        dto.setPatientId(allergy.getPatientId());
        dto.setAllergen(allergy.getAllergen());
        dto.setReaction(allergy.getReaction());
        dto.setSeverity(allergy.getSeverity());
        dto.setDiagnosedDate(allergy.getDiagnosedDate());
        dto.setNotes(allergy.getNotes());
        return dto;
    }

    private PatientConditionDTO convertToConditionDTO(PatientCondition condition) {
        PatientConditionDTO dto = new PatientConditionDTO();
        dto.setId(condition.getId());
        dto.setPatientId(condition.getPatientId());
        dto.setConditionName(condition.getConditionName());
        dto.setDiagnosedDate(condition.getDiagnosedDate());
        dto.setStatus(condition.getStatus());
        dto.setNotes(condition.getNotes());
        return dto;
    }
}

// Made with Bob
