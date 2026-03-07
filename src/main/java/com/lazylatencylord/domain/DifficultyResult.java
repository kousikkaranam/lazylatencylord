package com.lazylatencylord.domain;

public record DifficultyResult(
        double smoothedScore,
        int difficulty,
        String label
) {}
