package com.lazylatencylord.service;

import com.lazylatencylord.dto.FinishSessionRequest;
import com.lazylatencylord.dto.StartSessionResponse;
import com.lazylatencylord.session.TypingSession;
import jakarta.annotation.Nullable;

public interface TypingSessionService {

    StartSessionResponse startSession(@Nullable String userId);

    TypingSession finishSession(Long sessionId, FinishSessionRequest p);
}
