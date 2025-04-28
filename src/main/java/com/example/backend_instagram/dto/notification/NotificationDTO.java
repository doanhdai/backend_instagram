package com.example.backend_instagram.dto.notification;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class NotificationDTO {
    private Long notificationId;
    private Long userId;
    private Long actorId; 
    private String actorNickname; 
    private String userImage;
    private Long postId; 
    private String type;
    private String message; 
    private boolean isRead;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime sentAt;
}