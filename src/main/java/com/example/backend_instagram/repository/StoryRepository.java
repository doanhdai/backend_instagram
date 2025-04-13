package com.example.backend_instagram.repository;

import com.example.backend_instagram.entity.Story;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StoryRepository extends JpaRepository<Story, Long> {
    List<Story> findByUserId(Long userId);

    List<Story> findByStatusAndCreatedAtBefore(Integer status, LocalDateTime createdAt);

    List<Story> findByStatus(Integer status);

    List<Story> findByUserIdAndStatus(Long userId, Integer status);
}