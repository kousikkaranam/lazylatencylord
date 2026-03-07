# LazyLatencyLord

**AI-powered adaptive typing trainer** that generates topic-based sentences and dynamically adjusts difficulty in real-time based on your typing performance.

## What Makes It Different

- Sentences are **AI-generated** on the fly — never the same practice twice
- Difficulty **adapts per sentence** using a skill scoring algorithm (WPM, accuracy, error rate, hesitation)
- **Live mid-sentence adaptation** — if you're struggling, the AI rewrites the remaining text easier; if you're cruising, it gets harder
- **Topic-based practice** — type about things you care about, not random words
- Unpredictability built in — random difficulty spikes prevent pattern memorization

## Features

- **9 Topics** — Technology, Space, History, Startups, Philosophy, Programming, Science, News, Random
- **Adaptive Difficulty Engine** — 5 levels (beginner to expert) with exponential moving average for smooth transitions
- **Multiple Session Modes** — Infinite, timed (15/30/60/120s), sentence-limited (5/10/20/50)
- **Real-Time Metrics** — WPM, net WPM, accuracy, error rate, per-sentence breakdowns
- **News Mode** — Type real headlines fetched from NewsData API
- **Async Sentence Queue** — Background pre-generation ensures zero wait between sentences
- **AI Provider Switching** — Swap between Gemini and Groq on the fly with automatic fallback
- **Redis Caching** — AI responses cached to reduce latency and API costs
- **Rate Limiting** — Configurable per-minute request throttling per client
- **Observability** — Prometheus metrics and Spring Actuator health/info endpoints

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 3.5.4, Spring Data JPA, Spring Data Redis |
| Frontend | React 18, Vite |
| AI | Google Gemini (`gemini-2.0-flash-lite`), Groq (`llama-3.1-8b-instant`) |
| Caching | Redis |
| Database | H2 (dev), PostgreSQL (prod) |
| Observability | Spring Actuator, Micrometer, Prometheus |
| Build | Gradle, Node Gradle Plugin |

## How It Works

```
Select Topic -> AI generates sentences -> You type -> System analyzes performance -> Difficulty adjusts -> Next sentence generated
```

1. **Pick a topic** — choose what you want to type about
2. **Configure session** — set timer mode, duration, toggle live adaptation
3. **Type** — sentences appear with character-by-character visual feedback
4. **AI adapts** — difficulty shifts based on your skill score, calculated as:
   ```
   TSS = (0.45 x WPM) + (0.40 x accuracy) - (0.10 x error_rate) - (0.05 x hesitation)
   ```
5. **Review** — see per-sentence stats and session averages

## Getting Started

### Prerequisites

- Java 21 JDK
- Node.js (auto-downloaded by Gradle if missing)
- Redis (for caching)
- API key for at least one AI provider (Gemini or Groq)

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/kousikkaranam/lazylatencylord.git
   cd lazylatencylord
   ```

2. **Configure environment**

   Create a `.env` file in the project root (supported via spring-dotenv):

   ```env
   AI_PROVIDER=groq                    # or gemini
   GOOGLE_AI_API_KEY=your_key          # if using Gemini
   GROQ_API_KEY=your_key               # if using Groq
   NEWS_API_KEY=your_key               # optional, for News topic

   # Database (defaults to H2 in-memory if not set)
   DB_URL=jdbc:postgresql://localhost:5432/lazylatencylord
   DB_DRIVER=org.postgresql.Driver
   DB_USERNAME=postgres
   DB_PASSWORD=your_password

   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379

   # Optional tuning
   SESSION_TTL_MINUTES=30
   QUEUE_TARGET_SIZE=8
   QUEUE_REFILL_THRESHOLD=3
   RATE_LIMIT_RPM=60
   SERVER_PORT=8080
   ```

3. **Build & Run**

   ```bash
   ./gradlew bootRun
   ```

   App runs at `http://localhost:8080`. The Gradle build automatically compiles the React frontend and bundles it into the JAR.

4. **Development mode** (frontend hot reload)

   ```bash
   # Terminal 1
   ./gradlew bootRun -Pdev

   # Terminal 2
   cd frontend && npm run dev
   ```

## Project Structure

```
src/main/java/com/lazylatencylord/
├── ai/                  # AI providers (Gemini, Groq) and DTOs
├── config/              # CORS, Redis, async, rate limiting, web config
├── controller/          # REST endpoints
├── domain/              # Domain objects (SessionState, DifficultyResult)
├── dto/                 # Request/response records
├── event/               # Event-driven sentence completion handling
├── exception/           # Custom exceptions and global error handler
├── service/             # Difficulty engine, session manager, AI routing, caching, news
├── session/             # JPA entity and repository
└── dev/                 # Frontend dev server proxy

frontend/src/
├── HomePage.js          # Main typing UI
├── App.css              # Styles
└── main.jsx             # Entry point
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/typing/topics` | List available topics |
| POST | `/api/typing/start` | Start session with topic and config |
| POST | `/api/typing/submit` | Submit sentence result, get next sentence |
| POST | `/api/typing/adapt` | Request mid-sentence difficulty adaptation |
| POST | `/api/typing/end/{id}` | End session |
| GET | `/api/typing/news` | Fetch news headlines |
| GET | `/api/typing/provider` | Get current AI provider |
| POST | `/api/typing/provider/{name}` | Switch AI provider |

### Actuator Endpoints

| Endpoint | Description |
|----------|-------------|
| `/actuator/health` | Application health check |
| `/actuator/info` | Application info |
| `/actuator/metrics` | Application metrics |
| `/actuator/prometheus` | Prometheus scrape endpoint |

## License

MIT
