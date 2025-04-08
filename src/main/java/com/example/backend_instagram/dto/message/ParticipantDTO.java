package com.example.backend_instagram.dto.message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantDTO {
    private Long id; // Thêm trường id để lưu id của participant
    private Long userId;
    private String userFullname;
    private String userNickname;
    private String userImage;
    
    // Constructor bổ sung cho các trường hợp không cần id
    public ParticipantDTO(Long userId, String userFullname, String userNickname, String userImage) {
        this.userId = userId;
        this.userFullname = userFullname;
        this.userNickname = userNickname;
        this.userImage = userImage;
    }
}