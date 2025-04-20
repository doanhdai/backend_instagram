
package com.example.backend_instagram.service;

import com.example.backend_instagram.dto.comment.CommentDTO;
import com.example.backend_instagram.entity.Comment;
import com.example.backend_instagram.entity.Post;
import com.example.backend_instagram.entity.User;
import com.example.backend_instagram.repository.CommentRepository;
import com.example.backend_instagram.repository.PostRepository;
import com.corundumstudio.socketio.SocketIOServer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {
    private static final Logger logger = LoggerFactory.getLogger(CommentService.class);

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final SocketIOServer socketIOServer;
    private final ObjectMapper objectMapper;

    public CommentService(CommentRepository commentRepository,
            PostRepository postRepository,
            UserService userService,
            NotificationService notificationService,
            SocketIOServer socketIOServer) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userService = userService;
        this.notificationService = notificationService;
        this.socketIOServer = socketIOServer;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    public void addComment(Long postId, Long userId, String content) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Bài viết không tồn tại"));
        User user = userService.fetchUserById(userId);

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setUser(user);
        comment.setPost(post);
        commentRepository.save(comment);

        // Gửi thông báo bình luận
        notificationService.createCommentNotification(postId, userId, content);

        // Phát sự kiện comment_update tới tất cả client
        try {
            CommentDTO commentDTO = toDTO(comment);
            String json = objectMapper.writeValueAsString(commentDTO);
            logger.debug("CommentDTO JSON: {}", json);
            socketIOServer.getBroadcastOperations().sendEvent("comment_update", json);
            logger.info("Broadcast comment update: postId={}, commentId={}, content={}",
                    postId, commentDTO.getId(), content);
        } catch (Exception e) {
            logger.error("Error broadcasting comment update: {}", e.getMessage(), e);
        }
    }

    public List<CommentDTO> getCommentsByPostId(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Bài viết không tồn tại"));
        return commentRepository.findByPostOrderByCreatedAtDesc(post)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private CommentDTO toDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setUserId(comment.getUser().getId());
        dto.setUserNickname(comment.getUser().getUserNickname());
        dto.setUserImage(comment.getUser().getUserImage());
        dto.setPostId(comment.getPost().getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        return dto;
    }
}
