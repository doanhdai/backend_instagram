package com.example.backend_instagram.service;

import com.example.backend_instagram.entity.Notification;
import com.example.backend_instagram.entity.User;
import com.example.backend_instagram.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public List<Notification> getNoticationByUserId(User userId) {
        return notificationRepository.findNotificationByUserId(userId);
    }

    public void createNotification(User userId, String content) {
        Notification notification = new Notification(userId, content);
        notificationRepository.save(notification);
    }
}

