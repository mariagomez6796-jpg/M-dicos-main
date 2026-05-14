package com.example.CRUDG.service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.CRUDG.entity.Patient;
import com.example.CRUDG.repository.PatientRepository;



@Service


public class PatientService {
    @Autowired
    PatientRepository patientRepository;
    

    @Autowired
    private PasswordService passwordService;
    
    @Autowired
    private BlockService blockService;


    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

    public Patient saveOrUpdate(Patient patient) {
        // Hash the password before saving or updating
        patient.setPassword(passwordService.hashPassword(patient.getPassword()));

        Patient saved = patientRepository.save(patient);

        blockService.addBlock(
             "CREATE_PATIENT ID=" + saved.getId() +
            " NAME=" + saved.getName() +
            " EMAIL=" + saved.getEmailAddress()

    );

    return saved;
    }

    public Patient updatePatient(Long id, Patient updatedPatient) {

      return patientRepository.findById(id).map(patient -> {

        String oldName = patient.getName();

        patient.setName(updatedPatient.getName());
        patient.setEmailAddress(updatedPatient.getEmailAddress());

        if (updatedPatient.getPassword() != null && !updatedPatient.getPassword().isBlank()) {
            patient.setPassword(passwordService.hashPassword(updatedPatient.getPassword()));
        }

        Patient saved = patientRepository.save(patient);

        blockService.addBlock(
            "UPDATE_PATIENT ID=" + saved.getId() +
            " OLD_NAME=" + oldName +
            " NEW_NAME=" + saved.getName()
        );

        return saved;

        }).orElseGet(() -> {

        updatedPatient.setId(id);

        if (updatedPatient.getPassword() != null && !updatedPatient.getPassword().isBlank()) {
            updatedPatient.setPassword(passwordService.hashPassword(updatedPatient.getPassword()));
        }

        Patient saved = patientRepository.save(updatedPatient);

        blockService.addBlock(
            "CREATE_PATIENT (FROM UPDATE) ID=" + saved.getId()
        );

        return saved;
        });
    }


    public void delete(Long id) {

    blockService.addBlock(
        "DELETE_PATIENT ID=" + id
    );

    patientRepository.deleteById(id);
    }


    
}
