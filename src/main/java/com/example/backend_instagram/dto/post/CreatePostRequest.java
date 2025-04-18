package com.example.backend_instagram.dto.post;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class CreatePostRequest {
    private String title;
    private List<MultipartFile> media;
    private String status;
    private String access;

    // Constructor mặc định
    public CreatePostRequest() {
    }

    // Constructor mới để hỗ trợ LikeService
    public CreatePostRequest(String title, String status, String access, List<MultipartFile> media) {
        this.title = title;
        this.status = status;
        this.access = access;
        this.media = media;
    }
}