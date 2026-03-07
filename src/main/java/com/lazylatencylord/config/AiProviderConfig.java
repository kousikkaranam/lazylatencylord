package com.lazylatencylord.config;

import com.lazylatencylord.ai.AiProvider;
import com.lazylatencylord.ai.GeminiProvider;
import com.lazylatencylord.ai.GroqProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Configuration
public class AiProviderConfig {

    @Bean("geminiProvider")
    @ConditionalOnExpression("!'${google.ai.api.key:}'.isEmpty()")
    public AiProvider geminiProvider(
            @Value("${google.ai.api.key}") String apiKey,
            @Value("${ai.gemini.model}") String model) {
        log.info("Gemini provider initialized (model: {})", model);
        return new GeminiProvider(apiKey, model);
    }

    @Bean("groqProvider")
    @ConditionalOnExpression("!'${groq.api.key:}'.isEmpty()")
    public AiProvider groqProvider(
            @Value("${groq.api.key}") String apiKey,
            @Value("${ai.groq.model}") String model,
            RestTemplate restTemplate) {
        log.info("Groq provider initialized (model: {})", model);
        return new GroqProvider(apiKey, model, restTemplate);
    }
}
