package com.example.backend_instagram.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "posts")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({ "posts", "hibernateLazyInitializer", "handler" })
    private User user;

    @JsonManagedReference
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Media> media;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "likes_count")
    private Integer likesCount = 0;

    @Column(name="comments_count")
    private Integer commentsCount=0;


    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String access; // "PRIVATE", "PUBLIC", "ONLY_FRIEND"

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}