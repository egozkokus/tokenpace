# ⚡ TokenPace

A small, playful web app that measures **how fast you read and type — in tokens**
(the unit an AI "sees" text in). Hebrew + English.

## The core idea & the fairness trick

Every AI company tokenizes text differently, and non-Latin scripts (Hebrew) produce
**far more tokens** than English for the same content. To keep the game fair **without
faking any numbers**, we use one firewall:

> **We normalize the _unit of the score_, never the _token count_.**

- **Scoring** uses a single canonical client-side tokenizer (`o200k_base` via
  `gpt-tokenizer`) and the **TokenPace** metric: `100 = the average for your language`.
  Because you're ranked only against your own language, the per-language token
  inflation cancels out — a bilingual user sees intuitive scores (higher in the
  language they're actually better at), with no rigged-feeling artifact.
- **Layer B** ("how each AI counts you") shows the **real raw counts** from OpenAI
  (o200k), Meta (Llama 3) and Google (Gemini) side by side — all free. Honest, and
  clearly separate from the competitive score.

See `Desktop/token-speed-research.html` for the full research write-up.

## Stack

- **Vite + React + TypeScript** · **Tailwind v4** · **Framer Motion**
- `gpt-tokenizer` (o200k_base) — client-side token counting, zero cost/latency
- `i18next` — he/en + RTL
- **Supabase** — public leaderboard (optional; falls back to localStorage)
- **Vercel Serverless** (`/api`) — Gemini question generation + Gemini token counting
  (OpenAI o200k and Meta Llama 3 are counted client-side, free)

## Run locally

```bash
npm install
npm run dev
```

The app works fully offline in dev: comprehension questions fall back to bundled
static questions, Layer B shows the OpenAI + Llama 3 counts (both client-side;
Gemini needs the server), and the leaderboard uses localStorage. Add keys (below) + deploy to enable the AI parts.

## Deploy (GitHub → Vercel)

1. Push this folder to a GitHub repo.
2. Import it in Vercel (framework preset: **Vite**). `/api/*` deploy as functions automatically.
3. Add env vars in Vercel (see `.env.example`): `GEMINI_KEY`,
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
   - Gemini key (free): https://aistudio.google.com/apikey

## Supabase leaderboard (optional)

Create a project, put its URL + anon key in the env vars, and run this SQL:

```sql
create table public.scores (
  id bigint generated always as identity primary key,
  name text not null,
  lang text not null check (lang in ('he','en')),
  mode text not null check (mode in ('reading','typing')),
  pace int not null,
  raw_tokens int not null,
  seconds double precision not null,
  created_at timestamptz default now()
);

alter table public.scores enable row level security;

create policy "public read"   on public.scores for select using (true);
create policy "public insert" on public.scores for insert with check (
  char_length(name) between 1 and 24 and pace between 0 and 100000
);
```

> ⚠️ Scores are **public** — the app tells the user this before they save a name.

## Tuning the baselines (cold-start)

`src/lib/pace.ts` ships analytic cold-start baselines (`BASELINE_TPS`). Once you
have real data, compute the **median raw tokens/sec per language+mode** from Supabase
and feed it to `refreshBaselines(...)` so `100` tracks the true population average.
