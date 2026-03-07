package com.lazylatencylord.config;

import com.lazylatencylord.service.AiCompletionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class TypingWebSocketHandler extends TextWebSocketHandler {

    private final AiCompletionService aiService;

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        String partialText = message.getPayload();
        List<String> completions = aiService.generateCompletions(partialText);
        String suggestion = completions.isEmpty() ? "" : completions.get(0);
        session.sendMessage(new TextMessage(suggestion));
    }
}