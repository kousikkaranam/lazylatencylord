package com.lazylatencylord.controller;

import com.lazylatencylord.dto.*;
import com.lazylatencylord.service.AiCompletionService;
import com.lazylatencylord.service.DifficultyEngine;
import com.lazylatencylord.service.NewsService;
import com.lazylatencylord.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/typing")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TopicTypingController {

    private final TopicService topicService;
    private final DifficultyEngine difficultyEngine;
    private final NewsService newsService;
    private final AiCompletionService aiService;

    @GetMapping("/topics")
    public List<String> getTopics() {
        return TopicService.AVAILABLE_TOPICS;
    }

    @PostMapping("/start")
    public TopicSessionResponse startSession(@RequestBody TopicSessionRequest request) {
        String sessionId = UUID.randomUUID().toString();
        int difficulty = difficultyEngine.initialDifficulty();
        String diffLabel = difficultyEngine.difficultyLabel(difficulty);
        String sentence = topicService.getNextSentence(sessionId, request.topic(), difficulty);

        // Pre-fill the queue in background
        topicService.refillQueue(sessionId, request.topic(), difficulty);

        return new TopicSessionResponse(sessionId, request.topic(), difficulty, diffLabel, sentence);
    }

    @PostMapping("/submit")
    public SubmitResultResponse submitResult(@RequestBody SubmitResultRequest request) {
        int newDifficulty = difficultyEngine.calculateDifficulty(
                request.wpm(), request.accuracy(), request.errorRate(), request.hesitationMs()
        );
        String diffLabel = difficultyEngine.difficultyLabel(newDifficulty);
        String nextSentence = topicService.getNextSentence(request.sessionId(), request.topic(), newDifficulty);

        return new SubmitResultResponse(newDifficulty, diffLabel, nextSentence, request.wpm(), request.accuracy());
    }

    @PostMapping("/end/{sessionId}")
    public void endSession(@PathVariable String sessionId) {
        topicService.clearSession(sessionId);
    }

    @PostMapping("/adapt")
    public AdaptSentenceResponse adaptSentence(@RequestBody AdaptSentenceRequest request) {
        boolean makeEasier = request.currentAccuracy() < request.expectedAccuracy()
                || request.currentWpm() < request.expectedWpm() * 0.7;

        String reason = makeEasier ? "struggling" : "excelling";
        String newRemaining = aiService.adaptRemaining(
                request.topic(), request.typedSoFar(), request.remainingText(), makeEasier
        );

        return new AdaptSentenceResponse(newRemaining, reason);
    }

    @GetMapping("/news")
    public List<String> getNewsHeadlines(@RequestParam(required = false) String category) {
        return newsService.getHeadlines(category);
    }

    @GetMapping("/provider")
    public Map<String, String> getProvider() {
        return Map.of("provider", aiService.getActiveProvider());
    }

    @PostMapping("/provider/{name}")
    public Map<String, String> switchProvider(@PathVariable String name) {
        aiService.switchProvider(name);
        return Map.of("provider", aiService.getActiveProvider());
    }
}
