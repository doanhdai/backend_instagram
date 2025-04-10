package com.example.backend_instagram.service;

import com.example.backend_instagram.entity.Follow;
import com.example.backend_instagram.entity.User;
import com.example.backend_instagram.repository.FollowRepository;
import com.example.backend_instagram.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FollowService {

    @Autowired
    private FollowRepository followRepository;

    // Lấy tất cả cặp follow
    public List<Follow> getAllPairOfFollow() {
        return followRepository.findAll();
    }

    // Lấy danh sách follower (người đang theo dõi userId)
    public List<Follow> getFollowersOfUser(Long userId) {
        return followRepository.findByFollowingId(userId);
    }

    // Lấy danh sách following (người mà userId đang theo dõi)
    public List<Follow> getFollowingOfUser(Long userId) {
        return followRepository.findByFollowerId(userId);
    }
}
