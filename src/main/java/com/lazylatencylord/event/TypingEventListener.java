package com.lazylatencylord.event;

import com.lazylatencylord.service.SentenceQueueService;
import com.lazylatencylord.service.SessionManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TypingEventListener {

    private final SentenceQueueService sentenceQueueService;
    private final SessionManager sessionManager;

    @Async
    @EventListener
    public void onSentenceCompleted(SentenceCompletedEvent event) {
        log.debug("Sentence completed: session={}, wpm={}, accuracy={}",
                event.sessionId(), event.wpm(), event.accuracy());

        // Pre-fill queue in background
        try {
            var session = sessionManager.getSession(event.sessionId());
            sentenceQueueService.refillQueueAsync(event.sessionId(), session);
        } catch (Exception e) {
            log.warn("Failed to refill queue after sentence completion: {}", e.getMessage());
        }
    }
}
