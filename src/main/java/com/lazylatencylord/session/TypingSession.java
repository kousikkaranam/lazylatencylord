package com.lazylatencylord.session;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "typing_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TypingSession {

    @Id
    @SequenceGenerator(
            name = "typing_session_seq",
            sequenceName = "typing_session_seq",
            allocationSize = 50
    )
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "typing_session_seq")
    private Long id;

    @Column(nullable = false)
    private String sessionId;

    private String userId;

    @Column(nullable = false)
    private String topic;

    @Column(nullable = false)
    private Instant startedAt;

    private Instant endedAt;

    @Builder.Default
    private int totalSentences = 0;

    @Builder.Default
    private double avgWpm = 0.0;

    @Builder.Default
    private double avgAccuracy = 0.0;

    @Builder.Default
    private double bestWpm = 0.0;
}
