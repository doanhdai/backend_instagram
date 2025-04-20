package com.example.backend_instagram.repository;

import com.example.backend_instagram.entity.Comment;
import com.example.backend_instagram.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostOrderByCreatedAtDesc(Post post);
    
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.post = ?1")
    Long countByPost(Post post);
}