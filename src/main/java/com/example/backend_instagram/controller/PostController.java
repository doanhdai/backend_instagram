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
@RequestMapping("/api/v1/posts")
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

    // get all posts by user id
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Post>> getAllPostsByUserId(@PathVariable Long userId) {
        List<Post> posts = postService.getAllPostsByUserId(userId);
        return ResponseEntity.ok(posts);
    }
    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    // update post
    @PutMapping("/{postId}")
    public ResponseEntity<Post> updatePost(
            @PathVariable Long postId,
            @RequestParam("title") String title,
            @RequestParam(value = "media", required = false) List<MultipartFile> media,
            @RequestParam("status") String status,
            @RequestParam("access") String access) {

        CreatePostRequest request = new CreatePostRequest();
        request.setTitle(title);
        request.setMedia(media);
        request.setStatus(status);
        request.setAccess(access);

        Post updatedPost = postService.updatePost(postId, request);
        return ResponseEntity.ok(updatedPost);
    }

    // delete post (chuyển status thành false để k hthi)
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
        postService.deletePost(postId);
        return ResponseEntity.ok().build();
    }
}