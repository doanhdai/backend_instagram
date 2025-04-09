package com.example.backend_instagram.dto.message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDTO {
    private Long id;
    private String name;
    private Boolean isGroupChat;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ParticipantDTO> participants;
    private MessageResponseDTO lastMessage;
    private Long unreadCount;
}