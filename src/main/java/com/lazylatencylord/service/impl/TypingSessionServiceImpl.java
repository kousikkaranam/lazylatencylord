package com.lazylatencylord.service.impl;

import com.lazylatencylord.dto.FinishSessionRequest;
import com.lazylatencylord.dto.StartSessionResponse;
import com.lazylatencylord.service.TypingSessionService;
import com.lazylatencylord.session.TypingSession;
import com.lazylatencylord.session.TypingSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class TypingSessionServiceImpl implements TypingSessionService {

    private final TypingSessionRepository repo;

    /** ───────────────────────────── Helpers ───────────────────────────── */

    private static final String DEFAULT_PROMPT =
            "The quick brown fox jumps over the lazy dog.";

    @Override
    public StartSessionResponse startSession(String userId) {
        TypingSession session = TypingSession.builder()
                .userId(userId)
                .startedAt(Instant.now())
                .build();
        session = repo.save(session);
        return new StartSessionResponse(session.getId(), DEFAULT_PROMPT);
    }

    @Override
    public TypingSession finishSession(Long sessionId, FinishSessionRequest p) {
        TypingSession s = repo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid id"));
        s.setEndedAt(Instant.now());
        s.setTotalChars(p.totalChars());
        s.setErrors(p.errors());

        double minutes = Math.max( //
                (s.getEndedAt().toEpochMilli() - s.getStartedAt().toEpochMilli()) / 60000.0,
                0.01);
        double grossWpm = (p.totalChars() / 5.0) / minutes;
        double netWpm   = grossWpm - (p.errors() / minutes);

        s.setWpm(grossWpm);
        s.setNetWpm(netWpm);
        return repo.save(s);
    }
}
