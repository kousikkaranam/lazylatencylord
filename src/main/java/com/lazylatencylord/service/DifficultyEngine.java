package com.lazylatencylord.service;

import org.springframework.stereotype.Service;

import java.util.concurrent.ThreadLocalRandom;

@Service
public class DifficultyEngine {

    private double smoothedScore = 50.0;

    public int calculateDifficulty(double wpm, double accuracy, double errorRate, double hesitationMs) {
        double normalizedWpm = Math.min(wpm / 80.0, 1.0) * 100;
        double normalizedHesitation = Math.min(hesitationMs / 2000.0, 1.0) * 100;

        double rawScore =
                (0.45 * normalizedWpm) +
                (0.40 * accuracy) -
                (0.10 * errorRate * 100) -
                (0.05 * normalizedHesitation);

        rawScore = Math.max(0, Math.min(100, rawScore));

        // Exponential moving average for smooth transitions
        smoothedScore = 0.7 * smoothedScore + 0.3 * rawScore;

        int difficulty = mapScoreToDifficulty(smoothedScore);

        // Inject unpredictability: 20% chance harder, 10% chance easier
        double rand = ThreadLocalRandom.current().nextDouble();
        if (rand < 0.20) {
            difficulty = Math.min(5, difficulty + 1);
        } else if (rand < 0.30) {
            difficulty = Math.max(1, difficulty - 1);
        }

        return difficulty;
    }

    public int initialDifficulty() {
        return 2;
    }

    public String difficultyLabel(int level) {
        return switch (level) {
            case 1 -> "beginner";
            case 2 -> "easy";
            case 3 -> "medium";
            case 4 -> "hard";
            case 5 -> "expert";
            default -> "medium";
        };
    }

    private int mapScoreToDifficulty(double score) {
        if (score < 25) return 1;
        if (score < 45) return 2;
        if (score < 65) return 3;
        if (score < 85) return 4;
        return 5;
    }
}
