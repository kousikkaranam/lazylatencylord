package com.lazylatencylord.event;

public record SentenceCompletedEvent(
        String sessionId,
        String topic,
        int difficulty,
        double wpm,
        double accuracy,
        double errorRate
) {}
