package com.example.backend_instagram.controller;

import com.example.backend_instagram.dto.follow.FollowResponseDTO;
import com.example.backend_instagram.entity.Follow;
import com.example.backend_instagram.entity.User;
import com.example.backend_instagram.service.FollowService;
import com.example.backend_instagram.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/follow")
public class FollowController {

    @Autowired
    private FollowService followService;

    @Autowired
    private UserService userService;

    @GetMapping("/all")
    public ResponseEntity<List<Follow>> getFollow() {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(this.followService.getAllPairOfFollow());
    }

    @GetMapping("/followers/{userId}")
    public List<Follow> getFollowers(@PathVariable Long userId) {
        return followService.getFollowersOfUser(userId);
    }

    @GetMapping("/following/{userId}")
    public List<Follow> getFollowing(@PathVariable Long userId) {
        return followService.getFollowingOfUser(userId);
    }

    @GetMapping("/following/users/{userId}")
    public ResponseEntity<List<User>> getFollowingUsers(@PathVariable Long userId) {
        List<Follow> follows = followService.getFollowingOfUser(userId);
        List<User> followingUsers = follows.stream()
            .map(Follow::getFollowing)
            .toList();
        return ResponseEntity.ok(followingUsers);
    }

    @PostMapping("/create")
    public ResponseEntity<FollowResponseDTO> followUser(@RequestParam Long followerId, @RequestParam Long followingId) {
        User follower = userService.fetchUserById(followerId);
        User following = userService.fetchUserById(followingId);

        FollowResponseDTO response = followService.createFollow(follower, following);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/unfollow")
    public ResponseEntity<Void> unfollowUser(@RequestParam Long followerId, @RequestParam Long followingId) {
        User follower = userService.fetchUserById(followerId);
        User following = userService.fetchUserById(followingId);
        followService.unfollow(follower, following);
        return ResponseEntity.noContent().build(); // HTTP 204
    }



    @GetMapping("/following/count/{userId}")
    public ResponseEntity<Long> countFollowing(@PathVariable Long userId) {
        Long count = followService.countFollowingOfUser(userId);
        return ResponseEntity.ok(count);
    }

}
