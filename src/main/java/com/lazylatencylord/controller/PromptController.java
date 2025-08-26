package com.lazylatencylord.controller;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class PromptController {

    @PostMapping("/prompt")
    public Map<String, String> handlePrompt(@RequestBody Map<String, String> payload) {
        String prompt = payload.get("prompt");
        // Implement your logic here. For now, just echo the prompt.
        String reply = "You typed: " + prompt;
        return Map.of("reply", reply);
    }
}