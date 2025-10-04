# Blockchain Integration Setup Guide

## Overview

This guide walks you through deploying the smart contracts and integrating blockchain minting into the Shadow Monarch's Path backend.

## Prerequisites

1. **Base Sepolia Test ETH**: Get free test ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
2. **Private Key**: Your coordinator wallet private key (the one in `.env`)
3. **RPC URL**: Base Sepolia RPC endpoint (default: `https://sepolia.base.org`)

## Step 1: Install Hardhat Dependencies

```bash
cd apps/core/contracts
npm install
```

## Step 2: Deploy Contracts

### Option A: Deploy to Base Sepolia (Recommended)

```bash
cd apps/core/contracts
npm run deploy:sepolia
```

### Option B: Local Development (Hardhat Network)

```bash
# Terminal 1 - Start local blockchain
npx hardhat node

# Terminal 2 - Deploy contracts
npm run deploy:local
```

## Step 3: Update Environment Variables

After deployment, you'll see output like:

```
📋 DEPLOYMENT SUMMARY
BossLog:          0x1234567890123456789012345678901234567890
Relic721:         0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
PlayerCardSBT:    0x9876543210987654321098765432109876543210
```

**Add these to `apps/core/.env`:**

```env
# Contract Addresses (from deployment)
BOSS_LOG_ADDRESS=0x1234567890123456789012345678901234567890
RELIC_721_ADDRESS=0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
PLAYER_CARD_SBT_ADDRESS=0x9876543210987654321098765432109876543210
```

## Step 4: Restart Backend

```bash
cd apps/core
pnpm dev
```

The backend will now use the deployed contracts!

## Contract Details

### BossLog
- **Purpose**: Records boss kills on-chain for verifiable game history
- **Events**: `BossKilled(gateId, bossId, participants[], contributions[], timestamp, runId)`
- **Idempotency**: Prevents duplicate run recordings

### Relic721
- **Purpose**: ERC-721 NFT for in-game relics/items
- **Metadata**: Stored on IPFS with affix attributes
- **Transferable**: Yes (players can trade relics)

### PlayerCardSBT
- **Purpose**: Soul-bound token for player identity
- **Non-transferable**: Cannot be traded (soul-bound)
- **Auto-mint**: Automatically mints on first progress update

## Testing the Flow

### 1. Complete a Run

```bash
POST /v1/runs/:runId/finish
Header: Idempotency-Key: unique-key-123

Body:
{
  "bossId": "FrostKing",
  "contributions": [
    { "wallet": "0x...", "damage": 1000 }
  ]
}
```

### 2. Expected Response

```json
{
  "ok": true,
  "data": {
    "txHash": "0xabc123...",
    "relics": [
      { "tokenId": 1, "cid": "Qm..." }
    ]
  }
}
```

### 3. Verify On-Chain

```bash
# Check transaction on BaseScan
https://sepolia.basescan.org/tx/0xabc123...

# Check your relic NFT
https://sepolia.basescan.org/token/0x.../instance/1
```

## Blockchain Integration Flow

When `POST /runs/:runId/finish` is called:

1. ✅ Validate input and check idempotency
2. ✅ Call `BossLog.emitBossKilled()` → record kill on-chain
3. ✅ For each participant, call `Relic721.mint()` → mint relic NFT
4. ✅ For each participant, call `PlayerCardSBT.updateProgress()` → update SBT
5. ✅ Save transaction hashes and data to MongoDB
6. ✅ Update inventory cache
7. ✅ Return results to client

## Gas Optimization

- Batch transactions where possible
- Use appropriate gas limits
- Monitor gas prices
- Implement retry logic for failed transactions

## Troubleshooting

### "Insufficient funds for gas"
- Ensure coordinator wallet has test ETH
- Get more from faucet

### "Contract not deployed"
- Verify contract addresses in `.env`
- Check deployment was successful

### "Invalid signature"
- Ensure `COORDINATOR_PRIVATE_KEY` in `.env` matches deployment account

## Next Steps

1. **Deploy contracts** to Base Sepolia
2. **Update `.env`** with contract addresses
3. **Test run finish flow** end-to-end
4. **Verify minting** on BaseScan
5. **(Optional) Verify contracts** on BaseScan for transparency


