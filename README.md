# Red Flare

Real-time stock divergence detection powered by Algolia Agent Studio.

## Features

- **Algolia Agent Studio RAG** - AI analysis with 4 connected indices
- **Query Rules** - 7 NLP rules for natural language search
- **Synonyms** - 10 financial term synonym groups
- **Typo Tolerance** - "relianse" → Reliance Industries
- **Custom Ranking** - Sort by market cap
- **Redis Caching** - 6-hour TTL for instant responses
- **Dynamic Enrichment** - Yahoo Finance → auto-tagging

## Tech Stack

- **Frontend**: Next.js 16, Tailwind CSS, Framer Motion
- **Search**: Algolia InstantSearch
- **AI**: Algolia Agent Studio + Gemini
- **Cache**: Upstash Redis
- **Data**: Yahoo Finance API

## Setup

```bash
npm install
cp .env.example .env.local
# Fill in your API keys
npm run dev
```

## Seed Algolia

```bash
npx tsx scripts/seed-algolia.ts
```

## Environment Variables

See `.env.example` for required variables.

## License

MIT
