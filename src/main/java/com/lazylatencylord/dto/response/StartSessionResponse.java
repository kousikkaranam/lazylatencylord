package com.lazylatencylord.dto.response;

public record StartSessionResponse(
        String sessionId,
        String topic,
        int difficulty,
        String difficultyLabel,
        String sentence
) {}
