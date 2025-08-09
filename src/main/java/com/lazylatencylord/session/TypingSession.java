package com.lazylatencylord.session;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TypingSession {
    @Id
    @SequenceGenerator(
            name = "typing_session_seq",
            sequenceName = "typing_session_seq",
            allocationSize = 1
    )
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "typing_session_seq")
    private Long id;
    private String userId;
    private Instant startedAt;
    private Instant endedAt;
    private Long totalChars;
    private Long errors;
    private double wpm;
    private double netWpm;
}
