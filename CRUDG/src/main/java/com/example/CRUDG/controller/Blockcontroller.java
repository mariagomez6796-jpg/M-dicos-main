package com.example.CRUDG.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.CRUDG.entity.Block;
import com.example.CRUDG.service.BlockService;


@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")


@RestController
@RequestMapping("api/v1/blockchain")
public class  Blockcontroller {

    @Autowired
    private BlockService blockService;

    //  Verificar integridad
    @GetMapping("/validate")
    public String validate() {

        boolean isValid = blockService.validate();

        if (isValid) {
            return "Cadena válida ";
        } else {
            return "Cadena CORRUPTA ";
        }
    }

    @GetMapping
    public List<Block> getAllBlocks() {
        return blockService.getAllBlocks();
    }
}