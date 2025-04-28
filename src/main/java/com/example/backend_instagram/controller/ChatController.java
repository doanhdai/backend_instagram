package com.example.backend_instagram.controller;

import com.example.backend_instagram.dto.message.ConversationDTO;
import com.example.backend_instagram.dto.message.MessageResponseDTO;
import com.example.backend_instagram.dto.user.UserStatsDTO;
import com.example.backend_instagram.entity.Conversation;
import com.example.backend_instagram.entity.User;
import com.example.backend_instagram.service.ChatService;
import com.example.backend_instagram.utils.constant.ApiMessage;
import com.example.backend_instagram.utils.error.IdInvalidException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    /**
     * Lấy hoặc tạo cuộc trò chuyện giữa hai người dùng
     */
    @GetMapping("/conversation")
    @ApiMessage("Lấy hoặc tạo cuộc trò chuyện thành công")
    public ResponseEntity<Conversation> getOrCreateConversation(
            @RequestParam Long userId,
            @RequestParam Long otherUserId) throws IdInvalidException {

        Conversation conversation = chatService.getOrCreateConversation(userId, otherUserId);
        return ResponseEntity.ok(conversation);
    }

    /**
     * Tạo cuộc trò chuyện mới giữa hai người dùng (hỗ trợ POST)
     */
    @PostMapping("/conversation")
    @ApiMessage("Tạo cuộc trò chuyện thành công")
    public ResponseEntity<Conversation> createConversation(
            @RequestBody Map<String, Long> requestBody) throws IdInvalidException {

        Long userId = requestBody.get("userId");
        Long otherUserId = requestBody.get("otherUserId");

        if (userId == null || otherUserId == null) {
            throw new IdInvalidException("Thiếu userId hoặc otherUserId");
        }

        Conversation conversation = chatService.getOrCreateConversation(userId, otherUserId);
        return ResponseEntity.ok(conversation);
    }

    /**
     * Lấy danh sách cuộc trò chuyện của một người dùng
     */
    @GetMapping("/conversations/{userId}")
    @ApiMessage("Lấy danh sách cuộc trò chuyện thành công")
    public ResponseEntity<List<ConversationDTO>> getConversationsForUser(
            @PathVariable Long userId) throws IdInvalidException {

        List<ConversationDTO> conversations = chatService.getConversationsForUser(userId);
        return ResponseEntity.ok(conversations);
    }

    /**
     * Lấy tin nhắn của một cuộc trò chuyện theo trang
     */
    @GetMapping("/messages")
    @ApiMessage("Lấy tin nhắn thành công")
    public ResponseEntity<List<MessageResponseDTO>> getMessagesPaginated(
            @RequestParam Long conversationId,
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) throws IdInvalidException {

        List<MessageResponseDTO> messages = chatService.getMessagesPaginated(conversationId, userId, page, size);
        return ResponseEntity.ok(messages);
    }

    /**
     * Lấy cuộc trò chuyện nhóm
     */
    @GetMapping("/group-conversation")
    @ApiMessage("Lấy cuộc trò chuyện nhóm thành công")
    public ResponseEntity<Conversation> getGroupConversation() {
        Conversation conversation = chatService.getGroupConversation();
        return ResponseEntity.ok(conversation);
    }

    /**
     * Lấy thông tin chi tiết của một cuộc trò chuyện
     */
    @GetMapping("/conversation/{conversationId}")
    @ApiMessage("Lấy thông tin cuộc trò chuyện thành công")
    public ResponseEntity<ConversationDTO> getConversationById(
            @PathVariable Long conversationId,
            @RequestParam Long userId) throws IdInvalidException {

        ConversationDTO conversation = chatService.getConversationById(conversationId, userId);
        return ResponseEntity.ok(conversation);
    }

    @GetMapping("/conversationUsers/{userId}")
    public ResponseEntity<?> getConversationUsers(@PathVariable Long userId) {
        List<User> users = chatService.getUsersWithConversation(userId);
        return ResponseEntity.ok(users);
    }

    // Nhóm
    @PostMapping("/group")
    @ApiMessage("Tạo group chat thành công")
    public ResponseEntity<Conversation> createGroupConversation(@RequestBody Map<String, Object> requestBody)
            throws IdInvalidException {
        String groupName = (String) requestBody.get("name");
        List<?> userIdsRaw = (List<?>) requestBody.get("userIds");
        List<Long> userIds = userIdsRaw.stream()
                .map(id -> Long.valueOf(id.toString()))
                .toList();
        Conversation group = chatService.createGroupConversation(groupName, userIds);
        return ResponseEntity.ok(group);
    }

    @PutMapping("/conversation/{conversationId}/name")
    @ApiMessage("Cập nhật tên cuộc trò chuyện thành công")
    public ResponseEntity<ConversationDTO> updateConversationName(
            @PathVariable Long conversationId,
            @RequestBody Map<String, String> payload,
            @RequestParam Long userId) throws IdInvalidException {
        
        String newName = payload.get("name");
        if (newName == null || newName.trim().isEmpty()) {
            throw new IdInvalidException("Tên cuộc trò chuyện không được để trống");
        }
        
        ConversationDTO updatedConversation = chatService.updateConversationName(conversationId, newName, userId);
        return ResponseEntity.ok(updatedConversation);
    }

    @PostMapping("/conversation/{conversationId}/add-member") // có trùng không? 
    @ApiMessage("Thêm thành viên vào nhóm thành công")
    public ResponseEntity<ConversationDTO> addMemberToConversation(
            @PathVariable Long conversationId,
            @RequestBody Map<String, Long> payload) throws IdInvalidException {
        
        Long userId = payload.get("userId"); // ID người được thêm vào
        Long addedByUserId = payload.get("addedByUserId"); // ID người thêm
        
        if (userId == null || addedByUserId == null) {
            throw new IdInvalidException("Thiếu thông tin userId hoặc addedByUserId");
        }
        
        ConversationDTO updatedConversation = chatService.addMemberToConversation(conversationId, userId, addedByUserId);
        return ResponseEntity.ok(updatedConversation);
    }

    @DeleteMapping("/conversation/{conversationId}/participant/{userId}")
    @ApiMessage("Đã xóa thành viên khỏi nhóm")
    public ResponseEntity<ConversationDTO> removeParticipant(
            @PathVariable Long conversationId,
            @PathVariable Long userId,
            @RequestParam Long removerId) throws IdInvalidException {
        
        ConversationDTO updatedConversation = chatService.removeParticipant(conversationId, userId, removerId);
        return ResponseEntity.ok(updatedConversation);
    }

    @DeleteMapping("/conversation/{conversationId}/leave/{userId}")
    @ApiMessage("Đã rời khỏi nhóm")
    public ResponseEntity<Object> leaveConversation(
            @PathVariable Long conversationId,
            @PathVariable Long userId) throws IdInvalidException {
        
        chatService.leaveConversation(conversationId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/block-status")
    public ResponseEntity<Map<String, Boolean>> getBlockStatus(
            @RequestParam Long userId,
            @RequestParam Long otherUserId) {
        
        boolean isBlocked = chatService.checkBlockStatus(userId, otherUserId);
        Map<String, Boolean> result = Map.of("isBlocked", isBlocked);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/conversation/{conversationId}/owner")
    public ResponseEntity<UserStatsDTO> getConversationOwner(@PathVariable Long conversationId) throws IdInvalidException {
        UserStatsDTO owner = chatService.getConversationOwner(conversationId);
        return ResponseEntity.ok(owner);
    }
}