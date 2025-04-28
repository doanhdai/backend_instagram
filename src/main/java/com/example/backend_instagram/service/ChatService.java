package com.example.backend_instagram.service;

import com.example.backend_instagram.dto.message.ConversationDTO;
import com.example.backend_instagram.dto.message.MessageResponseDTO;
import com.example.backend_instagram.dto.message.ParticipantDTO;
import com.example.backend_instagram.dto.user.UserStatsDTO;
import com.example.backend_instagram.entity.Conversation;
import com.example.backend_instagram.entity.ConversationParticipant;
import com.example.backend_instagram.entity.Message;
import com.example.backend_instagram.entity.User;
import com.example.backend_instagram.entity.Follow;
import com.example.backend_instagram.repository.ConversationParticipantRepository;
import com.example.backend_instagram.repository.ConversationRepository;
import com.example.backend_instagram.repository.MessageRepository;
import com.example.backend_instagram.repository.UserRepository;
import com.example.backend_instagram.repository.FollowRepository;
import com.example.backend_instagram.utils.error.IdInvalidException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
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

    @Autowired
    private FollowRepository followRepository;

    /**
     * Lấy hoặc tạo mới cuộc trò chuyện giữa hai người dùng
     */
    @Transactional
    public Conversation getOrCreateConversation(Long userId, Long otherUserId) throws IdInvalidException {
        if (userId.equals(otherUserId)) {
            throw new IdInvalidException("Không thể tự chat với chính mình");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IdInvalidException("Người dùng không tồn tại: " + userId));
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new IdInvalidException("Người dùng không tồn tại: " + otherUserId));

        Optional<Follow> followOpt = followRepository.findByFollowerAndFollowing(user, otherUser);
        Optional<Follow> reverseFollowOpt = followRepository.findByFollowerAndFollowing(otherUser, user);

        boolean isFriend = followOpt.map(Follow::getFriend).orElse(false)
                && reverseFollowOpt.map(Follow::getFriend).orElse(false);
        boolean isBlocking = followOpt.map(Follow::isBlocking).orElse(false)
                || reverseFollowOpt.map(Follow::isBlocking).orElse(false);

        if (isBlocking) {
            Optional<Conversation> existingConversation = conversationRepository.findConversationBetweenUsers(userId, otherUserId);
            if (existingConversation.isPresent()) {
                Conversation conversation = existingConversation.get();
                conversation.setParticipants(participantRepository.findByConversationId(conversation.getId()));
                return conversation;
            }
            throw new IdInvalidException("Một trong hai người đã chặn, không thể tạo cuộc trò chuyện mới");
        }
        if (!isFriend) {
            throw new IdInvalidException("Hai người chưa theo dõi nhau, không thể tạo cuộc trò chuyện");
        }

        Optional<Conversation> existingConversation = conversationRepository.findConversationBetweenUsers(userId,
                otherUserId);

        if (existingConversation.isPresent()) {
            Conversation conversation = existingConversation.get();
            conversation.setParticipants(participantRepository.findByConversationId(conversation.getId()));
            return conversation;
        }
        Conversation newConversation = new Conversation();
        newConversation.setName("Chat between " + user.getUserNickname() + " and " + otherUser.getUserNickname());
        newConversation.setIsGroupChat(false);
        Conversation savedConversation = conversationRepository.save(newConversation);
        addUserToConversation(savedConversation, user);
        addUserToConversation(savedConversation, otherUser);
        savedConversation.setParticipants(participantRepository.findByConversationId(savedConversation.getId()));
        return savedConversation;
    }

    /**
     * Thêm người dùng vào cuộc trò chuyện
     */
    private void addUserToConversation(Conversation conversation, User user) {
        if (participantRepository.existsByConversationIdAndUserId(conversation.getId(), user.getId())) {
            return;
        }
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

        List<Conversation> conversations = conversationRepository.findConversationsByUserId(userId);
        List<ConversationDTO> result = new ArrayList<>();
        for (Conversation conversation : conversations) {
            if (Boolean.FALSE.equals(conversation.getIsGroupChat())) {
                List<ConversationParticipant> participants = participantRepository
                        .findByConversationId(conversation.getId());
                if (participants.size() == 2) {
                    Long otherUserId = participants.stream()
                            .map(cp -> cp.getUser().getId())
                            .filter(id -> !id.equals(userId))
                            .findFirst().orElse(null);

                    if (otherUserId != null) {
                        User user = userRepository.findById(userId).orElse(null);
                        User otherUser = userRepository.findById(otherUserId).orElse(null);
                        if (user == null || otherUser == null)
                            continue;

                        Optional<Follow> followOpt = followRepository.findByFollowerAndFollowing(user, otherUser);
                        Optional<Follow> reverseFollowOpt = followRepository.findByFollowerAndFollowing(otherUser,
                                user);

                        boolean isFriend = followOpt.map(Follow::getFriend).orElse(false)
                                && reverseFollowOpt.map(Follow::getFriend).orElse(false);
                        boolean isBlocking = followOpt.map(Follow::isBlocking).orElse(false)
                                || reverseFollowOpt.map(Follow::isBlocking).orElse(false);

                        if (!isFriend /*|| isBlocking*/) {
                            continue; // Ẩn cuộc trò chuyện nếu không còn là bạn bè
                        }
                    }
                }
            }
            ConversationDTO dto = convertToDTO(conversation, userId);
            List<ConversationParticipant> participants = participantRepository
                    .findByConversationId(conversation.getId());
            List<ParticipantDTO> participantDTOs = participants.stream()
                    .map(this::convertToParticipantDTO)
                    .collect(Collectors.toList());
            dto.setParticipants(participantDTOs);

            result.add(dto);
        }

        return result;
    }

    /**
     * Lấy tin nhắn của một cuộc trò chuyện theo trang
     */
    public List<MessageResponseDTO> getMessagesPaginated(Long conversationId, Long userId, int page, int size)
            throws IdInvalidException {
        if (!conversationRepository.existsById(conversationId)) {
            throw new IdInvalidException("Cuộc trò chuyện không tồn tại");
        }

        if (!userRepository.existsById(userId)) {
            throw new IdInvalidException("Người dùng không tồn tại");
        }
        if (!participantRepository.existsByConversationIdAndUserId(conversationId, userId)) {
            throw new IdInvalidException("Người dùng không trong cuộc trò chuyện này");
        }

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IdInvalidException("Conversation not found"));
        // Chỉ kiểm tra với chat 1-1
        if (Boolean.FALSE.equals(conversation.getIsGroupChat())) {
            List<ConversationParticipant> participants = participantRepository.findByConversationId(conversationId);
            if (participants.size() == 2) {
                Long otherUserId = participants.stream()
                        .map(cp -> cp.getUser().getId())
                        .filter(id -> !id.equals(userId))
                        .findFirst().orElse(null);

                if (otherUserId != null) {
                    User user = userRepository.findById(userId).orElse(null);
                    User otherUser = userRepository.findById(otherUserId).orElse(null);
                    if (user == null || otherUser == null)
                        throw new IdInvalidException("User not found");

                    Optional<Follow> followOpt = followRepository.findByFollowerAndFollowing(user, otherUser);
                    Optional<Follow> reverseFollowOpt = followRepository.findByFollowerAndFollowing(otherUser, user);

                    boolean isFriend = followOpt.map(Follow::getFriend).orElse(false)
                            && reverseFollowOpt.map(Follow::getFriend).orElse(false);
                    boolean isBlocking = followOpt.map(Follow::isBlocking).orElse(false)
                            || reverseFollowOpt.map(Follow::isBlocking).orElse(false);


                    if (!isFriend) {
                        throw new IdInvalidException("Hai người không còn là bạn bè, không thể xem tin nhắn");
                    }
                }
            }
        }

        Pageable pageable = PageRequest.of(page, size);
        List<Message> messages = messageRepository.findByConversationIdWithPagination(conversationId, pageable);

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
    private ConversationDTO convertToConversationDTO(Conversation conversation,
            Long currentUserId) {
        ConversationDTO dto = new ConversationDTO();
        dto.setId(conversation.getId());
        dto.setName(conversation.getName());
        dto.setIsGroupChat(conversation.getIsGroupChat());
        dto.setCreatedAt(conversation.getCreatedAt());
        dto.setUpdatedAt(conversation.getUpdatedAt());

        List<ConversationParticipant> participants = participantRepository.findByConversationId(conversation.getId());
        List<ParticipantDTO> participantDTOs = participants.stream()
                .map(this::convertToParticipantDTO)
                .collect(Collectors.toList());
        dto.setParticipants(participantDTOs);

        Pageable pageable = PageRequest.of(0, 1);
        List<Message> lastMessages = messageRepository.findByConversationIdWithPagination(conversation.getId(),
                pageable);

        if (!lastMessages.isEmpty()) {
            dto.setLastMessage(messageService.convertToMessageResponseDTO(lastMessages.get(0)));
        }

        Long unreadCount = messageRepository.countUnreadMessagesInConversation(conversation.getId(),
                currentUserId);
        dto.setUnreadCount(unreadCount);

        return dto;
    }

    /**
     * Chuyển đổi từ ConversationParticipant sang ParticipantDTO
     */
    private ParticipantDTO convertToParticipantDTO(ConversationParticipant participant) {
        ParticipantDTO dto = new ParticipantDTO();
        dto.setId(participant.getId());
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
        if (dto.getParticipants() == null) {
            dto.setParticipants(new ArrayList<>());
        }
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

    private ConversationDTO convertToDTO(Conversation conversation, Long userId) {
        ConversationDTO dto = new ConversationDTO();
        dto.setId(conversation.getId());
        dto.setName(conversation.getName());
        dto.setIsGroupChat(conversation.getIsGroupChat());
        dto.setCreatedAt(conversation.getCreatedAt());
        dto.setUpdatedAt(conversation.getUpdatedAt());
        return dto;
    }

    public List<User> getUsersWithConversation(Long userId) {
        // 1. Lấy tất cả conversation của user hiện tại
        List<ConversationParticipant> participations = participantRepository.findByUserId(userId);

        // 2. Lấy tất cả conversationId
        List<Long> conversationIds = participations.stream()
                .map(p -> p.getConversation().getId())
                .collect(Collectors.toList());

        // 3. Lấy danh sách các participant khác trong các conversation này
        List<User> users = new ArrayList<>();
        for (Long convId : conversationIds) {
            Conversation conv = conversationRepository.findById(convId).orElse(null);
            if (conv == null || conv.getIsGroupChat())
                continue; // Bỏ qua group chat

            List<ConversationParticipant> others = participantRepository.findByConversationId(convId)
                    .stream()
                    .filter(p -> !p.getUser().getId().equals(userId))
                    .collect(Collectors.toList());

            for (ConversationParticipant other : others) {
                User otherUser = other.getUser();

                // Kiểm tra block
                Optional<Follow> followOpt = followRepository.findByFollowerAndFollowing(
                        userRepository.findById(userId).get(), otherUser);
                Optional<Follow> reverseFollowOpt = followRepository.findByFollowerAndFollowing(
                        otherUser, userRepository.findById(userId).get());

                boolean isBlocking = followOpt.map(Follow::isBlocking).orElse(false) ||
                        reverseFollowOpt.map(Follow::isBlocking).orElse(false);

                if (!isBlocking) {
                    users.add(otherUser);
                }
            }
        }

        return users.stream().distinct().collect(Collectors.toList());
    }

    public Conversation createGroupConversation(String groupName, List<Long> userIds) throws IdInvalidException {
        if (userIds == null || userIds.size() < 2) {
            throw new IdInvalidException("at least 2 mems");
        }
        Conversation group = new Conversation();
        group.setName(groupName);
        group.setIsGroupChat(true);
        Conversation savedGroup = conversationRepository.save(group);

        for (Long userId : userIds) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IdInvalidException("not found: " + userId));
            addUserToConversation(savedGroup, user);
        }
        savedGroup.setParticipants(participantRepository.findByConversationId(savedGroup.getId()));
        return savedGroup;
    }

    /**
     * Cập nhật tên cuộc trò chuyện
     */
    @Transactional
    public ConversationDTO updateConversationName(Long conversationId, String newName, Long userId)
            throws IdInvalidException {
        // Kiểm tra conversation có tồn tại không
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IdInvalidException("Cuộc trò chuyện không tồn tại"));

        // Kiểm tra người dùng có trong cuộc trò chuyện không
        if (!participantRepository.existsByConversationIdAndUserId(conversationId, userId)) {
            throw new IdInvalidException("Người dùng không trong cuộc trò chuyện này");
        }

        // Kiểm tra xem có phải là group chat không
        if (!conversation.getIsGroupChat()) {
            throw new IdInvalidException("Chỉ có thể đổi tên cuộc trò chuyện nhóm");
        }

        // Cập nhật tên
        conversation.setName(newName);
        Conversation savedConversation = conversationRepository.save(conversation);

        // Trả về DTO
        return convertToDTO(savedConversation, userId);
    }

    /**
     * Thêm thành viên mới vào cuộc trò chuyện nhóm
     */
    @Transactional
    public ConversationDTO addMemberToConversation(Long conversationId, Long userId, Long addedByUserId)
            throws IdInvalidException {
        // Kiểm tra conversation có tồn tại không
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IdInvalidException("Cuộc trò chuyện không tồn tại"));

        // Kiểm tra xem có phải là group chat không
        if (!conversation.getIsGroupChat()) {
            throw new IdInvalidException("Chỉ có thể thêm thành viên vào nhóm chat");
        }

        // Kiểm tra người thêm có trong nhóm không
        if (!participantRepository.existsByConversationIdAndUserId(conversationId, addedByUserId)) {
            throw new IdInvalidException("Người thêm không có trong nhóm chat");
        }

        // Kiểm tra người được thêm đã có trong nhóm chưa
        if (participantRepository.existsByConversationIdAndUserId(conversationId, userId)) {
            throw new IdInvalidException("Người dùng đã có trong nhóm chat");
        }

        // Thêm người dùng mới
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IdInvalidException("Người dùng không tồn tại"));
        addUserToConversation(conversation, user);

        // Thông báo cho các thành viên trong nhóm
        try {
            // Lấy thông tin người thêm
            User adder = userRepository.findById(addedByUserId).orElse(null);

            // Lấy danh sách người nhận thông báo
            List<User> recipients = participantRepository.findByConversationId(conversationId)
                    .stream()
                    .map(ConversationParticipant::getUser)
                    .collect(Collectors.toList());

            // Tạo nội dung thông báo
            String notificationContent = adder.getUserFullname() + " đã thêm " + user.getUserFullname() + " vào nhóm";

            // Gửi thông báo qua WebSocket (nếu có)
        } catch (Exception e) {
            // Xử lý lỗi khi gửi thông báo
        }

        // Trả về DTO cập nhật
        return convertToDTO(conversation, addedByUserId);
    }

    /**
     * Xóa thành viên ra khỏi nhóm chat
     */
    @Transactional
    public ConversationDTO removeParticipant(Long conversationId, Long userId, Long removerId)
            throws IdInvalidException {
        // Kiểm tra conversation có tồn tại không
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IdInvalidException("Cuộc trò chuyện không tồn tại"));

        // Kiểm tra xem có phải là group chat không
        if (!conversation.getIsGroupChat()) {
            throw new IdInvalidException("Chỉ có thể xóa thành viên khỏi nhóm chat");
        }

        // Kiểm tra người xóa có trong nhóm không
        if (!participantRepository.existsByConversationIdAndUserId(conversationId, removerId)) {
            throw new IdInvalidException("Người xóa không có trong nhóm chat");
        }

        // Tìm người bị xóa
        ConversationParticipant participant = participantRepository
                .findByConversationIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new IdInvalidException("Người dùng không trong nhóm chat"));

        // Xóa người dùng
        participantRepository.delete(participant);

        // Thông báo cho các thành viên còn lại
        try {
            // Lấy thông tin người xóa và người bị xóa
            User remover = userRepository.findById(removerId).orElse(null);
            User removed = userRepository.findById(userId).orElse(null);

            // Lấy danh sách người nhận thông báo
            List<User> recipients = participantRepository.findByConversationId(conversationId)
                    .stream()
                    .map(ConversationParticipant::getUser)
                    .collect(Collectors.toList());

            // Tạo nội dung thông báo
            String notificationContent = remover.getUserFullname() + " đã xóa " +
                    removed.getUserFullname() + " khỏi nhóm";

            // Gửi thông báo qua WebSocket (nếu có)
        } catch (Exception e) {
            // Xử lý lỗi khi gửi thông báo
        }

        // Trả về DTO cập nhật
        return convertToDTO(conversation, removerId);
    }

    /**
     * Rời khỏi nhóm chat
     */
    @Transactional
    public void leaveConversation(Long conversationId, Long userId) throws IdInvalidException {
        // Kiểm tra conversation có tồn tại không
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IdInvalidException("Cuộc trò chuyện không tồn tại"));

        // Kiểm tra người dùng có trong nhóm không
        ConversationParticipant participant = participantRepository
                .findByConversationIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new IdInvalidException("Người dùng không trong nhóm chat"));

        // Xóa người dùng khỏi nhóm
        participantRepository.delete(participant);

        // Thông báo cho các thành viên còn lại
        try {
            // Lấy thông tin người rời nhóm
            User user = userRepository.findById(userId).orElse(null);

            // Lấy danh sách người nhận thông báo
            List<User> recipients = participantRepository.findByConversationId(conversationId)
                    .stream()
                    .map(ConversationParticipant::getUser)
                    .collect(Collectors.toList());

            String notificationContent = user.getUserFullname() + " đã rời khỏi nhóm";

            // Gửi thông báo qua WebSocket (nếu có)
        } catch (Exception e) {
        }
    }

    /**
     * Kiểm tra trạng thái block giữa 2 người dùng
     */
    public boolean checkBlockStatus(Long userId, Long otherUserId) {
        User user = userRepository.findById(userId).orElse(null);
        User otherUser = userRepository.findById(otherUserId).orElse(null);

        if (user == null || otherUser == null) {
            return false;
        }

        Optional<Follow> followOpt = followRepository.findByFollowerAndFollowing(user, otherUser);
        Optional<Follow> reverseFollowOpt = followRepository.findByFollowerAndFollowing(otherUser, user);

        boolean isBlocking = followOpt.map(Follow::isBlocking).orElse(false) ||
                reverseFollowOpt.map(Follow::isBlocking).orElse(false);

        return isBlocking;
    }

    /**
     * Lấy thông tin người sở hữu nhóm chat (người tạo nhóm chat)
     */
    public UserStatsDTO getConversationOwner(Long conversationId) throws IdInvalidException {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IdInvalidException("Cuộc trò chuyện không tồn tại"));

        if (!conversation.getIsGroupChat()) {
            throw new IdInvalidException("Đây không phải là nhóm chat");
        }

        List<ConversationParticipant> participants = participantRepository.findByConversationId(conversationId);
        if (participants.isEmpty()) {
            throw new IdInvalidException("Nhóm chat không có thành viên nào");
        }

        ConversationParticipant owner = participants.stream()
                .min(Comparator.comparing(p -> p.getId()))
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy chủ nhóm"));

        User user = owner.getUser();
        UserStatsDTO userDTO = new UserStatsDTO(user, 0L, 0L, 0L);
        return userDTO;
    }

}