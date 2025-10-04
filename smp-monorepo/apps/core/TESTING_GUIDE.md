# Shadow Monarch's Path - Testing Guide

## Overview
This guide explains how to test the gate mechanics, relic minting, and SBT profiles using the dev panel.

## Prerequisites

1. **Dev Access**: Only users with displayName "heretic" (case-insensitive) can access dev endpoints
2. **Authentication**: Must be logged in with SIWE
3. **MongoDB**: Database must be running
4. **Profile**: Must have a profile created

## Setup

### 1. Start the Backend

```bash
cd apps/core
pnpm start:dev
```

### 2. Seed Gates (Option A: Via Script)

```bash
cd apps/core
pnpm seed:gates
```

### 3. Seed Gates (Option B: Via Dev Panel)

1. Login as "heretic"
2. Navigate to your profile page
3. Click "Dev Panel" button (red/orange button in header)
4. Click "Seed Default Gates"

## Dev Panel Features

The dev panel is accessible from the profile page for user "heretic" and provides the following testing tools:

### Database Operations
- **Seed Default Gates**: Populates database with 12 default gates (E to S rank)
- **Get System Stats**: Shows counts of gates, players, runs, parties, and relics

### Profile Operations
- **Add XP**: Adds specified XP to your profile
- **Set Rank**: Directly changes your hunter rank (E, D, C, B, A, S)
- **Reset Profile**: Resets to E-rank, Level 1, 0 XP

### Relic Operations
- **Mint Test Relic**: Creates a test relic in your inventory with random affixes
- **Clear Inventory**: Removes all relics from your inventory

### Simulate Run
- **Simulate Boss Kill**: Simulates completing a dungeon run
  - Awards XP based on damage dealt
  - Mints a random relic
  - Updates your profile

### SBT Profile
- **Mint/Update SBT**: Creates or updates your SBT profile token ID

## Testing Flows

### Test 1: Gate Browsing
1. Seed gates using dev panel
2. Navigate to "Browse Dungeons" page
3. Verify gates are displayed with correct ranks (E, D, C, B, A, S)
4. Check that gate thumbnails, descriptions, and capacity are shown
5. Verify you can filter by rank

### Test 2: Profile Progression
1. Open dev panel
2. Add 5000 XP
3. Verify level increases
4. Set rank to "C"
5. Verify rank badge updates on profile
6. Check that profile card reflects changes

### Test 3: Relic Minting
1. Open dev panel
2. Enter relic type (e.g., "sword", "dagger", "bow")
3. Click "Mint Test Relic"
4. Navigate to inventory page
5. Verify relic appears with:
   - Correct type
   - Random affixes (strength, agility, intelligence, vitality)
   - Token ID
   - IPFS CID
6. Repeat to mint multiple relics
7. Test "Clear Inventory" to remove all relics

### Test 4: Simulate Boss Kill
1. Open dev panel
2. Select a gate ID (e.g., "E_GOBLIN_CAVE")
3. Set damage amount (e.g., 10000)
4. Click "Simulate Boss Kill"
5. Verify response shows:
   - XP gained
   - New XP total
   - New level
   - Minted relic details
6. Check profile page for updated stats
7. Check inventory for new relic

### Test 5: SBT Profile
1. Create/update your profile
2. Open dev panel
3. Click "Mint/Update SBT Profile Token"
4. Verify sbtTokenId is set in profile
5. Check that profile shows SBT token ID
6. Verify profile can be updated while maintaining SBT

### Test 6: Party Creation (Manual)
1. Seed gates
2. Navigate to a gate
3. Create a party
4. Invite other players (requires multiple accounts)
5. Start a run
6. Complete the run
7. Verify rewards are distributed

### Test 7: Full Dungeon Flow
1. Reset profile to E-rank
2. Browse E-rank gates
3. Create a party for "Goblin Cave"
4. Simulate boss kill via dev panel
5. Check XP and level up
6. Verify relic was minted
7. Progress through ranks (E → D → C)
8. Test higher-rank gates

## API Endpoints Reference

All dev endpoints require authentication and "heretic" displayName.

### POST /v1/dev/seed-gates
Seeds default gates into database.

**Response:**
```json
{
  "ok": true,
  "data": {
    "count": 12,
    "gates": [...]
  }
}
```

### POST /v1/dev/mint-test-relic
Mints a test relic to your inventory.

