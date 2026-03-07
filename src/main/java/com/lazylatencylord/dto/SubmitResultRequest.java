package com.lazylatencylord.dto;

public record SubmitResultRequest(
        String sessionId,
        String topic,
        double wpm,
        double accuracy,
        double errorRate,
        double hesitationMs
) {}
