package com.example.backend_instagram.controller;

import com.example.backend_instagram.dto.notification.NotificationDTO;
import com.example.backend_instagram.entity.User;
import com.example.backend_instagram.service.NotificationService;
import com.example.backend_instagram.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/notification")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<NotificationDTO>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications()
                .stream()
                .map(notification -> {
                    NotificationDTO dto = new NotificationDTO();
                    dto.setNotificationId(notification.getNotificationId());
                    dto.setUserId(notification.getUser().getId());
                    dto.setActorId(notification.getActor().getId());
                    dto.setActorNickname(notification.getActor().getUserNickname());
                    dto.setPostId(notification.getPost().getId());
                    dto.setType(notification.getType().name());
                    dto.setMessage(notification.getMessage());
                    dto.setRead(notification.isRead());
                    dto.setSentAt(notification.getSentAt());
                    return dto;
                })
                .collect(Collectors.toList()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> getNotificationsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotificationsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotificationsByUserId(userId));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }
}