package com.example.backend_instagram.repository;

import com.example.backend_instagram.entity.Notification;
import com.example.backend_instagram.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderBySentAtDesc(User user);

    List<Notification> findByUserAndIsReadFalseOrderBySentAtDesc(User user);
}