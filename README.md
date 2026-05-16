# Neon Bubble Shooter

Cyberpunk neon Bubble Shooter for Base App (standard web app + wallet). English UI, swipe-to-aim controls, 10 levels, daily on-chain check-in on Base mainnet.

## Stack

- **web/** — Next.js (App Router), TypeScript, Tailwind, Canvas game engine
- **contracts/** — Foundry `DailyCheckIn` (no `msg.value`, once per UTC day, streak)

## Setup

1. Copy `.env.example` to `web/.env.local` and fill values after [base.dev](https://base.dev) registration.
2. Deploy contract (see below), set `NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS`.
3. Install and run:

```bash
cd web && npm install && npm run dev
```

## Deploy contract

```bash
cd contracts
forge test
export PRIVATE_KEY=0x...
forge script script/Deploy.s.sol:Deploy --rpc-url https://mainnet.base.org --broadcast
```

Current Base mainnet deployment: `0xEA126f55BC7c7DD44d0cf89B858d1e7C2759bfD4` — set as `NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS` in `web/.env.local`.

## Vercel

- Production URL: https://bubble-shooter-ashy.vercel.app
- Root Directory: `web`
- Set all `NEXT_PUBLIC_*` env vars (see `.env.example`)
- Verify `<meta name="base:app_id" content="6a08284f4c3f57496e8396af" />` in View Source

## Base.dev checklist

1. Register at [base.dev](https://base.dev) — name, icon (`web/public/app-icon.jpg`), thumbnail (`web/public/app-thumbnail.jpg`), primary URL, builder code.
2. `NEXT_PUBLIC_BASE_APP_ID` from project settings.
3. `NEXT_PUBLIC_BUILDER_CODE=bc_q8x3brxf` from [base.dev](https://base.dev) → Settings → Builder Codes.
4. Builder attribution: wagmi `dataSuffix` via `ox/erc8021` (auto in Base App; required on plain web).

## Test

```bash
cd contracts && forge test
cd web && npm run test && npm run build
```
