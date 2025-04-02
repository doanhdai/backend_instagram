package com.example.backend_instagram.controller;

import com.example.backend_instagram.dto.post.CreatePostRequest;
import com.example.backend_instagram.entity.Post;
import com.example.backend_instagram.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    @Autowired
    private PostService postService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Post> createPost(
            @RequestParam("userId") Long userId,
            @RequestParam("title") String title,
            @RequestParam("media") List<MultipartFile> media,
            @RequestParam("status") String status,
            @RequestParam("access") String access) {

        CreatePostRequest request = new CreatePostRequest();
        request.setTitle(title);
        request.setMedia(media);
        request.setStatus(status);
        request.setAccess(access);

        Post post = postService.createPost(userId, request);
        return ResponseEntity.ok(post);
    }
}