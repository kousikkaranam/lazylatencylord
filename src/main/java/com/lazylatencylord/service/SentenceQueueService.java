package com.lazylatencylord.service;

import com.lazylatencylord.domain.SessionState;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SentenceQueueService {

    private final StringRedisTemplate redis;
    private final AiProviderRouter aiRouter;
    private final NewsService newsService;
    private final DifficultyCalculator difficultyCalculator;

    @Value("${session.queue.target-size:8}")
    private int targetSize;

    @Value("${session.queue.refill-threshold:3}")
    private int refillThreshold;

    @Value("${session.ttl-minutes:30}")
    private int ttlMinutes;

    private static final String QUEUE_PREFIX = "queue:";
    private static final String LOCK_PREFIX = "lock:refill:";

    public static final List<String> AVAILABLE_TOPICS = List.of(
            "Technology", "Space", "History", "Startups",
            "Philosophy", "Programming", "Science", "News", "Random"
    );

    public String getNextSentence(String sessionId, SessionState session) {
        String key = QUEUE_PREFIX + sessionId;
        String sentence = redis.opsForList().leftPop(key);

        Long remaining = redis.opsForList().size(key);
        if (remaining != null && remaining < refillThreshold) {
            refillQueueAsync(sessionId, session);
        }

        if (sentence != null) {
            return sentence;
        }

        // Queue empty — generate one synchronously as fallback
        if ("News".equalsIgnoreCase(session.topic())) {
            List<String> headlines = newsService.getHeadlines(null);
            return headlines.isEmpty()
                    ? "Breaking news headlines are loading please wait."
                    : headlines.getFirst();
        }
        return aiRouter.generateSentence(session.topic(), session.difficultyLabel());
    }

    @Async
    public void refillQueueAsync(String sessionId, SessionState session) {
        String lockKey = LOCK_PREFIX + sessionId;

        // Distributed lock — prevents duplicate concurrent refills
        Boolean acquired = redis.opsForValue().setIfAbsent(lockKey, "1", Duration.ofSeconds(30));
        if (Boolean.FALSE.equals(acquired)) return;

        try {
            String queueKey = QUEUE_PREFIX + sessionId;
            Long currentSize = redis.opsForList().size(queueKey);
            if (currentSize != null && currentSize >= targetSize) return;

            int needed = targetSize - (currentSize != null ? currentSize.intValue() : 0);

            List<String> sentences;
            if ("News".equalsIgnoreCase(session.topic())) {
                sentences = newsService.getHeadlines(null);
            } else {
                sentences = aiRouter.generateBatch(session.topic(), session.difficultyLabel(), needed);
            }

            if (!sentences.isEmpty()) {
                redis.opsForList().rightPushAll(queueKey, sentences);
                redis.expire(queueKey, Duration.ofMinutes(ttlMinutes));
                log.info("Refilled queue for session {}: {} sentences", sessionId, sentences.size());
            }
        } catch (Exception e) {
            log.error("Failed to refill sentence queue for session {}: {}", sessionId, e.getMessage());
        } finally {
            redis.delete(lockKey);
        }
    }

    public void clearQueue(String sessionId) {
        redis.delete(QUEUE_PREFIX + sessionId);
    }
}
