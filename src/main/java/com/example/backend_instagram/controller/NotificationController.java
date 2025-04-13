package com.example.backend_instagram.controller;

import com.example.backend_instagram.entity.Notification;
import com.example.backend_instagram.entity.User;
import com.example.backend_instagram.service.NotificationService;
import com.example.backend_instagram.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notification")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    // GET ALL NOTIFICATIONS (optional, useful for admin or debug)
    @GetMapping("/all")
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    // GET NOTIFICATIONS BY USER ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotificationsByUserId(@PathVariable Long userId) {
        User user = userService.fetchUserById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(notificationService.getNoticationByUserId(user));
    }

    // CREATE NEW NOTIFICATION (optional)
    @PostMapping("/create")
    public ResponseEntity<String> createNotification(
            @RequestParam Long userId,
            @RequestParam String content) {

        User user = userService.fetchUserById(userId);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        notificationService.createNotification(user, content);
        return ResponseEntity.ok("Notification created successfully");
    }
}
