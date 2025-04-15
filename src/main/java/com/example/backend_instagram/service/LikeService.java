package com.example.backend_instagram.service;

import com.example.backend_instagram.dto.post.CreatePostRequest;
import com.example.backend_instagram.entity.Like;
import com.example.backend_instagram.entity.Post;
import com.example.backend_instagram.entity.User;
import com.example.backend_instagram.repository.LikeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LikeService {

    private final LikeRepository likeRepository;
    private final UserService userService;
    private final PostService postService;
    private final NotificationService notificationService;

    public LikeService(LikeRepository likeRepository,
            UserService userService,
            PostService postService,
            NotificationService notificationService) {
        this.likeRepository = likeRepository;
        this.userService = userService;
        this.postService = postService;
        this.notificationService = notificationService;
    }

    @Transactional
    public void likePost(Long postId, Long userId) {
        User user = userService.fetchUserById(userId);
        Post post = postService.getPostById(postId);

        if (likeRepository.existsByUserAndPost(user, post)) {
            throw new IllegalStateException("Người dùng đã thích bài viết này");
        }

        Like like = new Like();
        like.setUser(user);
        like.setPost(post);
        likeRepository.save(like);

        post.setLikesCount(post.getLikesCount() + 1);
        postService.updatePost(post.getId(),
                new CreatePostRequest(post.getTitle(), post.getStatus(), post.getAccess(), null));

        notificationService.createLikeNotification(postId, userId);
    }
}