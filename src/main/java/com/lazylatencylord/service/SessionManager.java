package com.lazylatencylord.service;

import com.lazylatencylord.domain.DifficultyResult;
import com.lazylatencylord.domain.SessionState;
import com.lazylatencylord.exception.SessionNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionManager {

    private final StringRedisTemplate redis;

    @Value("${session.ttl-minutes:30}")
    private int ttlMinutes;

    private static final String KEY_PREFIX = "session:";

    public void createSession(SessionState state) {
        String key = KEY_PREFIX + state.sessionId();
        redis.opsForHash().putAll(key, Map.of(
                "topic", state.topic(),
                "smoothedScore", String.valueOf(state.smoothedScore()),
                "difficulty", String.valueOf(state.difficulty()),
                "difficultyLabel", state.difficultyLabel(),
                "createdAt", state.createdAt().toString()
        ));
        redis.expire(key, Duration.ofMinutes(ttlMinutes));
        log.info("Session created: {} (topic: {})", state.sessionId(), state.topic());
    }

    public SessionState getSession(String sessionId) {
        String key = KEY_PREFIX + sessionId;
        Map<Object, Object> data = redis.opsForHash().entries(key);
        if (data.isEmpty()) {
            throw new SessionNotFoundException(sessionId);
        }
        return new SessionState(
                sessionId,
                (String) data.get("topic"),
                Double.parseDouble((String) data.get("smoothedScore")),
                Integer.parseInt((String) data.get("difficulty")),
                (String) data.get("difficultyLabel"),
                Instant.parse((String) data.get("createdAt"))
        );
    }

    public void updateDifficulty(String sessionId, DifficultyResult result) {
        String key = KEY_PREFIX + sessionId;
        if (Boolean.FALSE.equals(redis.hasKey(key))) {
            throw new SessionNotFoundException(sessionId);
        }
        redis.opsForHash().putAll(key, Map.of(
                "smoothedScore", String.valueOf(result.smoothedScore()),
                "difficulty", String.valueOf(result.difficulty()),
                "difficultyLabel", result.label()
        ));
        redis.expire(key, Duration.ofMinutes(ttlMinutes));
    }

    public void deleteSession(String sessionId) {
        redis.delete(KEY_PREFIX + sessionId);
        log.info("Session deleted: {}", sessionId);
    }

    public boolean sessionExists(String sessionId) {
        return Boolean.TRUE.equals(redis.hasKey(KEY_PREFIX + sessionId));
    }
}
