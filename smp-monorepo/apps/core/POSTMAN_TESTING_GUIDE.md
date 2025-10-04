# Shadow Monarch's Path - Postman Testing Guide

## 🚀 Quick Start

1. **Import Postman Collection**: Use the provided collection JSON
2. **Set Environment Variables**: Configure your test environment
3. **Test Health Endpoints**: No authentication required
4. **Test Authentication**: Requires wallet or use development workaround
5. **Test Profile APIs**: Requires authentication

## 📋 Environment Setup

Create a new environment in Postman with these variables:

```json
{
  "base_url": "http://api.lvh.me:4000",
  "wallet_address": "0x742d35Cc6A3e0b6cEfF4c9CE0C8cD3B8C4e9f2423",
  "domain": ".lvh.me",
  "test_image_url": "https://via.placeholder.com/400x400.png"
}
```

## 🧪 Testing Flow

### **Phase 1: Health & System Checks** (No Auth Required)

#### 1.1 Health Check
```http
GET {{base_url}}/v1/health
```

**Expected Response:**
```json
{
  "ok": true,
  "data": {
    "status": "ok"
  }
}
```

#### 1.2 Version Info
```http
GET {{base_url}}/v1/version
```

**Expected Response:**
```json
{
  "ok": true,
  "data": {
    "gitSha": "unknown",
    "builtAt": "2024-01-01T00:00:00.000Z",
    "nodeVersion": "20.10.0",
    "environment": "development"
  }
}
```

### **Phase 2: Authentication Flow**

#### 2.1 Generate SIWE Challenge (No Wallet Required)
```http
POST {{base_url}}/v1/auth/challenge
Content-Type: application/json

{
  "address": "{{wallet_address}}"
}
```

**Expected Response:**
```json
{
  "ok": true,
  "data": {
    "nonce": "abc123def456..."
  }
}
```

#### 2.2 Sign Message (Requires Real Wallet)
**⚠️ IMPORTANT**: This step requires a real Ethereum wallet (MetaMask, etc.)

1. Copy the message from the challenge response
2. Sign it with your wallet
3. Use the signature in the verify request

**Example Message:**
```
app.lvh.me wants you to sign in with your Ethereum account:
0x742d35Cc6A3e0b6cEfF4c9CE0C8cD3B8C4e9f2423

Sign in to Shadow Monarch's Path

URI: https://app.lvh.me
Version: 1
Chain ID: 11155111
Nonce: abc123def456...
Issued At: 2024-01-01T00:00:00.000Z
```

#### 2.3 Verify Signature (Requires Real Signature)
```http
POST {{base_url}}/v1/auth/verify
Content-Type: application/json

{
  "address": "{{wallet_address}}",
  "message": "app.lvh.me wants you to sign in with your Ethereum account: 0x742d35Cc6A3e0b6cEfF4c9CE0C8cD3B8C4e9f2423\n\nSign in to Shadow Monarch's Path\n\nURI: https://app.lvh.me\nVersion: 1\nChain ID: 11155111\nNonce: abc123def456...\nIssued At: 2024-01-01T00:00:00.000Z",
  "signature": "0x3045022100a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890a022100bcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd"
}
```

**Expected Response:**
```json
{
  "ok": true,
  "data": {
    "address": "0x742d35Cc6A3e0b6cEfF4c9CE0C8cD3B8C4e9f2423"
  }
}
```

**Cookie Set**: `gb_session` cookie is automatically set

#### 2.4 Get Current User (Protected)
```http
GET {{base_url}}/v1/auth/me
Cookie: gb_session=your-session-token-here
```

**Expected Response:**
```json
{
  "ok": true,
  "data": {
    "address": "0x742d35Cc6A3e0b6cEfF4c9CE0C8cD3B8C4e9f2423",
    "roles": ["user"]
  }
}
```

#### 2.5 Logout
```http
POST {{base_url}}/v1/auth/logout
Cookie: gb_session=your-session-token-here
```

**Expected Response:**
```json
{
  "ok": true,
  "data": {}
}
```

### **Phase 3: Profile Management** (Requires Authentication)

#### 3.1 Create Profile
```http
POST {{base_url}}/v1/profile
Content-Type: application/json
Cookie: gb_session=your-session-token-here

{
  "displayName": "ShadowMaster",
  "avatarId": "m_swordsman",
  "imageUrl": "{{test_image_url}}"
}
```

