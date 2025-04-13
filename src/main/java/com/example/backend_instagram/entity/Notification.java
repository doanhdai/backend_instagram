package com.example.backend_instagram.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.cglib.core.Local;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_user_notification_id"))
    private User userId;

    @Column(name = "content", nullable = false)
    private String content;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    public Notification(){}

    public Notification(User userId, String content) {
        this.userId = userId;
        this.content = content;
        this.sentAt = LocalDateTime.now();
        this.isRead = false;
    }

}
