package com.lazylatencylord.controller;

import com.lazylatencylord.dto.FinishSessionRequest;
import com.lazylatencylord.dto.StartSessionResponse;
import com.lazylatencylord.service.TypingSessionService;
import com.lazylatencylord.session.TypingSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/session")
@RequiredArgsConstructor
public class TypingSessionController {

    private final TypingSessionService service;

    @PostMapping("/start")
    public StartSessionResponse start(@RequestParam(required = false) String userId) {
        return service.startSession(userId);
    }

    @PostMapping("/{id}/finish")
    public TypingSession finish(@PathVariable Long id,
                                @RequestBody FinishSessionRequest payload) {
        return service.finishSession(id, payload);
    }
}
