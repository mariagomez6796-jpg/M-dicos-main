package com.example.CRUDG.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.CRUDG.entity.Doctor;
import com.example.CRUDG.repository.DoctorRepository;



@Service

public class DoctorService {
    @Autowired
    DoctorRepository doctorRepository;

    @Autowired
    private PasswordService passwordService;
    @Autowired
        private BlockService blockService;

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }

    public Doctor saveOrUpdate(Doctor doctor) {
    doctor.setPassword(passwordService.hashPassword(doctor.getPassword()));

    Doctor saved = doctorRepository.save(doctor);

    blockService.addBlock(
        "CREATE_DOCTOR ID=" + saved.getId() +
        " NAME=" + saved.getName() +
        " EMAIL=" + saved.getEmail()
    );

    return saved;
}

    public Doctor updateDoctor(Long id, Doctor updatedDoctor) {
    return doctorRepository.findById(id).map(doctor -> {

        String oldName = doctor.getName();

        // Only update name and email if they are provided (not null)
        if (updatedDoctor.getName() != null && !updatedDoctor.getName().isBlank()) {
            doctor.setName(updatedDoctor.getName());
        }
        if (updatedDoctor.getEmail() != null && !updatedDoctor.getEmail().isBlank()) {
            doctor.setEmail(updatedDoctor.getEmail());
        }

        String newPassword = updatedDoctor.getPassword();
        if (newPassword != null && !newPassword.isBlank()) {
            doctor.setPassword(passwordService.hashPassword(newPassword));
        }
        
        // Update signature and logo if provided (allow updates even if just these fields)
        if (updatedDoctor.getSignatureData() != null) {
            doctor.setSignatureData(updatedDoctor.getSignatureData());
        }
        if (updatedDoctor.getHospitalLogo() != null) {
            doctor.setHospitalLogo(updatedDoctor.getHospitalLogo());
        }

        Doctor saved = doctorRepository.save(doctor);

        blockService.addBlock(
            "UPDATE_DOCTOR ID=" + saved.getId() +
            " OLD_NAME=" + oldName +
            " NEW_NAME=" + saved.getName()
        );

        return saved;

    }).orElseGet(() -> {

        updatedDoctor.setId(id);

        String newPassword = updatedDoctor.getPassword();
        if (newPassword != null && !newPassword.isBlank()) {
            updatedDoctor.setPassword(passwordService.hashPassword(newPassword));
        }

        Doctor saved = doctorRepository.save(updatedDoctor);

        blockService.addBlock(
            "CREATE_DOCTOR(FROM_UPDATE) ID=" + saved.getId()
        );

        return saved;
    });
}

    public void delete(Long id) {

    blockService.addBlock(
        "DELETE_DOCTOR ID=" + id
    );

    doctorRepository.deleteById(id);
}

    public Optional<Doctor> findByEmail(String email) {
    return doctorRepository.findByEmail(email);
}


    
}
