package com.example.backend_instagram.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_follow")
@Getter
@Setter
public class Follow {

    @EmbeddedId
    private FollowId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("followerId") // dùng đúng tên field trong FollowId
    @JoinColumn(name = "follower_id", referencedColumnName = "id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_follower_id"))
    private User follower;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("followingId") // dùng đúng tên field trong FollowId
    @JoinColumn(name = "following_id", referencedColumnName = "id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_following_id"))
    private User following;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "is_blocking", nullable = false)
    private boolean blocking;

    @Column(name = "is_friend", nullable = false)
    private boolean friend;

    public Follow() {}

    public Follow(User follower, User following, LocalDateTime createdAt, boolean isFriend, boolean isBlocking) {
        this.follower = follower;
        this.following = following;
        this.id = new FollowId(follower.getId(), following.getId());
        this.createdAt = createdAt;
        this.friend = isFriend;
        this.blocking = isBlocking;
    }

    public Boolean getFriend() {
        return this.friend;
    }


}
