# Smart Contracts for Shadow Monarch's Path

This directory will contain the Solidity smart contracts for the game.

## Contracts Overview

### 1. BossLog.sol
Records boss kill events on-chain for verifiable game history.

**Functions:**
- `emitBossKilled(gateId, gateRank, bossId, participants[], contributions[])`

### 2. Relic721.sol
ERC-721 NFT contract for in-game relics/items.

**Functions:**
- `mint(to, relicType, affixInts[], ipfsCid)` → returns tokenId
- Metadata stored on IPFS

### 3. PlayerCardSBT.sol
Soul-Bound Token (SBT) representing player identity and progress.

**Functions:**
- `updateProgress(addr, rank, level, xp)`
- Non-transferable (soul-bound)

## Deployment

### Base Sepolia Testnet

1. **Deploy contracts to Base Sepolia**
2. **Update `.env` with contract addresses:**

```env
BOSS_LOG_ADDRESS=0x...
RELIC_721_ADDRESS=0x...
PLAYER_CARD_SBT_ADDRESS=0x...
```

3. **Fund coordinator wallet with test ETH:**
```bash
# Get test ETH from Base Sepolia faucet
# https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
```

## Contract ABIs

The ABIs are currently defined in `apps/core/src/chain/chain.service.ts`.

For production, these should be:
1. Generated from compiled contracts
2. Stored in a separate `contracts/abis/` directory
3. Imported as TypeScript modules with full type safety

## Development Mode

Without deployed contracts, the backend will:
- Accept run finish requests
- Generate mock transaction hashes
- Store data in MongoDB
- NOT actually write to blockchain

To enable blockchain integration:
1. Deploy the three contracts
2. Set environment variables
3. Ensure coordinator wallet has ETH for gas
4. Restart backend

## Next Steps

1. Create Solidity contracts
2. Write deployment scripts
3. Deploy to Base Sepolia
4. Test minting flow end-to-end