**Expected Response:**
```json
{
  "ok": true,
  "data": {
    "wallet": "0x742d35Cc6A3e0b6cEfF4c9CE0C8cD3B8C4e9f2423",
    "displayName": "ShadowMaster",
    "avatarId": "m_swordsman",
    "imageUrl": "https://via.placeholder.com/400x400.png",
    "rank": "E",
    "level": 1,
    "xp": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 3.2 Get Profile by Address
```http
GET {{base_url}}/v1/profile/{{wallet_address}}
```

**Expected Response:**
```json
{
  "ok": true,
  "data": {
    "wallet": "0x742d35Cc6A3e0b6cEfF4c9CE0C8cD3B8C4e9f2423",
    "displayName": "ShadowMaster",
    "avatarId": "m_swordsman",
    "imageUrl": "https://via.placeholder.com/400x400.png",
    "rank": "E",
    "level": 1,
    "xp": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 3.3 Get Current User Profile
```http
GET {{base_url}}/v1/profile
Cookie: gb_session=your-session-token-here
```

**Same response as above**

#### 3.4 Get Leaderboard
```http
GET {{base_url}}/v1/profile/leaderboard/top?limit=10
```

**Expected Response:**
```json
{
  "ok": true,
  "data": [
    {
      "wallet": "0x742d35Cc6A3e0b6cEfF4c9CE0C8cD3B8C4e9f2423",
      "displayName": "ShadowMaster",
      "rank": "E",
      "level": 1,
      "xp": 0
    }
  ]
}
```

#### 3.5 Search Profiles
```http
GET {{base_url}}/v1/profile/search?q=shadow&limit=10
```

**Expected Response:**
```json
{
  "ok": true,
  "data": [
    {
      "wallet": "0x742d35Cc6A3e0b6cEfF4c9CE0C8cD3B8C4e9f2423",
      "displayName": "ShadowMaster",
      "avatarId": "m_swordsman",
      "rank": "E",
      "level": 1
    }
  ]
}
```

### **Phase 4: Media Upload** (Requires Authentication)

#### 4.1 Upload Profile Image
```http
POST {{base_url}}/v1/media/profile-image
Content-Type: multipart/form-data
Cookie: gb_session=your-session-token-here

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="test-image.jpg"
Content-Type: image/jpeg

[FILE CONTENT]
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

**Expected Response:**
```json
{
  "ok": true,
  "data": {
    "imageUrl": "https://your-cdn.com/profile-images/timestamp-hash.jpg",
    "contentHash": "sha256hash..."
  }
}
```

#### 4.2 Upload Relic Image
```http
POST {{base_url}}/v1/media/relic-image
Content-Type: multipart/form-data
Cookie: gb_session=your-session-token-here

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="relic-image.webp"
Content-Type: image/webp

[FILE CONTENT]
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="relicType"

SunspireBand
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="tokenId"

123
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="affixes"

{"+Crit":8,"+Dash i-frames":2}
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="rarity"

Epic
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

**Expected Response:**
```json
{
  "ok": true,
  "data": {
    "imageUrl": "https://your-cdn.com/relic-images/timestamp-hash.webp",
    "contentHash": "sha256hash...",
    "metadataUrl": "https://your-cdn.com/metadata/123.json",
    "metadataHash": "sha256hash..."
  }
}
```

## 🛠️ Development Workaround for Testing Without Wallet

**⚠️ WARNING**: This is for development testing only. In production, always use real wallet signatures.

### Option 1: Manual Cookie Injection
1. Complete steps 1-2 (challenge generation)
2. Skip step 3 (signature verification)
3. Manually set the `gb_session` cookie in Postman:
   - Go to Cookies tab in request
   - Add: `gb_session` = `your-jwt-token-here`
   - Use a valid JWT token (you can generate one manually for testing)

### Option 2: Test Script (Recommended for Development)
Create a test script that bypasses the signature requirement:

```javascript
// This is a development testing script
// In production, always use real wallet signatures

const testAddress = "0x742d35Cc6A3e0b6cEfF4c9CE0C8cD3B8C4e9f2423";

// Step 1: Generate challenge
pm.sendRequest({
    url: pm.environment.get("base_url") + "/v1/auth/challenge",
    method: "POST",
    header: {
        "Content-Type": "application/json"
    },
    body: {
        mode: "raw",
        raw: JSON.stringify({
            address: testAddress
        })
    }
}, function (err, response) {
    if (err) {
        console.log("Challenge generation failed:", err);
        return;
    }

    const challengeResponse = response.json();
    console.log("Challenge generated:", challengeResponse.data.nonce);

    // Step 2: Skip signature and manually create session
    // In development, you would normally sign the message here
    // For testing, we'll create a mock session

    const mockSessionToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIweDc0MmQzNUNjNkEzZTBiNmNFZmY0YzljRTBDOGNEM0I4QzRlOWYyNDIzIiwicm9sZXMiOlsidXNlciJdLCJ0eXBlIjoic2Vzc2lvbiIsImlhdCI6MTcwNDA2NzIwMCwiZXhwIjoxNzA0MDcwODAwLCJpc3MiOiJzaGFkb3ctbW9uYXJjaHMtcGF0aCIsImF1ZCI6IndlYi1jbGllbnQifQ.mock_signature";

    // Set cookie for subsequent requests
    pm.environment.set("session_cookie", "gb_session=" + mockSessionToken);

    console.log("Development session cookie set for testing");

    // Step 3: Test profile creation
    pm.sendRequest({
        url: pm.environment.get("base_url") + "/v1/profile",
        method: "POST",
        header: {
            "Content-Type": "application/json",
            "Cookie": pm.environment.get("session_cookie")
        },
        body: {
            mode: "raw",
            raw: JSON.stringify({
                displayName: "TestUser",
                avatarId: "m_swordsman",
                imageUrl: pm.environment.get("test_image_url")
            })
        }
    }, function (err, response) {
        if (err) {
            console.log("Profile creation failed:", err);
            return;
        }

        console.log("Profile created successfully:", response.json());
    });
});
```

## 📊 Database Verification

### MongoDB Atlas Connection
1. **Login to MongoDB Atlas**
2. **Navigate to your cluster**
3. **Go to Collections**
4. **Check the database**: `shadow-monarchs-path-dev` (development) or `shadow-monarchs-path-prod` (production)
5. **Collections to verify**:
   - `players` - Should contain your test profiles
   - `runs` - Will be populated when you implement runs
   - `parties` - Will be populated when you implement parties

### Example Database Document
```json
{
  "_id": "0x742d35cc6a3e0b6ceff4c9ce0c8cd3b8c4e9f2423",
  "wallet": "0x742d35cc6a3e0b6ceff4c9ce0c8cd3b8c4e9f2423",
  "displayName": "ShadowMaster",
  "displayNameLower": "shadowmaster",
  "avatarId": "m_swordsman",
  "imageUrl": "https://via.placeholder.com/400x400.png",
  "rank": "E",
  "level": 1,
  "xp": 0,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "Invalid signature" Error
- **Cause**: Wrong signature or corrupted message
- **Solution**: Ensure you're using the exact message from the challenge response

#### 2. "Profile not found" Error
- **Cause**: Profile hasn't been created yet or wrong address
- **Solution**: Create a profile first using POST `/v1/profile`

#### 3. "Unauthorized" Error
- **Cause**: Missing or invalid session cookie
- **Solution**: Complete the authentication flow first

#### 4. Database Connection Issues
- **Cause**: MongoDB URI not configured or connection failed
- **Solution**: Check your `.env` file and MongoDB Atlas connection

### Error Response Format
```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "additional": "context"
    }
  }
}
```

## 📝 Postman Collection Structure

```
Shadow Monarch's Path API
├── 1. Health & System
│   ├── Health Check
│   ├── Version Info
│   └── Detailed Health
├── 2. Authentication
│   ├── Generate Challenge
│   ├── Verify Signature
│   ├── Get Current User
│   └── Logout
├── 3. Profile Management
│   ├── Create Profile
│   ├── Get Profile by Address
│   ├── Get Current Profile
│   ├── Leaderboard
│   └── Search Profiles
└── 4. Media Upload
    ├── Upload Profile Image
    └── Upload Relic Image
```

## 🎯 Testing Checklist

- [ ] Health endpoints return 200 OK
- [ ] Auth challenge generates valid nonce
- [ ] Auth verify accepts valid signature
- [ ] Profile creation works with valid data
- [ ] Profile retrieval works by address
- [ ] Leaderboard shows created profiles
- [ ] Profile search works with partial names
- [ ] Database shows created documents
- [ ] Media upload creates files and metadata
- [ ] All error cases return proper error responses

## 🔧 Environment Variables Required

Make sure your `.env` file contains:
```env
NODE_ENV=development
DOMAIN=.lvh.me
PORT=4000
MONGODB_URI=mongodb://your-connection-string
STORAGE_BASE_URL=https://your-cdn.com
JWT_SECRET=your-secret-key
```

This comprehensive testing guide should help you verify that all components are working correctly!