**Body:**
```json
{
  "relicType": "sword"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "tokenId": 1234567890,
    "relicType": "sword",
    "affixes": {
      "strength": 15,
      "agility": 8,
      "intelligence": 12,
      "vitality": 20
    },
    "cid": "Qm...",
    "equipped": false
  }
}
```

### POST /v1/dev/update-xp
Adds XP to your profile.

**Body:**
```json
{
  "xp": 1000
}
```

### POST /v1/dev/update-rank
Sets your rank.

**Body:**
```json
{
  "rank": "C"
}
```

### POST /v1/dev/simulate-boss-kill
Simulates completing a dungeon run.

**Body:**
```json
{
  "gateId": "E_GOBLIN_CAVE",
  "bossId": "goblin_king",
  "damage": 10000
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "xpGained": 1000,
    "newXp": 2000,
    "newLevel": 3,
    "relic": {...},
    "bossId": "goblin_king",
    "gateId": "E_GOBLIN_CAVE"
  }
}
```

### POST /v1/dev/mint-sbt
Mints or updates SBT profile token.

**Response:**
```json
{
  "ok": true,
  "data": {
    "sbtTokenId": 1234567890,
    "wallet": "0x...",
    "rank": "C",
    "level": 5,
    "xp": 3000,
    "message": "SBT minted" // or "SBT updated"
  }
}
```

### GET /v1/dev/stats
Returns system statistics.

**Response:**
```json
{
  "ok": true,
  "data": {
    "gates": 12,
    "players": 5,
    "runs": 23,
    "parties": 8,
    "relics": 45
  }
}
```

### POST /v1/dev/reset-profile
Resets your profile to starting values.

**Response:**
```json
{
  "ok": true,
  "data": {
    "wallet": "0x...",
    "displayName": "heretic",
    "rank": "E",
    "level": 1,
    "xp": 0,
    ...
  }
}
```

### POST /v1/dev/clear-inventory
Clears all relics from your inventory.

**Response:**
```json
{
  "ok": true,
  "data": {
    "removed": 5
  }
}
```

## Default Gates

The seed script creates 12 gates across all ranks:

### E-Rank (Beginner)
- **Goblin Cave**: Weak goblins, perfect for beginners
- **Slime Forest**: Peaceful forest with slimes

### D-Rank (Novice)
- **Orc War Camp**: Fortified camp with orcs
- **Abandoned Mine**: Haunted by undead miners

### C-Rank (Intermediate)
- **Frost Temple**: Ancient temple with ice elementals
- **Volcanic Lair**: Fire demons and lava beasts

### B-Rank (Advanced)
- **Dark Cathedral**: Corrupted cathedral with dark priests
- **Shadow Fortress**: Massive fortress shrouded in darkness

### A-Rank (Expert)
- **Demon Palace**: Palace of a demon lord
- **Dragon's Nest**: Home to an ancient dragon

### S-Rank (Legend)
- **Void Dimension**: Eldritch horrors beyond reality
- **Shadow Monarch's Throne**: The final challenge

## Troubleshooting

### "Access denied" Error
- Ensure your displayName is exactly "heretic" (case-insensitive)
- Verify you're logged in with SIWE
- Check that gb_session cookie is present

### Gates Not Showing
- Run seed script or use dev panel to seed gates
- Check MongoDB connection
- Verify gates collection has documents

### Relics Not Appearing
- Check that inventory collection exists
- Verify mint operation succeeded
- Check browser console for errors

### Profile Not Updating
- Refresh the page after operations
- Check MongoDB for profile document
- Verify updatePlayerStats is being called

## Notes

- All dev operations bypass blockchain interactions for testing
- SBT tokens are assigned local IDs (not real blockchain tokens yet)
- Relic minting generates random affixes (1-20 per stat)
- XP-to-level conversion: ~1000 XP per level
- Damage-to-XP conversion: 1 XP per 10 damage

## Production Considerations

When deploying to production:
1. **Remove or restrict dev endpoints** - Only enable in development
2. **Implement real blockchain integration** for relics and SBT
3. **Add proper nonce storage** for SIWE (Redis/database)
4. **Set up IPFS** for relic metadata
5. **Deploy smart contracts** for Relic721 and PlayerCardSBT
6. **Configure proper session management** with secure cookies
7. **Add rate limiting** to prevent abuse
8. **Implement proper role-based access control**

