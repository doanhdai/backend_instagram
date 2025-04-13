package com.example.backend_instagram.dto.notification;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class NotificationDTO {
    private Long notificationId;
    private Long userId;
    private String message;
    private boolean isRead;
    private LocalDateTime sentAt;
}
