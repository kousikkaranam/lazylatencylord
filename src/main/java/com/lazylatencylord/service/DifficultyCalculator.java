package com.lazylatencylord.service;

import com.lazylatencylord.domain.DifficultyResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.ThreadLocalRandom;

/**
 * Stateless difficulty calculator. All state (smoothedScore) is passed in and returned out.
 * Safe for concurrent use across all sessions.
 */
@Component
public class DifficultyCalculator {

    private static final double WPM_WEIGHT = 0.45;
    private static final double ACCURACY_WEIGHT = 0.40;
    private static final double ERROR_PENALTY = 0.10;
    private static final double HESITATION_PENALTY = 0.05;
    private static final double EMA_SMOOTHING = 0.3;
    private static final double MAX_WPM_BASELINE = 80.0;
    private static final double MAX_HESITATION_MS = 2000.0;

    public DifficultyResult calculate(double previousSmoothedScore, double wpm,
                                       double accuracy, double errorRate, double hesitationMs) {
        double normalizedWpm = Math.min(wpm / MAX_WPM_BASELINE, 1.0) * 100;
        double normalizedHesitation = Math.min(hesitationMs / MAX_HESITATION_MS, 1.0) * 100;

        double rawScore =
                (WPM_WEIGHT * normalizedWpm) +
                (ACCURACY_WEIGHT * accuracy) -
                (ERROR_PENALTY * errorRate * 100) -
                (HESITATION_PENALTY * normalizedHesitation);

        rawScore = Math.max(0, Math.min(100, rawScore));

        double smoothedScore = (1 - EMA_SMOOTHING) * previousSmoothedScore + EMA_SMOOTHING * rawScore;

        int difficulty = mapScoreToDifficulty(smoothedScore);

        // Inject unpredictability: 20% chance harder, 10% chance easier
        double rand = ThreadLocalRandom.current().nextDouble();
        if (rand < 0.20) {
            difficulty = Math.min(5, difficulty + 1);
        } else if (rand < 0.30) {
            difficulty = Math.max(1, difficulty - 1);
        }

        return new DifficultyResult(smoothedScore, difficulty, difficultyLabel(difficulty));
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
