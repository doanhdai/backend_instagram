package com.example.backend_instagram.repository;

import com.example.backend_instagram.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
}