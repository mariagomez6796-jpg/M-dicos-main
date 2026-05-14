package com.example.CRUDG.entity;

import jakarta.persistence.*;

@Entity
public class Block {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int blockIndex;
    private String timestamp;

    @Column(length = 1000)
    private String data;

    private String prevHash;
    private String hash;

    // getters y setters
}