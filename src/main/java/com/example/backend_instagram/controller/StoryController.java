package com.example.backend_instagram.controller;

import com.example.backend_instagram.entity.Story;
import com.example.backend_instagram.service.StoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stories")
public class StoryController {
    @Autowired
    private StoryService storyService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Story> createStory(
            @RequestParam("userId") Long userId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("access") String access,
            @RequestParam("status") Integer status) {

        Story story = storyService.createStory(userId, file, access, status);
        return ResponseEntity.ok(story);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Story>> getStoriesByUserId(@PathVariable Long userId) {
        List<Story> stories = storyService.getStoriesByUserId(userId);
        return ResponseEntity.ok(stories);
    }

    @GetMapping
    public ResponseEntity<List<Story>> getAllStories() {
        List<Story> stories = storyService.getAllStories();
        return ResponseEntity.ok(stories);
    }

    @DeleteMapping("/{storyId}")
    public ResponseEntity<Void> deleteStory(@PathVariable Long storyId) {
        storyService.deleteStory(storyId);
        return ResponseEntity.ok().build();
    }
}