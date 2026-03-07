package com.lazylatencylord.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record AdaptSentenceRequest(
        @NotBlank String topic,
        @NotBlank String typedSoFar,
        @NotBlank String remainingText,
        @Min(0) double currentWpm,
        @Min(0) double currentAccuracy,
        @Min(0) double expectedWpm,
        @Min(0) double expectedAccuracy
) {}
