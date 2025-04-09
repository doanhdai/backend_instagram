package com.example.backend_instagram.dto.message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Long id; // Thêm id để hỗ trợ WebSocket
    private Long conversationId;
    private Long senderId;
    private String content;
}