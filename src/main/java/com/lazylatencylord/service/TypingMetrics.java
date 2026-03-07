package com.lazylatencylord.service;

import com.lazylatencylord.event.SentenceCompletedEvent;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Slf4j
@Component
public class TypingMetrics {

    private final MeterRegistry registry;

    public TypingMetrics(MeterRegistry registry) {
        this.registry = registry;
    }

    @Async
    @EventListener
    public void onSentenceCompleted(SentenceCompletedEvent event) {
        registry.counter("typing.sentences.completed",
                "topic", event.topic(),
                "difficulty", String.valueOf(event.difficulty())
        ).increment();

        registry.summary("typing.wpm", "topic", event.topic())
                .record(event.wpm());

        registry.summary("typing.accuracy", "topic", event.topic())
                .record(event.accuracy());
    }

    public void recordAiLatency(String provider, long millis) {
        Timer.builder("ai.generation.latency")
                .tag("provider", provider)
                .register(registry)
                .record(Duration.ofMillis(millis));
    }

    public void recordAiFailure(String provider) {
        Counter.builder("ai.generation.failures")
                .tag("provider", provider)
                .register(registry)
                .increment();
    }

    public void recordSessionStarted(String topic) {
        registry.counter("typing.sessions.started", "topic", topic).increment();
    }
}
