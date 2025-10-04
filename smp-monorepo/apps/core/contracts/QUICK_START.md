# Quick Start - Deploy Contracts Locally

## Problem: Your RPC URL is connecting to Base Mainnet (8453) instead of Base Sepolia (84532)

## Solution: Use Local Hardhat Network for Testing

This is the **fastest and easiest** way to test blockchain minting without needing real or test ETH.

## Step-by-Step

### 1. Start Local Blockchain (Terminal 1)

```bash
cd apps/core/contracts
npx hardhat node
```

Keep this running! It will show:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

### 2. Deploy Contracts (Terminal 2)

```bash
cd apps/core/contracts
npm run deploy:local
```

You'll see:
```
📋 DEPLOYMENT SUMMARY
BossLog:          0x5FbDB2315678afecb367f032d93F642f64180aa3
Relic721:         0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
PlayerCardSBT:    0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

### 3. Update Backend `.env`

```env
# Blockchain - Local Hardhat Network
RPC_URL=http://localhost:8545
CHAIN_ID=31337

# Contract Addresses (from deployment output above)
BOSS_LOG_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
RELIC_721_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
PLAYER_CARD_SBT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

### 4. Restart Backend (Terminal 3)

```bash
cd apps/core
pnpm dev
```

You should see:
```
📝 Contract Addresses Loaded:
  BossLog: 0x5FbDB...
  Relic721: 0xe7f17...
  PlayerCardSBT: 0x9fE46...
```

### 5. Start Frontend (Terminal 4)

```bash
cd apps/web
pnpm dev
```

### 6. Test Minting!

1. Go to `http://app.lvh.me:3000`
2. Connect wallet (MetaMask)
3. Click "Dev Panel" button
4. Go to "Runs & Minting" tab
5. Click "Finish Run & Mint NFTs"
6. ✅ **See NFTs minted locally!**

## Why Local Hardhat?

- ✅ **No real money needed**
- ✅ **Unlimited test ETH** (10,000 ETH per account)
- ✅ **Instant transactions** (no waiting for block times)
- ✅ **Full blockchain logs** in Terminal 1
- ✅ **Reset anytime** (just restart `npx hardhat node`)
- ✅ **Test all features** before deploying to real network

## Later: Deploy to Base Sepolia

Once everything works locally:
1. Get test ETH from faucet
2. Run `npm run deploy:sepolia`
3. Update `.env` with real network settings

But for now, start with local Hardhat!


