package com.example.backend_instagram.dto.message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponseDTO {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private String senderAvatar;
    private Long receiverId;
    private String receiverName;
    private String receiverAvatar;
    private String content;
    private LocalDateTime createdAt;
    private boolean IsRead;
    // Thêm trường participants để hỗ trợ hiển thị người tham gia trong tin nhắn
    private List<ParticipantDTO> participants;
}