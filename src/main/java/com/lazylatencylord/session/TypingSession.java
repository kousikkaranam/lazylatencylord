package com.lazylatencylord.session;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TypingSession {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String userId;
    private Instant startedAt;
    private Instant endedAt;
    private Long totalChars;
    private Long errors;
    private double wpm;
    private double netWpm;
}
