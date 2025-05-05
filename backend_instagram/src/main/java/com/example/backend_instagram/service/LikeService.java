package com.example.backend_instagram.service;

import com.example.backend_instagram.entity.Like;
import com.example.backend_instagram.entity.Post;
import com.example.backend_instagram.entity.User;
import com.example.backend_instagram.repository.LikeRepository;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostService postService;
    private final UserService userService;
    private final NotificationService notificationService;

    public LikeService(LikeRepository likeRepository, PostService postService, UserService userService,
            NotificationService notificationService) {
        this.likeRepository = likeRepository;
        this.postService = postService;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    @Transactional
    public void likePost(Long postId, Long userId) {
        Post post = postService.getPostById(postId);
        User user = userService.fetchUserById(userId);

        // Kiểm tra xem người dùng đã thích bài viết chưa
        if (likeRepository.findByPostAndUser(post, user).isPresent()) {
            throw new IllegalStateException("Người dùng đã thích bài viết này");
        }

        // Tạo like mới
        Like like = new Like();
        like.setPost(post);
        like.setUser(user);
        likeRepository.save(like);

        // Cập nhật số lượt thích
        post.setLikesCount(post.getLikesCount() + 1);
        postService.savePost(post);

        // Tạo thông báo
        notificationService.createLikeNotification(postId, userId);
    }


    @Transactional
    public void unlikePost(Long postId, Long userId) {
        Post post = postService.getPostById(postId);
        User user = userService.fetchUserById(userId);

        Like like = likeRepository.findByPostAndUser(post, user)
                .orElseThrow(() -> new IllegalStateException("Người dùng chưa thích bài viết này"));

        likeRepository.delete(like);

        post.setLikesCount(Math.max(0, post.getLikesCount() - 1));
        postService.savePost(post);
    }

    public List<Long> getLikedPostIdsByUser(Long userId) {
        User user = userService.fetchUserById(userId);
        return likeRepository.findByUser(user).stream()
                .map(like -> like.getPost().getId())
                .toList();
    }
}