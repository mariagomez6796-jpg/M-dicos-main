package com.example.CRUDG.repository;

import com.example.CRUDG.entity.Block;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BlockRepository extends JpaRepository<Block, Long> {

    Block findTopByOrderByBlockIndexDesc();

    List<Block> findAllByOrderByBlockIndexAsc();
}