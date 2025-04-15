package com.example.backend_instagram.repository;

import com.example.backend_instagram.entity.Like;
import com.example.backend_instagram.entity.Post;
import com.example.backend_instagram.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LikeRepository extends JpaRepository<Like, Long> {
    boolean existsByUserAndPost(User user, Post post);
}