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

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 3.5.4, Spring Data JPA, WebSocket |
| Frontend | React 18, TypeScript, Vite |
| AI | Google Gemini (`gemini-2.0-flash-lite`), Groq (`llama-3.1-8b-instant`) |
| Database | H2 (in-memory) |
| Build | Gradle |

## How It Works

```
Select Topic → AI generates sentences → You type → System analyzes performance → Difficulty adjusts → Next sentence generated
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
- Node.js & npm
- API key for at least one AI provider (Gemini or Groq)

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/kousikkaranam/lazylatencylord.git
   cd lazylatencylord
   ```

2. **Set environment variables**

   ```bash
   export AI_PROVIDER=gemini          # or groq
   export GOOGLE_AI_API_KEY=your_key  # if using Gemini
   export GROQ_API_KEY=your_key       # if using Groq
   export NEWS_API_KEY=your_key       # optional, for News topic
   ```

3. **Build & Run**

   ```bash
   ./gradlew bootRun
   ```

   App runs at `http://localhost:8080`.

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
├── ai/                  # AI providers (Gemini, Groq)
├── config/              # CORS, WebSocket, SPA routing
├── controller/          # REST endpoints
├── dto/                 # Request/response records
├── service/             # Difficulty engine, topic service, AI completion
└── session/             # JPA entity and repository

frontend/src/
├── App.tsx              # Typing UI, metrics, navigation
├── index.css            # Dark theme styles
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

## License

MIT
