package com.example.backend_instagram.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "stories")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Story {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({ "stories", "hibernateLazyInitializer", "handler" })
    private User user;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    private String access; // "PUBLIC", "PRIVATE", "ONLY_FRIEND"

    @Column(nullable = false)
    private Integer status; // 1, 2, 3

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}