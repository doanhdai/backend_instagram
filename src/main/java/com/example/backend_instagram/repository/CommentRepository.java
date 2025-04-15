package com.example.backend_instagram.repository;

import com.example.backend_instagram.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
}