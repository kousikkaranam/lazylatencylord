package com.lazylatencylord.ai.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GroqResponse(List<Choice> choices) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Choice(Message message) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Message(String role, String content) {}

    public String firstContent() {
        if (choices != null && !choices.isEmpty()) {
            Message msg = choices.getFirst().message();
            if (msg != null && msg.content() != null && !msg.content().isBlank()) {
                return msg.content().trim();
            }
        }
        return null;
    }
}
