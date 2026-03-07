package com.lazylatencylord.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

/**
 * Redis-backed sentence cache pool.
 * Pre-generated sentences are stored by topic+difficulty.
 * Next request pulls from pool first (0ms latency), falls back to live AI call.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiCacheService {

    private final StringRedisTemplate redis;

    private static final String POOL_PREFIX = "ai:pool:";
    private static final Duration CACHE_TTL = Duration.ofHours(2);

    public String getCachedSentence(String topic, String difficulty) {
        String key = poolKey(topic, difficulty);
        return redis.opsForSet().pop(key);
    }

    public void cacheSentences(String topic, String difficulty, List<String> sentences) {
        if (sentences.isEmpty()) return;
        String key = poolKey(topic, difficulty);
        redis.opsForSet().add(key, sentences.toArray(new String[0]));
        redis.expire(key, CACHE_TTL);
        log.debug("Cached {} sentences for {}:{}", sentences.size(), topic, difficulty);
    }

    public Long poolSize(String topic, String difficulty) {
        return redis.opsForSet().size(poolKey(topic, difficulty));
    }

    private String poolKey(String topic, String difficulty) {
        return POOL_PREFIX + topic.toLowerCase() + ":" + difficulty.toLowerCase();
    }
}
