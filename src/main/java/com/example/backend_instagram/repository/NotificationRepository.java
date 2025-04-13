package com.example.backend_instagram.repository;

import com.example.backend_instagram.entity.Notification;
import com.example.backend_instagram.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findNotificationByUserId(User userId);

}
