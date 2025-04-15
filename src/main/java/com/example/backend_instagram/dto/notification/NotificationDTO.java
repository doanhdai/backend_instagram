package com.example.backend_instagram.dto.notification;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class NotificationDTO {
    private Long notificationId;
    private Long userId; // ID người nhận thông báo
    private Long actorId; // ID người thực hiện hành động
    private String actorNickname; // Tên hiển thị của actor
    private Long postId; // ID bài viết
    private String type; // Loại thông báo (LIKE, COMMENT)
    private String message; // Nội dung thông báo
    private boolean isRead;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime sentAt;
}