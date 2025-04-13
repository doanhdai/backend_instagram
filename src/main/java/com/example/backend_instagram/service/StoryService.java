package com.example.backend_instagram.service;

import com.example.backend_instagram.entity.Story;
import com.example.backend_instagram.entity.User;
import com.example.backend_instagram.repository.StoryRepository;
import com.example.backend_instagram.repository.UserRepository;
import com.example.backend_instagram.utils.AwsS3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class StoryService {
    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AwsS3Service awsS3Service;

    @Transactional
    public Story createStory(Long userId, MultipartFile file, String access, Integer status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String fileName = System.currentTimeMillis() + "_story" + extension;

            // Upload to S3
            String url = awsS3Service.uploadFile(fileName, file.getBytes());

            // Create and save story
            Story story = new Story();
            story.setUser(user);
            story.setUrl(url);
            story.setAccess(access);
            story.setStatus(status);

            return storyRepository.save(story);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }

    public List<Story> getStoriesByUserId(Long userId) {
        return storyRepository.findByUserIdAndStatus(userId, 1);
    }

    public List<Story> getAllStories() {
        return storyRepository.findByStatus(1);
    }

    @Transactional
    public void deleteStory(Long storyId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found"));
        story.setStatus(0);
        storyRepository.save(story);
    }

//    @Scheduled(fixedRate = 60000) // Chạy mỗi phút
//    @Transactional
//    public void updateExpiredStories() {
//        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
//        List<Story> expiredStories = storyRepository.findByStatusAndCreatedAtBefore(1, twentyFourHoursAgo);
//
//        for (Story story : expiredStories) {
//            story.setStatus(2);
//            storyRepository.save(story);
//        }
//    }
    // @Scheduled(fixedRate = 60000) // Chạy mỗi phút
    // @Transactional
    // public void updateExpiredStories() {
    //     LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
    //     List<Story> expiredStories = storyRepository.findByStatusAndCreatedAtBefore(1, twentyFourHoursAgo);

    //     for (Story story : expiredStories) {
    //         story.setStatus(2);
    //         storyRepository.save(story);
    //     }
    // }
}