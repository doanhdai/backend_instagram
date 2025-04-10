package com.example.backend_instagram.service;

import com.example.backend_instagram.dto.message.ConversationDTO;
import com.example.backend_instagram.dto.message.MessageResponseDTO;
import com.example.backend_instagram.dto.message.ParticipantDTO;
import com.example.backend_instagram.entity.Conversation;
import com.example.backend_instagram.entity.ConversationParticipant;
import com.example.backend_instagram.entity.Message;
import com.example.backend_instagram.entity.User;
import com.example.backend_instagram.repository.ConversationParticipantRepository;
import com.example.backend_instagram.repository.ConversationRepository;
import com.example.backend_instagram.repository.MessageRepository;
import com.example.backend_instagram.repository.UserRepository;
import com.example.backend_instagram.utils.error.IdInvalidException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ConversationRepository conversationRepository;
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private ConversationParticipantRepository participantRepository;
    
    @Autowired
    private MessageService messageService;

    /**
     * Lấy hoặc tạo mới cuộc trò chuyện giữa hai người dùng
     */
    @Transactional
    public Conversation getOrCreateConversation(Long userId, Long otherUserId) throws IdInvalidException {
        // Kiểm tra người dùng có tồn tại không
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IdInvalidException("Người dùng không tồn tại: " + userId));
        
        User otherUser = userRepository.findById(otherUserId)
            .orElseThrow(() -> new IdInvalidException("Người dùng không tồn tại: " + otherUserId));
        
        // Kiểm tra xem người dùng có quyền chat với người kia không
        // Ví dụ: kiểm tra tài khoản chặn, quyền riêng tư, v.v.
        // if (blockRepository.existsByUserIdAndBlockedUserId(userId, otherUserId) || 
        //     blockRepository.existsByUserIdAndBlockedUserId(otherUserId, userId)) {
        //     throw new IdInvalidException("Không thể bắt đầu cuộc trò chuyện với người dùng đã chặn");
        // }
        
        // Tìm conversation giữa 2 user
        Optional<Conversation> existingConversation = conversationRepository.findConversationBetweenUsers(userId, otherUserId);
        
        if (existingConversation.isPresent()) {
            Conversation conversation = existingConversation.get();
            // Đảm bảo eager loading participants
            conversation.setParticipants(participantRepository.findByConversationId(conversation.getId()));
            return conversation;
        }
        
        // Tạo conversation mới
        Conversation newConversation = new Conversation();
        newConversation.setName("Chat between " + user.getUserNickname() + " and " + otherUser.getUserNickname());
        newConversation.setIsGroupChat(false);
        Conversation savedConversation = conversationRepository.save(newConversation);
        
        // Thêm cả 2 người dùng vào conversation
        addUserToConversation(savedConversation, user);
        addUserToConversation(savedConversation, otherUser);
        
        // Đảm bảo kết quả trả về có participants
        savedConversation.setParticipants(participantRepository.findByConversationId(savedConversation.getId()));
        return savedConversation;
    }
    
    /**
     * Thêm người dùng vào cuộc trò chuyện
     */
    private void addUserToConversation(Conversation conversation, User user) {
        // Kiểm tra xem user đã tham gia conversation chưa
        if (participantRepository.existsByConversationIdAndUserId(conversation.getId(), user.getId())) {
            return;
        }
        
        // Tạo participant mới
        ConversationParticipant participant = new ConversationParticipant();
        participant.setConversation(conversation);
        participant.setUser(user);
        
        // Lưu vào database
        participantRepository.save(participant);
    }
    
    /**
     * Lấy danh sách cuộc trò chuyện của người dùng
     */
    @Transactional
    public List<ConversationDTO> getConversationsForUser(Long userId) throws IdInvalidException {
        if (!userRepository.existsById(userId)) {
            throw new IdInvalidException("User not found");
        }
        
        // Sửa từ findConversationsForUser thành findConversationsByUserId
        List<Conversation> conversations = conversationRepository.findConversationsByUserId(userId);
        return conversations.stream()
            .map(conversation -> {
                ConversationDTO dto = convertToDTO(conversation, userId);
                
                // Đảm bảo thông tin participants đầy đủ
                List<ConversationParticipant> participants = participantRepository.findByConversationId(conversation.getId());
                List<ParticipantDTO> participantDTOs = participants.stream()
                    .map(this::convertToParticipantDTO)
                    .collect(Collectors.toList());
                dto.setParticipants(participantDTOs);
                
                return dto;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Lấy tin nhắn của một cuộc trò chuyện theo trang
     */
    public List<MessageResponseDTO> getMessagesPaginated(Long conversationId, Long userId, int page, int size) throws IdInvalidException {
        if (!conversationRepository.existsById(conversationId)) {
            throw new IdInvalidException("Cuộc trò chuyện không tồn tại");
        }
        
        if (!userRepository.existsById(userId)) {
            throw new IdInvalidException("Người dùng không tồn tại");
        }
        
        // Kiểm tra xem người dùng có trong cuộc trò chuyện không
        if (!participantRepository.existsByConversationIdAndUserId(conversationId, userId)) {
            throw new IdInvalidException("Người dùng không trong cuộc trò chuyện này");
        }
        
        Pageable pageable = PageRequest.of(page, size);
        List<Message> messages = messageRepository.findByConversationIdWithPagination(conversationId, pageable);
        
        // Đánh dấu đã đọc các tin nhắn
        messageRepository.markMessagesAsReadInConversation(conversationId, userId);
        
        return messages.stream()
                .map(messageService::convertToMessageResponseDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy cuộc trò chuyện nhóm
     */
    public Conversation getGroupConversation() {
        return conversationRepository.findFirstGroupConversation()
                .orElseGet(() -> {
                    Conversation newConversation = new Conversation();
                    newConversation.setName("Group Chat");
                    newConversation.setIsGroupChat(true);
                    return conversationRepository.save(newConversation);
                });
    }
    
    /**
     * Chuyển đổi từ Entity sang DTO
     */
    private ConversationDTO convertToConversationDTO(Conversation conversation, Long currentUserId) {
        ConversationDTO dto = new ConversationDTO();
        dto.setId(conversation.getId());
        dto.setName(conversation.getName());
        dto.setIsGroupChat(conversation.getIsGroupChat());
        dto.setCreatedAt(conversation.getCreatedAt());
        dto.setUpdatedAt(conversation.getUpdatedAt());
        
        // Lấy danh sách người tham gia
        List<ConversationParticipant> participants = participantRepository.findByConversationId(conversation.getId());
        List<ParticipantDTO> participantDTOs = participants.stream()
            .map(this::convertToParticipantDTO)
            .collect(Collectors.toList());
        dto.setParticipants(participantDTOs);
        
        // Lấy tin nhắn cuối cùng
        Pageable pageable = PageRequest.of(0, 1);
        List<Message> lastMessages = messageRepository.findByConversationIdWithPagination(conversation.getId(), pageable);
        
        if (!lastMessages.isEmpty()) {
            dto.setLastMessage(messageService.convertToMessageResponseDTO(lastMessages.get(0)));
        }
        
        // Đếm số tin nhắn chưa đọc
        Long unreadCount = messageRepository.countUnreadMessagesInConversation(conversation.getId(), currentUserId);
        dto.setUnreadCount(unreadCount);
        
        return dto;
    }
    
    /**
     * Chuyển đổi từ ConversationParticipant sang ParticipantDTO
     */
    private ParticipantDTO convertToParticipantDTO(ConversationParticipant participant) {
        ParticipantDTO dto = new ParticipantDTO();
        dto.setId(participant.getId());           // ID của participant
        dto.setUserId(participant.getUser().getId()); // ID của user
        dto.setUserFullname(participant.getUser().getUserFullname());
        dto.setUserNickname(participant.getUser().getUserNickname());
        dto.setUserImage(participant.getUser().getUserImage());
        return dto;
    }

    /**
     * Lấy thông tin cuộc trò chuyện theo ID
     */
    @Transactional
    public ConversationDTO getConversationById(Long conversationId, Long userId) throws IdInvalidException {
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new IdInvalidException("Conversation not found"));
        
        ConversationDTO dto = convertToDTO(conversation, userId);
        
        // Đảm bảo danh sách participants không bao giờ là null
        if (dto.getParticipants() == null) {
            dto.setParticipants(new ArrayList<>());
        }
        
        // Thêm thông tin người tham gia
        List<ConversationParticipant> participants = participantRepository.findByConversationId(conversationId);
        List<ParticipantDTO> participantDTOs = new ArrayList<>();
        
        for (ConversationParticipant participant : participants) {
            User user = participant.getUser();
            ParticipantDTO participantDTO = new ParticipantDTO();
            participantDTO.setId(participant.getId());
            participantDTO.setUserId(user.getId());
            participantDTO.setUserFullname(user.getUserFullname());
            participantDTO.setUserNickname(user.getUserNickname());
            participantDTO.setUserImage(user.getUserImage());
            participantDTOs.add(participantDTO);
        }
        
        dto.setParticipants(participantDTOs);
        return dto;
    }
    
    // Thêm phương thức convertToDTO nếu chưa có
    private ConversationDTO convertToDTO(Conversation conversation, Long userId) {
        ConversationDTO dto = new ConversationDTO();
        dto.setId(conversation.getId());
        dto.setName(conversation.getName());
        dto.setIsGroupChat(conversation.getIsGroupChat());
        dto.setCreatedAt(conversation.getCreatedAt());
        dto.setUpdatedAt(conversation.getUpdatedAt());
        // Các trường khác được thiết lập ở các phương thức khác
        return dto;
    }
}