package com.lazylatencylord.service;

import com.lazylatencylord.dto.request.AdaptSentenceRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdaptationService {

    private final AiProviderRouter aiRouter;

    public record AdaptationResult(String newRemaining, String reason) {}

    public AdaptationResult adapt(AdaptSentenceRequest request) {
        boolean makeEasier = request.currentAccuracy() < request.expectedAccuracy()
                || request.currentWpm() < request.expectedWpm() * 0.7;

        String reason = makeEasier ? "struggling" : "excelling";
        String newRemaining = aiRouter.adaptRemaining(
                request.topic(), request.typedSoFar(), request.remainingText(), makeEasier);

        return new AdaptationResult(newRemaining, reason);
    }
}
