package com.lazylatencylord.dto;

public record SubmitResultResponse(
        int difficulty,
        String difficultyLabel,
        String nextSentence,
        double wpm,
        double accuracy
) {}
