package com.example.backend_instagram.service;

import com.example.backend_instagram.dto.follow.FollowResponseDTO;
import com.example.backend_instagram.entity.*;
import com.example.backend_instagram.repository.FollowRepository;
import com.example.backend_instagram.repository.NotificationRepository;
import com.example.backend_instagram.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FollowService {
    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    // Lấy tất cả cặp follow
    public List<Follow> getAllPairOfFollow() {
        return followRepository.findAll();
    }

    // Lấy danh sách follower (người đang theo dõi currUser)
    public List<Follow> getFollowersOfUser(Long userId) {
        return followRepository.findByFollowingId(userId);
    }

    // Lấy danh sách following (người mà currUser đang theo dõi)
    public List<Follow> getFollowingOfUser(Long userId) {
        return followRepository.findByFollowerId(userId);
    }


    public FollowResponseDTO createFollow(User currUser, User followedUser) {
        Follow follow = new Follow();
        follow.setId(new FollowId(currUser.getId(), followedUser.getId()));
        follow.setFollower(currUser);
        follow.setFollowing(followedUser);
        follow.setCreatedAt(LocalDateTime.now());
        follow.setBlocking(false);
        follow.setFriend(false);

        Optional<Follow> reverseFollow = followRepository.findByFollowerAndFollowing(followedUser, currUser);
        if (reverseFollow.isPresent()) {
            Follow reverse = reverseFollow.get();
            reverse.setFriend(true);
            follow.setFriend(true);
            followRepository.save(reverse);
        }

        Follow savedFollow = followRepository.save(follow);

        // Tạo notification
//        Notification notification = new Notification();
//        // notification.setContent(currUser.getUserNickname() + " has followed you.");
//        // notification.setUserId(followedUser);
//        notification.setType(NotificationType.FOLLOW);
//        notification.setPost(0);
//        notification.setActor(0);
//        notification.setSentAt(LocalDateTime.now());
//        notification.setRead(false);
//        Notification savedNotification = notificationRepository.save(notification);

        // Trả về DTO
        return new FollowResponseDTO(savedFollow);
    }


    public void unfollow(User currUser, User followedUser) {
        // Tìm bản ghi follow từ currUser đến followedUser
        Follow follow = followRepository.findByFollowerAndFollowing(currUser, followedUser)
                .orElseThrow(() -> new RuntimeException("Follow relationship does not exist"));

        // Kiểm tra chiều ngược lại, nếu tồn tại thì cũng set friend = false
        Optional<Follow> reverseFollowOpt = followRepository.findByFollowerAndFollowing(followedUser, currUser);
        reverseFollowOpt.ifPresent(reverseFollow -> {
            reverseFollow.setFriend(false);
            followRepository.save(reverseFollow);
        });

        followRepository.delete(follow);
    } 
    public void QualityFollow(Long userId) {
        List<Follow> followers = followRepository.findByFollowingId(userId);
        
    }
     


}
