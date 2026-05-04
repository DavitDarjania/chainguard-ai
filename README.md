# ChainGuard AI

ChainGuard AI is a dark, cyberpunk-styled crypto scam detector for Ethereum wallets, smart contracts, and token symbols. It combines Etherscan data, Moralis token intelligence, and OpenAI analysis to produce a plain-English risk verdict.

## Features

- Next.js 14 App Router with TypeScript and Tailwind CSS
- Premium dark UI with neon green/cyan accents, glass panels, scanlines, animated grid, and particle effects
- Animated shield logo with circuit tracing
- Smart input detection for ETH wallets, smart contracts, and token symbols
- Server-side Etherscan calls for balance, transaction history, and contract source status
- Server-side Moralis calls for token metadata, holders, price, and liquidity
- OpenAI-powered JSON security analysis using `OPENAI_MODEL`
- Deterministic fallback analysis when API keys are missing or providers fail
- Full-screen radar scanning state
- Animated circular risk gauge and SAFE / SUSPICIOUS / DANGER badges
- Word-by-word AI explanation reveal
- Animated red and green flag panels
- Local browser history stored in `localStorage`
- Shareable result URLs
- Optional DANGER verdict sound toggle
- Mobile responsive layouts and styled error states

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create an environment file:

```bash
cp .env.example .env.local
```

3. Fill in your API keys:

```bash
ETHERSCAN_API_KEY=your_etherscan_key
MORALIS_API_KEY=your_moralis_key
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4.1-mini
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

All API keys are read only by server-side code in `app/api/analyze/route.ts` and supporting files under `lib/`.

4. Run the development server:

```bash
npm run dev
```

5. Open the app:

[http://localhost:3000](http://localhost:3000)

## Production Build

```bash
npm run build
npm run start
```

## Notes

- ChainGuard AI is a triage and risk-intelligence tool, not a replacement for a full smart-contract audit.
- If one or more external providers fail, the app returns a styled result using available data and fallback heuristics instead of showing a blank page.
- Shared URLs encode the displayed analysis payload so recipients can view the same result without needing access to the original browser history.
