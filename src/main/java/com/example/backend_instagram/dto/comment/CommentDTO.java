package com.example.backend_instagram.dto.comment;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentDTO {
    private Long id;
    private Long userId;
    private String userNickname;
    private String userImage;
    private Long postId;
    private String content;
    private Long commentsCount;
    private LocalDateTime createdAt;
}