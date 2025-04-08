package com.example.backend_instagram.controller;

import com.example.backend_instagram.dto.message.ConversationDTO;
import com.example.backend_instagram.dto.message.MessageResponseDTO;
import com.example.backend_instagram.entity.Conversation;
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
}