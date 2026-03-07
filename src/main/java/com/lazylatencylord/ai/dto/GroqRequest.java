package com.lazylatencylord.ai.dto;

import java.util.List;

public record GroqRequest(
        String model,
        List<Message> messages,
        double temperature
) {
    public record Message(String role, String content) {}

    public static GroqRequest of(String model, String prompt) {
        return new GroqRequest(model, List.of(new Message("user", prompt)), 0.7);
    }
}
