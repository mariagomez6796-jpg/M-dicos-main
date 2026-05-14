package com.example.CRUDG.controller;

import com.example.CRUDG.service.BlockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/blockchain")
public class BlockController {

    @Autowired
    private BlockService blockService;

    //  Verificar integridad
    @GetMapping("/validate")
    public String validate() {

        boolean isValid = blockService.validate();

        if (isValid) {
            return "Cadena válida ✅";
        } else {
            return "Cadena CORRUPTA ❌";
        }
    }
}