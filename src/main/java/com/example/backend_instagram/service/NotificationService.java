package com.example.backend_instagram.service;

import com.corundumstudio.socketio.SocketIOServer;
import com.example.backend_instagram.dto.notification.NotificationDTO;
import com.example.backend_instagram.entity.Notification;
import com.example.backend_instagram.entity.NotificationType;
import com.example.backend_instagram.entity.Post;
import com.example.backend_instagram.entity.User;
import com.example.backend_instagram.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final SocketIOServer socketIOServer;
    private final UserService userService;
    private final PostService postService;

    public NotificationService(NotificationRepository notificationRepository,
            SocketIOServer socketIOServer,
            UserService userService,
            PostService postService) {
        this.notificationRepository = notificationRepository;
        this.socketIOServer = socketIOServer;
        this.userService = userService;
        this.postService = postService;
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public List<NotificationDTO> getNotificationsByUserId(Long userId) {
        User user = userService.fetchUserById(userId);
        if (user == null) {
            throw new IllegalArgumentException("Người dùng không tồn tại");
        }
        return notificationRepository.findByUserOrderBySentAtDesc(user)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnreadNotificationsByUserId(Long userId) {
        User user = userService.fetchUserById(userId);
        if (user == null) {
            throw new IllegalArgumentException("Người dùng không tồn tại");
        }
        return notificationRepository.findByUserAndIsReadFalseOrderBySentAtDesc(user)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Thông báo không tồn tại"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void createLikeNotification(Long postId, Long actorId) {
        try {
            Post post = postService.getPostById(postId);
            User actor = userService.fetchUserById(actorId);
            User receiver = post.getUser();

            if (!receiver.getId().equals(actorId)) {
                String message = actor.getUserNickname() + " đã thích bài viết của bạn";
                Notification notification = new Notification(receiver, actor, post, NotificationType.LIKE, message);
                notificationRepository.save(notification);
                sendNotificationToUser(receiver.getId(), toDTO(notification));
                logger.info("Thông báo thích được tạo cho người dùng: {}, bài viết: {}", receiver.getId(), postId);
            }
        } catch (Exception e) {
            logger.error("Lỗi khi tạo thông báo thích: {}", e.getMessage());
        }
    }

    public void createCommentNotification(Long postId, Long actorId, String commentContent) {
        try {
            Post post = postService.getPostById(postId);
            User actor = userService.fetchUserById(actorId);
            User receiver = post.getUser();

            if (!receiver.getId().equals(actorId)) {
                String message = actor.getUserNickname() + " đã bình luận: " + truncateComment(commentContent, 50);
                Notification notification = new Notification(receiver, actor, post, NotificationType.COMMENT, message);
                notificationRepository.save(notification);
                sendNotificationToUser(receiver.getId(), toDTO(notification));
                logger.info("Thông báo bình luận được tạo cho người dùng: {}, bài viết: {}", receiver.getId(), postId);
            }
        } catch (Exception e) {
            logger.error("Lỗi khi tạo thông báo bình luận: {}", e.getMessage());
        }
    }

    private void sendNotificationToUser(Long userId, NotificationDTO notificationDTO) {
        socketIOServer.getBroadcastOperations()
                .getClients()
                .stream()
                .filter(client -> userId.toString().equals(client.getHandshakeData().getSingleUrlParam("userId")))
                .forEach(client -> {
                    client.sendEvent("notification", notificationDTO);
                    logger.info("Gửi thông báo đến người dùng: {}, nội dung: {}", userId, notificationDTO.getMessage());
                });
    }

    private NotificationDTO toDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setNotificationId(notification.getNotificationId());
        dto.setUserId(notification.getUser().getId());
        dto.setActorId(notification.getActor().getId());
        dto.setActorNickname(notification.getActor().getUserNickname());
        dto.setPostId(notification.getPost().getId());
        dto.setType(notification.getType().name());
        dto.setMessage(notification.getMessage());
        dto.setRead(notification.isRead());
        dto.setSentAt(notification.getSentAt());
        return dto;
    }

    private String truncateComment(String comment, int maxLength) {
        if (comment == null || comment.length() <= maxLength) {
            return comment;
        }
        return comment.substring(0, maxLength - 3) + "...";
    }
}