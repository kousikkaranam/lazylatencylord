package com.lazylatencylord.dto.response;

public record SubmitResultResponse(
        int difficulty,
        String difficultyLabel,
        String nextSentence,
        double wpm,
        double accuracy
) {}
