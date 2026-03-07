package com.lazylatencylord.domain;

import java.time.Instant;

public record SessionState(
        String sessionId,
        String topic,
        double smoothedScore,
        int difficulty,
        String difficultyLabel,
        Instant createdAt
) {
    public static SessionState create(String sessionId, String topic, int difficulty, String label) {
        return new SessionState(sessionId, topic, 50.0, difficulty, label, Instant.now());
    }

    public SessionState withDifficulty(double smoothedScore, int difficulty, String label) {
        return new SessionState(sessionId, topic, smoothedScore, difficulty, label, createdAt);
    }
}
