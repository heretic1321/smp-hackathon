# Contract Deployment Guide

## ✅ Contracts Ready to Deploy!

Your wallet address: **0xFCAd0B19bB29D4674531d6f115237E16AfCE377c**

## Option 1: Base Mainnet (Real Blockchain - Costs Real ETH)

⚠️ **Warning**: This uses REAL ETH on Base Mainnet (Chain ID: 8453)

1. **Get ETH** (you'll need ~$5-10 worth):
   - Buy ETH on Coinbase
   - Bridge to Base using https://bridge.base.org
   - Send to: `0xFCAd0B19bB29D4674531d6f115237E16AfCE377c`

2. **Deploy:**
```bash
npm run deploy:sepolia  # Despite the name, this deploys to Base mainnet (8453)
```

## Option 2: Local Hardhat Network (FREE - Recommended for Testing)

This gives you a local blockchain with unlimited test ETH for development:

**Terminal 1 - Start Local Blockchain:**
```bash
cd apps/core/contracts
npx hardhat node
```

This will:
- Start a local blockchain on `http://localhost:8545`
- Give you 10+ test accounts with 10,000 ETH each
- Show you the private keys for testing

**Terminal 2 - Deploy Contracts:**
```bash
cd apps/core/contracts
npm run deploy:local
```

**Terminal 3 - Update Backend `.env`:**
```env
# For local Hardhat testing
RPC_URL=http://localhost:8545
CHAIN_ID=31337

# Contract addresses from deployment output
BOSS_LOG_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
RELIC_721_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
PLAYER_CARD_SBT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

**Terminal 4 - Restart Backend:**
```bash
cd apps/core
pnpm dev
```

## Option 3: Base Sepolia Testnet (Free Test Network)

⚠️ **Note**: Your current RPC is pointing to Base Mainnet (8453), not Sepolia (84532)

To use Base Sepolia testnet:

1. **Update `.env`:**
```env
RPC_URL=https://sepolia.base.org
CHAIN_ID=84532
```

2. **Update hardhat.config.ts** (already done - chainId is 8453 but RPC is sepolia.base.org)

3. **Get Free Test ETH:**
   - Visit: https://www.coinbase.com/faucets
   - Enter: `0xFCAd0B19bB29D4674531d6f115237E16AfCE377c`
   - Get 0.05-0.1 test ETH

4. **Deploy:**
```bash
npm run deploy:sepolia
```

## After Deployment

### Update Backend `.env`

Add the contract addresses from deployment output:
```env
BOSS_LOG_ADDRESS=0x...
RELIC_721_ADDRESS=0x...
PLAYER_CARD_SBT_ADDRESS=0x...
```

### Restart Backend

```bash
cd apps/core
pnpm dev
```

You should see:
```
📝 Contract Addresses Loaded:
  BossLog: 0x...
  Relic721: 0x...
  PlayerCardSBT: 0x...
```

### Test with Dev Panel

1. Navigate to `http://app.lvh.me:3000`
2. Connect wallet & create profile
3. Click "Dev Panel" button
4. Go to "Runs & Minting" tab
5. Click "Finish Run & Mint NFTs"
6. Check the results and transaction hash!

## Recommended: Start with Local Hardhat

For quickest testing without needing real/test ETH:
1. Start Hardhat node (Terminal 1)
2. Deploy locally (Terminal 2)  
3. Update .env with local addresses
4. Test minting flow with unlimited test ETH

Once everything works locally, deploy to Base Sepolia or Mainnet!


