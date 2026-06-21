package com.heulwen.aiservice.controller;

import com.heulwen.aiservice.api.request.ChatRequest;
import com.heulwen.aiservice.api.response.ChatResponse;
import com.heulwen.aiservice.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final GeminiService geminiService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        String answer = geminiService.generateChatResponse(request.message());
        return ResponseEntity.ok(new ChatResponse(answer));
    }
}
