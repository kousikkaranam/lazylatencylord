package com.lazylatencylord.service;

import com.lazylatencylord.ai.AiProvider;
import com.lazylatencylord.ai.GeminiProvider;
import com.lazylatencylord.ai.GroqProvider;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class AiCompletionService {

    @Value("${google.ai.api.key:}")
    private String geminiApiKey;

    @Value("${groq.api.key:}")
    private String groqApiKey;

    @Value("${ai.provider:gemini}")
    private String activeProvider;

    @Value("${ai.gemini.model:gemini-2.0-flash-lite}")
    private String geminiModel;

    @Value("${ai.groq.model:llama-3.1-8b-instant}")
    private String groqModel;

    private AiProvider geminiProvider;
    private AiProvider groqProvider;

    @PostConstruct
    private void init() {
        if (!geminiApiKey.isBlank()) {
            geminiProvider = new GeminiProvider(geminiApiKey, geminiModel);
            log.info("Gemini provider initialized (model: {})", geminiModel);
        }
        if (!groqApiKey.isBlank()) {
            groqProvider = new GroqProvider(groqApiKey, groqModel);
            log.info("Groq provider initialized (model: {})", groqModel);
        }
        log.info("Active AI provider: {}", activeProvider);
    }

    public void switchProvider(String provider) {
        if ("gemini".equalsIgnoreCase(provider) && geminiProvider != null) {
            this.activeProvider = "gemini";
        } else if ("groq".equalsIgnoreCase(provider) && groqProvider != null) {
            this.activeProvider = "groq";
        } else {
            throw new IllegalArgumentException("Provider not available: " + provider);
        }
        log.info("Switched AI provider to: {}", activeProvider);
    }

    public String getActiveProvider() {
        return activeProvider;
    }

    public String generateSentence(String topic, String difficulty) {
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

    public List<String> generateSentenceBatch(String topic, String difficulty, int count) {
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
        return result.lines()
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                .toList();
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

    public List<String> generateCompletions(String partialText) {
        String prompt = "Complete this sentence: " + partialText + ". Give one short completion.";
        String result = callAi(prompt);
        return List.of(result.trim());
    }

    private String callAi(String prompt) {
        AiProvider primary = getProvider(activeProvider);
        AiProvider fallback = getFallback(activeProvider);

        if (primary != null) {
            try {
                return primary.generate(prompt);
            } catch (Exception e) {
                log.warn("{} failed: {}. Trying fallback...", activeProvider, e.getMessage());
            }
        }

        if (fallback != null) {
            try {
                return fallback.generate(prompt);
            } catch (Exception e) {
                log.error("Fallback also failed: {}", e.getMessage());
            }
        }

        return "The quick brown fox jumps over the lazy dog near the river bank.";
    }

    private AiProvider getProvider(String name) {
        return switch (name.toLowerCase()) {
            case "gemini" -> geminiProvider;
            case "groq" -> groqProvider;
            default -> null;
        };
    }

    private AiProvider getFallback(String activeName) {
        return switch (activeName.toLowerCase()) {
            case "gemini" -> groqProvider;
            case "groq" -> geminiProvider;
            default -> null;
        };
    }
}
