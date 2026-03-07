package com.lazylatencylord.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Slf4j
@Service
@RequiredArgsConstructor
public class TopicService {

    private final AiCompletionService aiService;
    private final DifficultyEngine difficultyEngine;
    private final NewsService newsService;

    public static final List<String> AVAILABLE_TOPICS = List.of(
            "Technology", "Space", "History", "Startups",
            "Philosophy", "Programming", "Science", "News", "Random"
    );

    // Per-session sentence queue: sessionId -> queue of pre-generated sentences
    private final Map<String, ConcurrentLinkedQueue<String>> sentenceQueues = new ConcurrentHashMap<>();

    public String getNextSentence(String sessionKey, String topic, int difficulty) {
        ConcurrentLinkedQueue<String> queue = sentenceQueues.computeIfAbsent(sessionKey, k -> new ConcurrentLinkedQueue<>());

        String sentence = queue.poll();

        // Refill in background if queue is running low
        if (queue.size() < 3) {
            refillQueue(sessionKey, topic, difficulty);
        }

        if (sentence != null) {
            return sentence;
        }

        // Queue was empty, generate one synchronously
        if ("News".equalsIgnoreCase(topic)) {
            List<String> headlines = newsService.getHeadlines(null);
            return headlines.isEmpty() ? "Breaking news headlines are loading please wait." : headlines.get(0);
        }
        String diffLabel = difficultyEngine.difficultyLabel(difficulty);
        return aiService.generateSentence(topic, diffLabel);
    }

    @Async
    public void refillQueue(String sessionKey, String topic, int difficulty) {
        ConcurrentLinkedQueue<String> queue = sentenceQueues.computeIfAbsent(sessionKey, k -> new ConcurrentLinkedQueue<>());

        if (queue.size() >= 5) return;

        int needed = 5 - queue.size();

        try {
            List<String> sentences;
            if ("News".equalsIgnoreCase(topic)) {
                sentences = newsService.getHeadlines(null);
            } else {
                String diffLabel = difficultyEngine.difficultyLabel(difficulty);
                sentences = aiService.generateSentenceBatch(topic, diffLabel, needed);
            }
            queue.addAll(sentences);
            log.info("Refilled queue for session {}: {} sentences (total: {})", sessionKey, sentences.size(), queue.size());
        } catch (Exception e) {
            log.error("Failed to refill sentence queue: {}", e.getMessage());
        }
    }

    public void clearSession(String sessionKey) {
        sentenceQueues.remove(sessionKey);
    }
}
