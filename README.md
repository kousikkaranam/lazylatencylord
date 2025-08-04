# LazyLatencyLord

**Java-based adaptive typing speed application** using Spring Boot.

## Overview

LazyLatencyLord is a web-based typing speed trainer built with Java 21, Gradle (Groovy), and Spring Boot 3.5.4. It offers:

* Start/finish typing sessions via REST endpoints
* Computes gross/net WPM and error counts
* Pluggable service layer (`TypingSessionService`) for business logic
* H2 in-memory database for quick setup
* Thin controllers, modular service, and JPA repository layers

## Features

* **Session management**: start and finish typing sessions
* **Metrics calculation**: WPM, net WPM, accuracy
* **Modular architecture**: interfaces for session service, text provider, coaching engine
* **Easy-to-extend**: add real-time WebSocket, adaptive difficulty, heatmap, coaching tips

## Prerequisites

* Java 21 JDK
* Gradle
* (Optional) Postman or cURL for API testing

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://your.repo.url/lazylatencylord.git
   cd lazylatencylord
   ```

2. **Configure package and group**
   Ensure `build.gradle` has:

   ```groovy
   group = 'com.lazylatencylord'
   version = '0.1.0'
   sourceCompatibility = '21'
   ```

3. **Build & Run**

   ```bash
   ./gradlew bootRun
   ```

4. **H2 Console** (development only)

   * URL: `http://localhost:8080/h2-console`
   * JDBC URL: `jdbc:h2:mem:typingspeed`
   * User: `sa`, Password: \`\`

5. **API Endpoints**

   | Method | URL                        | Description                    |
   | ------ | -------------------------- | ------------------------------ |
   | POST   | `/api/session/start`       | Start a typing session         |
   | POST   | `/api/session/{id}/finish` | Finish session and compute WPM |

   ```bash
   # Start session
   curl -X POST "http://localhost:8080/api/session/start?userId=guest"
   # Finish session
   curl -X POST "http://localhost:8080/api/session/1/finish" \
        -H "Content-Type: application/json" \
        -d '{"totalChars": 250, "errors": 5}'
   ```

## Project Structure

```
src
└── main
    ├── java
    │   └── com.lazylatencylord
    │       ├── LazyLatencyLordApplication.java     # Spring Boot entrypoint
    │       ├── api
    │       │   └── TypingSessionController.java    # REST controller
    │       ├── dto
    │       │   ├── StartSessionResponse.java
    │       │   └── FinishSessionRequest.java
    │       ├── service
    │       │   ├── TypingSessionService.java       # interface
    │       │   └── impl
    │       │       └── TypingSessionServiceImpl.java
    │       └── session
    │           ├── TypingSession.java             # JPA entity
    │           └── TypingSessionRepository.java   # Spring Data JPA
    └── resources
        ├── application.properties                # configuration
        └── ...
```

## Next Steps

1. **Extract `TextProvider`** to supply adaptive prompts
2. **Integrate WebSocket** for real-time keystrokes and live WPM
3. **Implement `CoachingEngine`** for personalized tips
4. **Front-end**: build a JavaScript or JavaFX client for UI
5. **Persistence**: switch to PostgreSQL and add Flyway migrations
6. **Heatmap & analytics**: track per-finger metrics

## Contributing

Contributions are welcome! Please open issues or pull requests on GitHub.

## License

MIT © 2025 LazyLatencyLord Contributors
