package com.lazylatencylord.dto.request;

import jakarta.validation.constraints.NotBlank;

public record StartSessionRequest(
        @NotBlank(message = "Topic is required") String topic
) {}
