package com.example.backend_instagram.controller;

import com.example.backend_instagram.dto.comment.CommentDTO;
import com.example.backend_instagram.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/comments")
public class CommentController {

    private final CommentService commentService;

    @Autowired
    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByPostId(@PathVariable Long postId) {
        List<CommentDTO> comments = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/post/{postId}/user/{userId}")
    public ResponseEntity<Void> addComment(@PathVariable Long postId, @PathVariable Long userId,
            @RequestBody CommentRequest request) {
        commentService.addComment(postId, userId, request.getContent());
        return ResponseEntity.ok().build();
    }
}

class CommentRequest {
    private String content;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}