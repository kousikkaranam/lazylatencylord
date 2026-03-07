package com.lazylatencylord.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record SubmitResultRequest(
        @NotBlank(message = "Session ID is required") String sessionId,
        @NotBlank(message = "Topic is required") String topic,
        @Min(0) @Max(300) double wpm,
        @Min(0) @Max(100) double accuracy,
        @Min(0) @Max(1) double errorRate,
        @Min(0) double hesitationMs
) {}
