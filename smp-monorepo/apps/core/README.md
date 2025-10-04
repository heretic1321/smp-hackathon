
# Shadow monarch's path Core Backend — README

A spec‑driven, production‑minded backend for the Shadow monarch's path on‑chain game. This service is **the source of truth** for authentication (SIWE), player profiles, gates and parties (lobbies), run lifecycle, on‑chain receipts (boss kills, Relic mints, SBT progress), media upload for profile images, leaderboards, and a read‑only inventory cache.

> Colyseus (realtime sim) lives in a separate app. Unity WebGL reads a short‑lived, signed cookie set by this service and joins the correct room. Marketplace is intentionally out of scope for MVP.

---

## Table of Contents

- [1. Architecture & Decisions](#1-architecture--decisions)
- [2. Project Layout](#2-project-layout)
- [3. Quick Start](#3-quick-start)
- [4. Environment Variables](#4-environment-variables)
- [5. Security Model](#5-security-model)
- [6. Data Contracts (Zod Schemas)](#6-data-contracts-zod-schemas)
- [7. REST API (v1)](#7-rest-api-v1)
  - [7.1 Health & Meta](#71-health--meta)
  - [7.2 Auth (SIWE)](#72-auth-siwe)
  - [7.3 Media (Profile Image Upload)](#73-media-profile-image-upload)
  - [7.4 Profiles](#74-profiles)
  - [7.5 Gates](#75-gates)
  - [7.6 Parties (Lobby, Ready, Start)](#76-parties-lobby-ready-start)
  - [7.7 Runs (Finish & Results)](#77-runs-finish--results)
  - [7.8 Inventory (Read-only)](#78-inventory-read-only)
  - [7.9 Leaderboards (Read-only)](#79-leaderboards-read-only)
- [8. Server-Sent Events (SSE)](#8-server-sent-events-sse)
- [9. Idempotency](#9-idempotency)
- [10. Persistence (Mongo/Mongoose)](#10-persistence-mongomongoose)
- [11. Chain Integration (viem)](#11-chain-integration-viem)
- [12. End-to-End Flows](#12-end-to-end-flows)
- [13. Error Codes & Statuses](#13-error-codes--statuses)
- [14. Acceptance Criteria](#14-acceptance-criteria)
- [15. Notes & Future Work](#15-notes--future-work)

---

## 1. Architecture & Decisions

- **Framework:** NestJS (modular, DI, familiar).
- **DB:** MongoDB + **Mongoose** (atomic single‑doc updates; teammate expertise).
- **Validation:** **Zod** with a Nest `ZodValidationPipe` at controller boundary. No class‑validator duplication.
- **API style:** JSON REST (`/v1`), typed request/response envelopes.
- **Auth:** **SIWE** (EIP‑4361) → issue **JWT** in HttpOnly cookie `gb_session`.
- **Game handoff:** **Signed JWT** cookie `gb_game` (non‑HttpOnly, 5‑minute TTL) carries only the data Unity needs.
- **Web3:** **viem v2** + abitype for safer, typed contract calls. Only this service holds the private key.
- **Media:** Profile image upload via **web3.storage** (or any adapter) → store **URL** on the user object (no banners).
- **Realtime:** Colyseus is authoritative for combat; Core orchestrates parties, runs, cookies, and on‑chain receipts.
- **Observability:** pino logger, request IDs; basic metrics optional.
- **Hardening:** Helmet, strict CORS for subdomains, throttling on sensitive endpoints.
- **Idempotency:** `POST /runs/:id/finish` is idempotent using an **outbox** keyed by `(runId, Idempotency-Key)`.

---

## 2. Project Layout

> The Core app sits under your monorepo folder (e.g., `core/`). Colyseus is **not** part of this project.

```
core/
  src/
    core/           # config, logger, pipes, filters, throttling
    auth/           # SIWE challenge/verify, JWT cookie
    profiles/       # player profile CRUD
    media/          # profile image uploads (web3.storage adapter)
    gates/          # list/seed gates + occupancy view
    parties/        # lobby, ready, lock, start, SSE
    runs/           # finish & results
    inventory/      # read-only inventory cache
    leaderboards/   # weekly and per-boss
    chain/          # viem clients, contract services
    common/         # zod schemas, guards, interceptors, errors
```

---

## 3. Quick Start

```bash
# 1) Dependencies
pnpm i

# 2) Start Mongo (Docker)
docker compose up -d

# 3) Set environment
cp .env.example .env   # then fill values

# 4) Run dev server
pnpm dev               # starts on http://api.lvh.me:4000

# 5) Health check
curl http://api.lvh.me:4000/v1/health
```

**Dev domains:** use `*.lvh.me` so cookies work across subdomains without hosts edits.  
- Web: `http://app.lvh.me:3000`  
- Core API: `http://api.lvh.me:4000`  
- Realtime: `http://play.lvh.me:2567`

---

## 4. Environment Variables

Create `core/.env` from `.env.example`:

```
# Server
NODE_ENV=development
DOMAIN=.lvh.me                  # cookie scope for subdomain continuity
PORT=4000

# Mongo
MONGODB_URI=mongodb://root:example@localhost:27017/Shadow monarch's path?authSource=admin

# Auth
JWT_SECRET=supersecret          # HttpOnly gb_session signing
SESSION_TTL_HOURS=2

# Game handoff
GB_GAME_TTL_MINUTES=5           # signed non-HttpOnly cookie

# Chain
RPC_URL=<https_endpoint>
CHAIN_ID=11155111               # Sepolia
COORDINATOR_PRIVATE_KEY=0xabc...

# IPFS
IPFS_TOKEN=<web3.storage token>

# Internal
SERVICE_KEY=<random-string>     # for /v1/internal/* endpoints from Realtime
```

The app validates env with a Zod schema at boot. Missing/invalid values fail fast.

---

## 5. Security Model

- **Cookies**
  - `gb_session` (HttpOnly, SameSite=Lax, Secure in prod, Domain from env): user session after SIWE.
  - `gb_game` (signed JWT, **non-HttpOnly**, 5‑min TTL): contains `{ partyId, runId, wallet, displayName, avatarId, equippedRelicIds, roomToken }` for Unity.
- **CORS**: allow only `https://app.<domain>` and `https://play.<domain>`, with `credentials:true`.
- **Guards**: JWTGuard for user routes, RolesGuard for admin, ServiceKeyGuard for `/v1/internal/*`.
- **Headers**: Rate limit sensitive routes; `Idempotency-Key` required for public callers on `/runs/:id/finish`.

---

## 6. Data Contracts (Zod Schemas)

> The authoritative schemas live in `packages/shared`. Inline definitions are normative.

```ts
import { z } from 'zod'

export const Address = z.string().regex(/^0x[a-fA-F0-9]{40}$/)
export const GateRank = z.enum(['E','D','C'])
export const DisplayName = z.string().min(3).max(24)
export const AvatarId = z.string()  // e.g., "m_swordsman", "f_swordsman" or "1","2"

export const Profile = z.object({
  wallet: Address,
  displayName: DisplayName,
  avatarId: AvatarId,
  imageUrl: z.string().url(),
  rank: GateRank,
  level: z.number().int().min(1),
  xp: z.number().int().min(0),
  sbtTokenId: z.number().int().optional()
})

export const ProfileUpsertInput = z.object({
  displayName: DisplayName,
  avatarId: AvatarId,
  imageUrl: z.string().url()
})

export const Gate = z.object({
  id: z.string(),
  rank: GateRank,
  name: z.string(),
  description: z.string(),
  thumbUrl: z.string().url(),
  mapCode: z.string(),
  capacity: z.number().int().min(1),
  isActive: z.boolean()
})

export const PartyMember = z.object({
  wallet: Address,
  displayName: DisplayName,
  avatarId: AvatarId,
  isReady: z.boolean(),
  isLocked: z.boolean(),
  equippedRelicIds: z.array(z.number().int()).max(3).optional()
})

export const Party = z.object({
  partyId: z.string(),
  gateId: z.string(),
  leader: Address,
  capacity: z.number().int(),
  state: z.enum(['waiting','starting','started','closed']),
  members: z.array(PartyMember),
  createdAt: z.string()
})

export const Contribution = z.object({
  wallet: Address,
  damage: z.number().int().min(0)
})

export const StartRunResult = z.object({
  runId: z.string(),
  roomToken: z.string()
})

export const FinishRunInput = z.object({
  bossId: z.string().min(1),
  contributions: z.array(Contribution).min(1)
})

export const FinishRunResult = z.object({
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  relics: z.array(z.object({ tokenId: z.number().int(), cid: z.string() }))
})

export const ResultSummary = z.object({
  runId: z.string(),
  gateId: z.string(),
  bossId: z.string(),
  participants: z.array(z.object({
    wallet: Address, displayName: DisplayName, avatarId: AvatarId,
    damage: z.number().int().min(0), normalKills: z.number().int().min(0)
  })),
  mintedRelics: z.array(z.object({ tokenId: z.number().int(), cid: z.string() })),
  xpAwards: z.array(z.object({ wallet: Address, xp: z.number().int() })),
  rankUps: z.array(z.object({ wallet: Address, from: GateRank, to: GateRank })).optional()
})

export const InventoryItem = z.object({
  tokenId: z.number().int(),
  relicType: z.string(),
  affixes: z.record(z.string(), z.number()),
  cid: z.string(),
  equipped: z.boolean().optional()
})
```

**Response envelope**

```json
{ "ok": true, "data": {/*...*/} }
{ "ok": false, "error": { "code": "ERROR_CODE", "message": "Human", "details": {/*opt*/} } }
```

---

## 7. REST API (v1)

Base path: `/v1`

### 7.1 Health & Meta

- `GET /health` → `{ ok:true, data:{ status:"ok" } }`  
- `GET /version` → `{ ok:true, data:{ gitSha:string, builtAt:string } }`

### 7.2 Auth (SIWE)

- `POST /auth/challenge` → `{ ok:true, data:{ nonce:string } }`
- `POST /auth/verify` (body `{ address, message, signature }`)  
  → sets `gb_session` cookie and returns `{ ok:true, data:{ address } }`
- `POST /auth/logout` → clears `gb_session`
- `GET /auth/me` → `{ ok:true, data:{ address, roles:["user"] } }`

### 7.3 Media (Profile Image Upload)

- `POST /media/profile-image` (multipart `file`) → `{ ok:true, data:{ imageUrl:string } }`  
  Errors: `FILE_TOO_LARGE`, `UNSUPPORTED_TYPE`, `UPLOAD_FAILED`

### 7.4 Profiles

- `GET /profile/:address` → `{ ok:true, data: Profile }`  
- `POST /profile` (body `ProfileUpsertInput`) → `{ ok:true, data: Profile }`  
  Errors: `NAME_TAKEN`, `PROFILE_NOT_FOUND`

### 7.5 Gates

- `GET /gates` →  
  ```json
  {
    "ok": true,
    "data": {
      "gates": [
        {
          "id":"C_FROST","rank":"C","name":"Frost Halls","description":"...",
          "thumbUrl":"https://.../thumb.webp","mapCode":"FrostHall",
          "capacity":3,"isActive":true,
          "occupancy":[{"partyId":"p_1","current":2,"max":3}]
        }
      ]
    }
  }
  ```
- `GET /gates/:id` → gate + occupancy  
- Admin (optional): `POST /admin/gates`, `PATCH /admin/gates/:id`

### 7.6 Parties (Lobby, Ready, Start)

**States:** `waiting` → `starting` → `started` → `closed`

- `POST /gates/:gateId/join-or-create` → join open party or create new (leader = caller). Returns `Party`.
- `POST /party/:partyId/ready` (body `{ isReady: boolean }`) → returns `Party`.
- `POST /party/:partyId/lock` (body `{ equippedRelicIds: number[] }` up to 3) → returns `Party`.
- `POST /party/:partyId/leave` → removes caller; re‑elects leader; deletes party if empty.
- `GET /party/:partyId` → current snapshot.
- `GET /party/:partyId/stream` → **SSE** stream of lobby events.
- `POST /party/:partyId/start` (leader) → preconditions: all members ready & locked. Creates `Run`, generates per‑member room tokens, sets state to started. Returns `{ runId }`.
- `GET /party/:partyId/start-payload` → sets **`gb_game`** cookie and returns `{ redirect:"https://play.<domain>/run/<runId>" }`.

### 7.7 Runs (Finish & Results)

- `GET /results/:runId` → `ResultSummary`
- `POST /runs/:runId/finish`  
  - Headers: `Idempotency-Key` required for public callers  
  - Body: `FinishRunInput`  
  - Side effects: on‑chain BossKilled, Relic mints, SBT progress, outbox saved  
  - Returns: `FinishRunResult`

**Internal for Realtime**

- `POST /internal/rooms/verify` (header `X-Service-Key`)  
  - Body `{ roomToken }`  
  - Returns `{ wallet, runId, partyId, gateId }`

### 7.8 Inventory (Read‑only)

- `GET /inventory/:address` → `{ items: InventoryItem[] }`

### 7.9 Leaderboards (Read‑only)

- `GET /leaderboards/weekly/:weekKey` → `{ scope:"weekly", refId, rows:[{ wallet, displayName, value }] }`
- `GET /leaderboards/boss/:bossId` → `{ scope:"per_boss", refId, rows:[...] }`

---

## 8. Server-Sent Events (SSE)

Endpoint: `GET /v1/party/:partyId/stream`  
Headers: `Cache-Control: no-cache`, `Connection: keep-alive`

Events and payloads:
- `member_joined` `{ wallet, displayName, avatarId }`
- `member_left` `{ wallet }`
- `ready_changed` `{ wallet, isReady }`
- `locked_changed` `{ wallet, isLocked }`
- `leader_changed` `{ wallet }`
- `started` `{ runId }`
- `closed` `{ reason }`

---

## 9. Idempotency

`POST /runs/:runId/finish` is idempotent via an **outbox** collection keyed by `(runId, Idempotency-Key)`.

- First successful response is persisted and returned for subsequent retries.
- Duplicate keys with different payloads return `409 DUPLICATE_IDEMPOTENCY_KEY`.

---

## 10. Persistence (Mongo/Mongoose)

Collections & indexes:

- **players**  
  `_id: wallet`, `displayName` (unique, case‑insensitive), `avatarId`, `imageUrl`, `rank`, `level`, `xp`, `sbtTokenId?`  
  Index: `{ displayNameLower: 1 }` unique

- **gates**  
  `_id: gateId`, `rank`, `name`, `description`, `thumbUrl`, `mapCode`, `capacity`, `isActive`  
  Index: `{ isActive: 1 }`

- **parties** (TTL 2h)  
  `partyId`, `gateId`, `leader`, `capacity`, `state`, `members[]`, `createdAt`  
  Indices: `{ gateId: 1, state: 1 }`, TTL on `createdAt`

- **runs**  
  `runId`, `partyId`, `gateId`, `members[]` (wallet, displayName, avatarId, equippedRelicIds), `startedAt`, `endedAt?`, `result?`, `bossId?`, `txHash?`, `mintedRelics[]`  
  Indices: `{ gateId: 1, startedAt: -1 }`, `{ endedAt: -1 }`

- **outbox** (idempotency)  
  `(runId, key)` unique, `response`, `createdAt`

- **inventory** (cache of on‑chain mints)  
  `wallet`, `tokenId`, `relicType`, `affixes`, `cid`  
  Index: `{ wallet: 1 }`

---

## 11. Chain Integration (viem)

- **Clients**: PublicClient (RPC_URL, CHAIN_ID), WalletClient (private key). Confirmations default 1.
- **Contracts**:
  - `BossLog.emitBossKilled(gateId, gateRank, bossId, participants[], contributions[])`
  - `Relic721.mint(to, relicType, affixInts[], ipfsCid)`
  - `PlayerCardSBT.updateProgress(addr, rank, level, xp)`
- **Retries**: 3 with exponential backoff for transient RPC errors.
- **Logging**: record `txHash` on submit; never log private key.

---

## 12. End-to-End Flows

### 12.1 Profile setup with generated image

1. Frontend generates random image →  
2. `POST /media/profile-image` (multipart file) → `{ imageUrl }`  
3. `POST /profile` with `{ displayName, avatarId, imageUrl }` → returns saved `Profile`

### 12.2 Party and start

1. `POST /gates/:gateId/join-or-create` → returns `Party`  
2. Subscribe `GET /party/:id/stream`  
3. Choose relics locally → `POST /party/:id/lock { equippedRelicIds }`  
4. `POST /party/:id/ready { isReady:true }`  
5. Leader `POST /party/:id/start` → emits `started { runId }`  
6. Each member `GET /party/:id/start-payload` → sets `gb_game` cookie and returns `{ redirect }`  
7. Browser navigates to `play.<domain>`; Unity reads `gb_game` and joins the correct room

### 12.3 Finish and results

- Realtime calls `POST /runs/:runId/finish` with `Idempotency-Key` and contributions → chain tx + relic mints → 200 with `{ txHash, relics[] }`  
- Web shows `GET /results/:runId`

---

## 13. Error Codes & Statuses

- `INVALID_SIGNATURE` (400), `NONCE_MISMATCH` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403)
- `PROFILE_NOT_FOUND` (404), `NAME_TAKEN` (409)
- `GATE_NOT_FOUND` (404), `GATE_INACTIVE` (409)
- `PARTY_NOT_FOUND` (404), `NOT_A_MEMBER` (403), `PARTY_FULL` (409), `PARTY_STARTED` (409), `NOT_LEADER` (403), `MEMBER_NOT_READY` (409), `MEMBER_NOT_LOCKED` (409)
- `RUN_NOT_FOUND` (404), `RUN_ALREADY_FINISHED` (409), `INVALID_CONTRIBUTIONS` (422), `DUPLICATE_IDEMPOTENCY_KEY` (409)
- `FILE_TOO_LARGE` (413), `UNSUPPORTED_TYPE` (415), `UPLOAD_FAILED` (502)
- `CHAIN_ERROR` (502), `INTERNAL_ERROR` (500)

HTTP responses always include the envelope with `error.code`.

---

## 14. Acceptance Criteria

- **Auth:** challenge→verify sets cookie; `/auth/me` returns address.
- **Profiles:** upload → upsert → `GET /profile/:addr` returns saved fields.
- **Gates:** `GET /gates` shows capacity and live occupancy when parties exist.
- **Parties:** join/ready/lock/start only succeeds with all ready+locked; SSE emits `started`.
- **Start payload:** `gb_game` cookie contains the expected fields; redirect URL includes `runId`.
- **Finish:** same `Idempotency-Key` returns same payload; outbox prevents duplicate mints.
- **Results:** `GET /results/:runId` mirrors minted relics and XP awards.

---

## 15. Notes & Future Work

- Add Redis pub/sub if you scale Core horizontally (for SSE and occupancy cache).
- Add VRF or on‑chain randomness proofs for rare Relic rolls.
- Add refresh tokens or short‑lived session rotation if needed.
- Marketplace endpoints can be added later without impacting current contracts.
