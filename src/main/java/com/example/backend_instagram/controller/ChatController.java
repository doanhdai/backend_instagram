package com.example.backend_instagram.controller;

import com.example.backend_instagram.service.GeminiChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    @Autowired
    private GeminiChatService geminiChatService;

    @PostMapping
    public String sendMessage(@RequestBody String prompt) throws Exception {
        return geminiChatService.getGeminiResponse(prompt);
    }
}