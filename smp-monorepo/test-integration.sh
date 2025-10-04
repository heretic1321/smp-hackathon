#!/bin/bash

echo "🧪 Testing Shadow Monarch's Path Integration"
echo "============================================="

# Test 1: Backend Health
echo "1. Testing backend health..."
curl -s http://localhost:4000/v1/health | jq -r '.data.status' 2>/dev/null || echo "❌ Backend not responding"

# Test 2: Seed Gates
echo "2. Seeding gates..."
curl -s -X POST http://localhost:4000/v1/gates/seed -H "Content-Type: application/json" | jq '.data.count' 2>/dev/null || echo "❌ Gates seeding failed"

# Test 3: Create Test Run
echo "3. Creating test run..."
curl -s -X POST http://localhost:4000/v1/runs/create-test/C_FROST -H "Content-Type: application/json" | jq '.data.runId' 2>/dev/null || echo "❌ Test run creation failed"

echo ""
echo "✅ Integration test complete!"
echo "🎮 Try the Dev Panel in your browser at http://app.lvh.me:3000"

