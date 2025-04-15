package com.example.backend_instagram.service;

import com.example.backend_instagram.entity.Comment;
import com.example.backend_instagram.entity.Post;
import com.example.backend_instagram.entity.User;
import com.example.backend_instagram.repository.CommentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserService userService;
    private final PostService postService;
    private final NotificationService notificationService;

    public CommentService(CommentRepository commentRepository,
            UserService userService,
            PostService postService,
            NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.userService = userService;
        this.postService = postService;
        this.notificationService = notificationService;
    }

    @Transactional
    public void addComment(Long postId, Long userId, String content) {
        User user = userService.fetchUserById(userId);
        Post post = postService.getPostById(postId);

        Comment comment = new Comment();
        comment.setUser(user);
        comment.setPost(post);
        comment.setContent(content);
        commentRepository.save(comment);

        notificationService.createCommentNotification(postId, userId, content);
    }
}