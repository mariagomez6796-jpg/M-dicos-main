package com.example.CRUDG.service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.CRUDG.entity.Block;
import com.example.CRUDG.repository.BlockRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

@Service
public class BlockService {

    @Autowired
    private BlockRepository blockRepository;

    private final ObjectMapper mapper = new ObjectMapper()
            .enable(SerializationFeature.INDENT_OUTPUT);

    public String hash(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] bytes = md.digest(input.getBytes());

            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) sb.append('0');
                sb.append(hex);
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void addBlock(String data) {

        Block last = blockRepository.findTopByOrderByBlockIndexDesc();

        int index = (last == null) ? 0 : last.getBlockIndex() + 1;
        String prevHash = (last == null) ? "0" : last.getHash();
        String timestamp = LocalDateTime.now().toString();

        String input = index + timestamp + data + prevHash;
        String newHash = hash(input);

        Block block = new Block();
        block.setBlockIndex(index);
        block.setTimestamp(timestamp);
        block.setData(data);
        block.setPrevHash(prevHash);
        block.setHash(newHash);

        blockRepository.save(block);

        exportToJson(); // NUEVO
    }

    public void exportToJson() {
        try {
            List<Block> blocks = blockRepository.findAllByOrderByBlockIndexAsc();

            Path outputDir = Paths.get("/app/output");
            if (!Files.exists(outputDir)) {
                outputDir = Paths.get("output");
            }
            Files.createDirectories(outputDir);

            File file = outputDir.resolve("blockchain.json").toFile();

            mapper.writeValue(file, blocks);

            System.out.println("Blockchain exportada a JSON correctamente en: " + file.getAbsolutePath());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public boolean validate() {

        List<Block> blocks = blockRepository.findAllByOrderByBlockIndexAsc();

        for (int i = 1; i < blocks.size(); i++) {

            Block current = blocks.get(i);
            Block previous = blocks.get(i - 1);

            String recalculated = hash(
                    current.getBlockIndex() +
                    current.getTimestamp() +
                    current.getData() +
                    current.getPrevHash()
            );

            if (!current.getHash().equals(recalculated)) return false;

            if (!current.getPrevHash().equals(previous.getHash())) return false;
        }

        return true;
    }
    public List<Block> getAllBlocks() {
    return blockRepository.findAllByOrderByBlockIndexAsc();
}


}