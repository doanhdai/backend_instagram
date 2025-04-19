package com.example.backend_instagram.repository;

import com.example.backend_instagram.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserIdAndStatus(Long userId, String status);
    List<Post> findByStatus(String status);
<<<<<<< HEAD
    List<Post> findByUserId(Long userId);
    long countByUserId(Long userId);
=======
    
>>>>>>> 7aaa0d3abf6729f53787353f3bbe488fc11e14aa
}