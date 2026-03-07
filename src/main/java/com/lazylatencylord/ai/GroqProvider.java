package com.lazylatencylord.ai;

import com.lazylatencylord.ai.dto.GroqRequest;
import com.lazylatencylord.ai.dto.GroqResponse;
import com.lazylatencylord.exception.AiProviderException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

@Slf4j
public class GroqProvider implements AiProvider {

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String model;

    public GroqProvider(String apiKey, String model, RestTemplate restTemplate) {
        this.apiKey = apiKey;
        this.model = model;
        this.restTemplate = restTemplate;
    }

    @Override
    public String generate(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        GroqRequest request = GroqRequest.of(model, prompt);
        HttpEntity<GroqRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<GroqResponse> response = restTemplate.exchange(
                GROQ_URL, HttpMethod.POST, entity, GroqResponse.class);

        if (response.getBody() != null) {
            String content = response.getBody().firstContent();
            if (content != null) {
                return content;
            }
        }
        throw new AiProviderException("Empty response from Groq");
    }

    @Override
    public String name() {
        return "groq";
    }
}
