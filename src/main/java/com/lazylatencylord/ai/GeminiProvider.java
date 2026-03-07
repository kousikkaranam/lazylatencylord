package com.lazylatencylord.ai;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.lazylatencylord.exception.AiProviderException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class GeminiProvider implements AiProvider {

    private final Client client;
    private final String model;

    public GeminiProvider(String apiKey, String model) {
        this.client = Client.builder().apiKey(apiKey).build();
        this.model = model;
    }

    @Override
    public String generate(String prompt) {
        GenerateContentResponse response = client.models.generateContent(model, prompt, null);
        String text = response.text();
        if (text != null && !text.isBlank()) {
            return text.trim();
        }
        throw new AiProviderException("Empty response from Gemini");
    }

    @Override
    public String name() {
        return "gemini";
    }
}
