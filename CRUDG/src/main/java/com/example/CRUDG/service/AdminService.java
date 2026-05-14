package com.example.CRUDG.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.CRUDG.entity.Admin;
import com.example.CRUDG.repository.AdminRepository;

@Service

public class AdminService {

    @Autowired
    AdminRepository adminRepository;

    @Autowired
    private PasswordService passwordService;
    @Autowired
        private BlockService blockService;


    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    public Optional<Admin> getAdminById(Long id) {
        return adminRepository.findById(id);
    }

    public Admin saveOrUpdate(Admin admin) {
    admin.setPassword(passwordService.hashPassword(admin.getPassword()));

    Admin saved = adminRepository.save(admin);

    blockService.addBlock(
        "CREATE_ADMIN ID=" + saved.getId() +
        " NAME=" + saved.getName() +
        " EMAIL=" + saved.getEmail()
    );

    return saved;
}

    public Admin updateAdmin(Long id, Admin updatedAdmin) {
    return adminRepository.findById(id).map(admin -> {

        String oldName = admin.getName();

        admin.setName(updatedAdmin.getName());
        admin.setEmail(updatedAdmin.getEmail());

        String newPassword = updatedAdmin.getPassword();
        if (newPassword != null && !newPassword.isBlank()) {
            admin.setPassword(passwordService.hashPassword(newPassword));
        }

        Admin saved = adminRepository.save(admin);

        blockService.addBlock(
            "UPDATE_ADMIN ID=" + saved.getId() +
            " OLD_NAME=" + oldName +
            " NEW_NAME=" + saved.getName()
        );

        return saved;

    }).orElseGet(() -> {

        updatedAdmin.setId(id);

        String newPassword = updatedAdmin.getPassword();
        if (newPassword != null && !newPassword.isBlank()) {
            updatedAdmin.setPassword(passwordService.hashPassword(newPassword));
        }

        Admin saved = adminRepository.save(updatedAdmin);

        blockService.addBlock(
            "CREATE_ADMIN(FROM_UPDATE) ID=" + saved.getId()
        );

        return saved;
    });
}
    
    public void delete(Long id) {

    blockService.addBlock(
        "DELETE_ADMIN ID=" + id
    );

    adminRepository.deleteById(id);
}

    public Optional<Admin> findByEmail(String email) {
    return adminRepository.findByEmail(email);
}


}
