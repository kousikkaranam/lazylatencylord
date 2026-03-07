package com.lazylatencylord.dto;

public record AdaptSentenceRequest(
        String topic,
        String typedSoFar,
        String remainingText,
        double currentWpm,
        double currentAccuracy,
        double expectedWpm,
        double expectedAccuracy
) {}
