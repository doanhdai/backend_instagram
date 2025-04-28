package com.example.backend_instagram.repository;

import com.example.backend_instagram.entity.Media;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaRepository extends JpaRepository<Media, Long> {
}