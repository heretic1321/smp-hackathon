# Shadow Monarch's Path - Testing Guide

## 🚀 Quick Start

### Prerequisites
1. **Node.js** 18+ and **pnpm** installed
2. **MongoDB** running locally or MongoDB Atlas account
3. **MetaMask** or other Web3 wallet for full testing

### Setup
1. **Install dependencies**:
   ```bash
   cd apps/core
   pnpm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection string and other settings
   ```

3. **Start the server**:
   ```bash
   pnpm dev
   ```

## 🧪 Testing Methods

### Method 1: Automated Script (Basic Tests)
```bash
# Run basic health and auth challenge tests
./test-flow.sh
```

### Method 2: Postman Collection
1. **Import** `shadow-monarchs-path-api-collection.json`
2. **Set environment variables**:
   - `base_url`: `http://api.lvh.me:4000`
   - `wallet_address`: `0x742d35Cc6A3e0b6cEfF4c9CE0C8cD3B8C4e9f2423`
   - `test_image_url`: `https://via.placeholder.com/400x400.png`

### Method 3: Manual curl Commands

#### Health Check
```bash
curl http://api.lvh.me:4000/v1/health
# Expected: {"ok":true,"data":{"status":"ok"}}
```

#### Auth Challenge
```bash
curl -X POST http://api.lvh.me:4000/v1/auth/challenge \
  -H "Content-Type: application/json" \
  -d '{"address": "0x742d35Cc6A3e0b6cEfF4c9CE0C8cD3B8C4e9f2423"}'
# Expected: {"ok":true,"data":{"nonce":"abc123..."}}
```

#### Auth Verify (Requires Real Wallet)
```bash
curl -X POST http://api.lvh.me:4000/v1/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x742d35Cc6A3e0b6cEfF4c9CE0C8cD3B8C4e9f2423",
    "message": "app.lvh.me wants you to sign in...",
    "signature": "0x3045022100..."
  }'
# Expected: {"ok":true,"data":{"address":"0x742d35Cc6A3e0b6cEfF4c9CE0C8cD3B8C4e9f2423"}}
```

#### Profile Operations (Requires Authentication)
```bash
# Create profile
curl -X POST http://api.lvh.me:4000/v1/profile \
  -H "Cookie: gb_session=your-session-token" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "ShadowMaster",
    "avatarId": "m_swordsman",
    "imageUrl": "https://via.placeholder.com/400x400.png"
  }'

# Get profile
curl http://api.lvh.me:4000/v1/profile/0x742d35Cc6A3e0b6cEfF4c9CE0C8cD3B8C4e9f2423
```

## 🔧 Environment Configuration

### Required Environment Variables
```env
NODE_ENV=development
DOMAIN=.lvh.me
PORT=4000
MONGODB_URI=mongodb://localhost:27017/shadow-monarchs-path-dev
STORAGE_BASE_URL=https://your-cdn.com/relics
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
```

### Database Setup
1. **Local MongoDB**:
   ```bash
   # Install MongoDB locally or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **MongoDB Atlas**:
   - Create cluster at https://cloud.mongodb.com
   - Get connection string
   - Update `MONGODB_URI` in `.env`

## 🚨 Troubleshooting

### Server Not Starting
- Check if port 4000 is available
- Verify `.env` file exists and has valid values
- Check MongoDB connection

### Authentication Issues
- **SIWE requires real wallet**: Use MetaMask or similar
- **Session cookie**: Must be set by `/v1/auth/verify`
- **CORS**: Ensure requests come from allowed origins

### Database Issues
- Verify MongoDB connection string
- Check database exists: `shadow-monarchs-path-dev`
- Collections: `players`, `runs`, `parties`

## 📊 Database Verification

### MongoDB Atlas
1. **Login** to MongoDB Atlas
2. **Navigate** to your cluster
3. **Collections** → `shadow-monarchs-path-dev`
4. **Browse** `players` collection

### Expected Document
```json
{
  "_id": "0x742d35cc6a3e0b6ceff4c9ce0c8cd3b8c4e9f2423",
  "wallet": "0x742d35cc6a3e0b6ceff4c9ce0c8cd3b8c4e9f2423",
  "displayName": "ShadowMaster",
  "avatarId": "m_swordsman",
  "rank": "E",
  "level": 1,
  "xp": 0
}
```

## 🎯 Testing Checklist

- [ ] Health endpoint returns 200 OK
- [ ] Version endpoint works
- [ ] Auth challenge generates nonce
- [ ] Auth verify accepts valid signature
- [ ] Profile creation works with authentication
- [ ] Profile retrieval works
- [ ] Leaderboard shows created profiles
- [ ] Profile search works
- [ ] Database contains test documents
- [ ] Media upload endpoints accept requests

## 🔄 Development vs Production

### Development
- Database: `shadow-monarchs-path-dev`
- Storage: Local files in `/uploads`
- Logging: Detailed with pretty formatting

### Production
- Database: `shadow-monarchs-path-prod`
- Storage: S3/Cloudflare R2 with CDN
- Logging: JSON format, error tracking

## 🚀 Next Steps

1. **Complete authentication** with real wallet
2. **Set up MongoDB** connection
3. **Test profile operations** with authentication
4. **Test media uploads** with actual files
5. **Verify database** operations
6. **Implement remaining modules** (Gates, Parties, Runs)

Your Shadow Monarch's Path backend is ready for development! 🎮
