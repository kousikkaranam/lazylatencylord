package com.lazylatencylord.service;

import com.lazylatencylord.ai.AiProvider;
import com.lazylatencylord.exception.AiProviderException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

@Slf4j
@Service
public class AiProviderRouter {

    private final AiProvider geminiProvider;
    private final AiProvider groqProvider;
    private final AiCacheService cacheService;
    private final AtomicReference<String> activeProvider;

    private static final String FALLBACK_SENTENCE =
            "The quick brown fox jumps over the lazy dog near the river bank.";

    public AiProviderRouter(
            @Nullable @Qualifier("geminiProvider") AiProvider geminiProvider,
            @Nullable @Qualifier("groqProvider") AiProvider groqProvider,
            AiCacheService cacheService,
            @Value("${ai.provider:groq}") String defaultProvider) {
        this.geminiProvider = geminiProvider;
        this.groqProvider = groqProvider;
        this.cacheService = cacheService;
        this.activeProvider = new AtomicReference<>(defaultProvider);
        log.info("AI provider router initialized (active: {}, gemini: {}, groq: {})",
                defaultProvider,
                geminiProvider != null ? "available" : "unavailable",
                groqProvider != null ? "available" : "unavailable");
    }

    public String generateSentence(String topic, String difficulty) {
        // Try cache first
        String cached = cacheService.getCachedSentence(topic, difficulty);
        if (cached != null) {
            log.debug("Cache hit for {}:{}", topic, difficulty);
            return cached;
        }

        String prompt = """
                Generate one sentence for typing practice.

                Topic: %s
                Difficulty: %s
                Length: 12-18 words.

                Rules:
                - Clear grammar
                - Educational tone
                - No complex punctuation (no semicolons, colons, or dashes)
                - Return ONLY the sentence, nothing else
                """.formatted(topic, difficulty);

        return callAi(prompt);
    }

    public List<String> generateBatch(String topic, String difficulty, int count) {
        String prompt = """
                Generate %d sentences for typing practice. One sentence per line.

                Topic: %s
                Difficulty: %s
                Length: 12-18 words each.

                Rules:
                - Clear grammar
                - Educational tone
                - No complex punctuation (no semicolons, colons, or dashes)
                - Return ONLY the sentences, one per line, no numbering
                """.formatted(count, topic, difficulty);

        String result = callAi(prompt);
        List<String> sentences = result.lines()
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                .toList();

        // Cache surplus sentences for future use
        if (sentences.size() > 1) {
            cacheService.cacheSentences(topic, difficulty, sentences.subList(1, sentences.size()));
        }

        return sentences;
    }

    public String adaptRemaining(String topic, String typedSoFar, String remainingText, boolean makeEasier) {
        String direction = makeEasier ? "simpler and shorter" : "more complex and challenging";
        String prompt = """
                The user is typing a sentence for practice.
                Topic: %s
                They have already typed: "%s"
                The remaining text was: "%s"

                Generate a new continuation that flows naturally from what they typed.
                Make it %s than the original remaining text.
                Keep it roughly the same length (within 3 words).

                Rules:
                - Must flow grammatically from the typed text
                - No complex punctuation (no semicolons, colons, or dashes)
                - Return ONLY the new continuation, nothing else
                """.formatted(topic, typedSoFar, remainingText, direction);

        return callAi(prompt);
    }

    public String getActiveProvider() {
        return activeProvider.get();
    }

    public void switchProvider(String provider) {
        AiProvider target = getProviderByName(provider);
        if (target == null) {
            throw new AiProviderException("Provider not available: " + provider);
        }
        activeProvider.set(provider.toLowerCase());
        log.info("Switched AI provider to: {}", provider);
    }

    private String callAi(String prompt) {
        AiProvider primary = getProviderByName(activeProvider.get());
        AiProvider fallback = getFallbackProvider();

        if (primary != null) {
            try {
                return primary.generate(prompt);
            } catch (Exception e) {
                log.warn("{} failed: {}. Trying fallback...", activeProvider.get(), e.getMessage());
            }
        }

        if (fallback != null) {
            try {
                return fallback.generate(prompt);
            } catch (Exception e) {
                log.error("Fallback provider also failed: {}", e.getMessage());
            }
        }

        log.error("All AI providers failed, returning fallback sentence");
        return FALLBACK_SENTENCE;
    }

    private AiProvider getProviderByName(String name) {
        return switch (name.toLowerCase()) {
            case "gemini" -> geminiProvider;
            case "groq" -> groqProvider;
            default -> null;
        };
    }

    private AiProvider getFallbackProvider() {
        return switch (activeProvider.get().toLowerCase()) {
            case "gemini" -> groqProvider;
            case "groq" -> geminiProvider;
            default -> null;
        };
    }
}
