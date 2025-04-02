package com.example.backend_instagram.dto.post;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Data
public class CreatePostRequest {
    private String title;
    private List<MultipartFile> media;
    private String status;
    private String access; // "PRIVATE", "PUBLIC", "ONLY_FRIEND"
}