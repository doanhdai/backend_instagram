package com.example.backend_instagram.dto.comment;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private Long id;
    private String content;
    private Long userId;
    private String userNickname;
    private String userImage;
    private Long postId;
    private LocalDateTime createdAt;
}