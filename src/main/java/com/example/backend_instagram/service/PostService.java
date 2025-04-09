package com.example.backend_instagram.service;

import com.example.backend_instagram.dto.post.CreatePostRequest;
import com.example.backend_instagram.entity.Media;
import com.example.backend_instagram.entity.Post;
import com.example.backend_instagram.entity.User;
import com.example.backend_instagram.repository.MediaRepository;
import com.example.backend_instagram.repository.PostRepository;
import com.example.backend_instagram.repository.UserRepository;
import com.example.backend_instagram.utils.AwsS3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MediaRepository mediaRepository;

    @Autowired
    private AwsS3Service awsS3Service;

    @Transactional
    public Post createPost(Long userId, CreatePostRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create and save post first
        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setUser(user);
        post.setStatus(request.getStatus());
        post.setAccess(request.getAccess());
        post.setLikesCount(0);
        post = postRepository.save(post);

        List<Media> mediaList = new ArrayList<>();

        // Then process and save media
        for (MultipartFile file : request.getMedia()) {
            try {
                // Get file extension
                String originalFilename = file.getOriginalFilename();
                String extension = originalFilename.substring(originalFilename.lastIndexOf("."));

                // Determine media type based on content type
                String mediaType = file.getContentType().startsWith("image/") ? "IMAGE" : "VIDEO";

                // Generate unique filename
                String fileName = System.currentTimeMillis() + "_" + mediaType.toLowerCase() + extension;

                // Upload to S3
                String url = awsS3Service.uploadFile(fileName, file.getBytes());

                // Create and save media
                Media media = new Media();
                media.setUrl(url);
                media.setType(mediaType);
                media.setPost(post); // Set the post reference
                media = mediaRepository.save(media);

                mediaList.add(media);
            } catch (IOException e) {
                throw new RuntimeException("Failed to process file: " + e.getMessage());
            }
        }

        // Update post with media list
        post.setMedia(mediaList);
        return postRepository.save(post);
    }

    public List<Post> getAllPostsByUserId(Long userId) {
        return postRepository.findByUserIdAndStatus(userId, "True");
    }

    public List<Post> getAllPosts() {
        return postRepository.findByStatus("True");
    }

    @Transactional
    public Post updatePost(Long postId, CreatePostRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Update basic post information
        post.setTitle(request.getTitle());
        post.setStatus(request.getStatus());
        post.setAccess(request.getAccess());

        // If there are new media files
        if (request.getMedia() != null && !request.getMedia().isEmpty()) {
            // Delete old media files from S3
            for (Media oldMedia : post.getMedia()) {
                // You might want to add a method in AwsS3Service to delete files
                // awsS3Service.deleteFile(oldMedia.getUrl());
            }
            post.getMedia().clear();

            // Process and save new media files
            List<Media> mediaList = new ArrayList<>();
            for (MultipartFile file : request.getMedia()) {
                try {
                    String originalFilename = file.getOriginalFilename();
                    String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                    String mediaType = file.getContentType().startsWith("image/") ? "IMAGE" : "VIDEO";
                    String fileName = System.currentTimeMillis() + "_" + mediaType.toLowerCase() + extension;
                    String url = awsS3Service.uploadFile(fileName, file.getBytes());

                    Media media = new Media();
                    media.setUrl(url);
                    media.setType(mediaType);
                    media.setPost(post);
                    media = mediaRepository.save(media);
                    mediaList.add(media);
                } catch (IOException e) {
                    throw new RuntimeException("Failed to process file: " + e.getMessage());
                }
            }
            post.setMedia(mediaList);
        }

        return postRepository.save(post);
    }

    @Transactional
    public void deletePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setStatus("false");
        postRepository.save(post);
    }
}