package com.example.backend_instagram.dto.follow;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class FollowDTO {
    private long followerId;
    private long followingId;
    private LocalDateTime sentAt;
    private boolean blocking;
    private boolean friend;
}
