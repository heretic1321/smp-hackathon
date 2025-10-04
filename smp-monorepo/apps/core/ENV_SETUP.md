# Environment Setup

To run the Shadow Monarch's Path Core backend, you need to create a `.env` file in the `apps/core` directory.

## Required Environment Variables

Create `apps/core/.env` with the following content:

```env
# Server
NODE_ENV=development
DOMAIN=.lvh.me
PORT=4000

# MongoDB - IMPORTANT: You need MongoDB running!
# If using docker-compose: mongodb://root:example@localhost:27017/shadow-monarchs-path-dev?authSource=admin
MONGODB_URI=mongodb://localhost:27017/shadow-monarchs-path-dev

# Auth
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
SESSION_TTL_HOURS=2

# Game handoff
GB_GAME_TTL_MINUTES=5

# Chain (Base Sepolia)
RPC_URL=https://sepolia.base.org
CHAIN_ID=84532
COORDINATOR_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000

# Storage
STORAGE_BASE_URL=http://localhost:4000/uploads

# Contract Addresses (deploy contracts first, then add these)
BOSS_LOG_ADDRESS=0x0000000000000000000000000000000000000000
RELIC_721_ADDRESS=0x0000000000000000000000000000000000000000
PLAYER_CARD_SBT_ADDRESS=0x0000000000000000000000000000000000000000

# Internal
SERVICE_KEY=your-internal-service-key-min-16-chars
```

## MongoDB Setup

You have several options for MongoDB:

### Option 1: MongoDB Atlas (Cloud - Recommended for Remote)
Use your existing MongoDB Atlas connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shadow-monarchs-path?retryWrites=true&w=majority
```

The backend will use this URI as-is, including database name and authentication.

### Option 2: Docker Compose (Recommended for Local)
```bash
cd apps/core
docker-compose up -d
```

Then use in `.env`:
```env
MONGODB_URI=mongodb://root:example@localhost:27017/shadow-monarchs-path-dev?authSource=admin
```

### Option 3: Docker Run
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Then use in `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/shadow-monarchs-path-dev
```

### Option 4: Local MongoDB
Install MongoDB locally and ensure it's running on port 27017.
```env
MONGODB_URI=mongodb://localhost:27017/shadow-monarchs-path-dev
```

## Verify Setup

Once MongoDB is running and `.env` is configured:

```bash
cd apps/core
pnpm dev
```

You should see:
```
🚀 Shadow Monarch's Path Core API is running on port 4000
```

## Test Health Endpoint

```bash
curl http://localhost:4000/v1/health
```

Expected response:
```json
{
  "ok": true,
  "data": {
    "status": "ok"
  }
}
```
