package com.lazylatencylord.dto;

public record TopicSessionResponse(
        String sessionId,
        String topic,
        int difficulty,
        String difficultyLabel,
        String sentence
) {}
