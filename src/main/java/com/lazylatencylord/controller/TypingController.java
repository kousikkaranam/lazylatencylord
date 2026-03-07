package com.lazylatencylord.controller;

import com.lazylatencylord.domain.DifficultyResult;
import com.lazylatencylord.domain.SessionState;
import com.lazylatencylord.dto.request.AdaptSentenceRequest;
import com.lazylatencylord.dto.request.StartSessionRequest;
import com.lazylatencylord.dto.request.SubmitResultRequest;
import com.lazylatencylord.dto.response.AdaptSentenceResponse;
import com.lazylatencylord.dto.response.StartSessionResponse;
import com.lazylatencylord.dto.response.SubmitResultResponse;
import com.lazylatencylord.event.SentenceCompletedEvent;
import com.lazylatencylord.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/typing")
@RequiredArgsConstructor
public class TypingController {

    private final SessionManager sessionManager;
    private final SentenceQueueService sentenceQueueService;
    private final DifficultyCalculator difficultyCalculator;
    private final AdaptationService adaptationService;
    private final AiProviderRouter aiProviderRouter;
    private final NewsService newsService;
    private final ApplicationEventPublisher eventPublisher;

    @GetMapping("/topics")
    public List<String> getTopics() {
        return SentenceQueueService.AVAILABLE_TOPICS;
    }

    @PostMapping("/start")
    public StartSessionResponse startSession(@Valid @RequestBody StartSessionRequest request) {
        String sessionId = UUID.randomUUID().toString();
        int difficulty = difficultyCalculator.initialDifficulty();
        String label = difficultyCalculator.difficultyLabel(difficulty);

        SessionState state = SessionState.create(sessionId, request.topic(), difficulty, label);
        sessionManager.createSession(state);

        String sentence = sentenceQueueService.getNextSentence(sessionId, state);

        // Pre-fill queue in background
        sentenceQueueService.refillQueueAsync(sessionId, state);

        return new StartSessionResponse(sessionId, request.topic(), difficulty, label, sentence);
    }

    @PostMapping("/submit")
    public SubmitResultResponse submitResult(@Valid @RequestBody SubmitResultRequest request) {
        SessionState session = sessionManager.getSession(request.sessionId());

        DifficultyResult result = difficultyCalculator.calculate(
                session.smoothedScore(),
                request.wpm(), request.accuracy(), request.errorRate(), request.hesitationMs());

        sessionManager.updateDifficulty(request.sessionId(), result);

        SessionState updated = session.withDifficulty(result.smoothedScore(), result.difficulty(), result.label());
        String nextSentence = sentenceQueueService.getNextSentence(request.sessionId(), updated);

        // Publish event for async side effects (queue refill, analytics)
        eventPublisher.publishEvent(new SentenceCompletedEvent(
                request.sessionId(), request.topic(), result.difficulty(),
                request.wpm(), request.accuracy(), request.errorRate()));

        return new SubmitResultResponse(
                result.difficulty(), result.label(), nextSentence,
                request.wpm(), request.accuracy(), result.smoothedScore());
    }

    @PostMapping("/end/{sessionId}")
    public void endSession(@PathVariable String sessionId) {
        sentenceQueueService.clearQueue(sessionId);
        sessionManager.deleteSession(sessionId);
    }

    @PostMapping("/adapt")
    public AdaptSentenceResponse adaptSentence(@Valid @RequestBody AdaptSentenceRequest request) {
        var result = adaptationService.adapt(request);
        return new AdaptSentenceResponse(result.newRemaining(), result.reason());
    }

    @GetMapping("/news")
    public List<String> getNewsHeadlines(@RequestParam(required = false) String category) {
        return newsService.getHeadlines(category);
    }

    @GetMapping("/provider")
    public Map<String, String> getProvider() {
        return Map.of("provider", aiProviderRouter.getActiveProvider());
    }

    @PostMapping("/provider/{name}")
    public Map<String, String> switchProvider(@PathVariable String name) {
        aiProviderRouter.switchProvider(name);
        return Map.of("provider", aiProviderRouter.getActiveProvider());
    }
}
