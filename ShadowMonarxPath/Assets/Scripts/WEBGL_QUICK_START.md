# WebGL Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Add WebGLBridge to Your Scene

1. Open your main game scene (e.g., `Dungeon.unity`)
2. Create a new empty GameObject: `GameObject > Create Empty`
3. Name it **"WebGLBridge"**
4. Add the script: `Add Component > WebGLBridge`
5. That's it! The bridge will automatically connect to GameManager

### Step 2: Configure Build Settings

1. Open `File > Build Settings`
2. Select **WebGL** platform
3. Click **Switch Platform** (if needed)
4. Click **Player Settings**
5. Go to **Resolution and Presentation**
6. Under **WebGL Template**, select **EventMinimal**
7. Close Player Settings

### Step 3: Build the Game

1. In Build Settings, click **Build**
2. Choose a folder (e.g., `Builds/WebGL`)
3. Wait for build to complete
4. Done! ✅

---

## 🧪 Testing Locally

### Option 1: Python (Easiest)

```bash
cd Builds/WebGL
python -m http.server 8000
```

Open: `http://localhost:8000`

### Option 2: Node.js

```bash
npx http-server Builds/WebGL -p 8000
```

Open: `http://localhost:8000`

### Test with Redirect URL

```
http://localhost:8000/?returnUrl=http://localhost:3000/results
```

---

## 🌐 Using the Game

### Basic Usage

Just host the game and share the URL:
```
https://yourgame.com/
```

### With Redirect URL

Add a redirect parameter to return users to your site:
```
https://yourgame.com/?returnUrl=https://yoursite.com/game-results
```

Or:
```
https://yourgame.com/?redirect=https://yoursite.com/game-results
```

---

## 📊 Handling Results

When the game completes or player dies, they'll be redirected with data:

### Game Completion
```
https://yoursite.com/game-results?gameCompleted=true&completionTime=1234.56&enemiesDefeated=25&bossDefeated=true&lootCollected=5&deathCount=2
```

### Player Death
```
https://yoursite.com/game-results?playerDied=true&survivalTime=567.89&deathPhase=Phase3&enemiesDefeated=15&checkpointsReached=2&deathCount=1
```

### Example: Reading Parameters in JavaScript

```javascript
const urlParams = new URLSearchParams(window.location.search);

if (urlParams.get('gameCompleted') === 'true') {
  const stats = {
    completionTime: parseFloat(urlParams.get('completionTime')),
    enemiesDefeated: parseInt(urlParams.get('enemiesDefeated')),
    bossDefeated: urlParams.get('bossDefeated') === 'true',
    lootCollected: parseInt(urlParams.get('lootCollected')),
    deathCount: parseInt(urlParams.get('deathCount'))
  };
  
  console.log('Victory!', stats);
  // Send to your backend, show results, etc.
}

if (urlParams.get('playerDied') === 'true') {
  const stats = {
    survivalTime: parseFloat(urlParams.get('survivalTime')),
    deathPhase: urlParams.get('deathPhase'),
    enemiesDefeated: parseInt(urlParams.get('enemiesDefeated')),
    checkpointsReached: parseInt(urlParams.get('checkpointsReached')),
    deathCount: parseInt(urlParams.get('deathCount'))
  };
  
  console.log('Game Over', stats);
  // Handle death, show retry option, etc.
}
```

---

## 🐛 Troubleshooting

### Game doesn't redirect after completion

1. Check browser console (F12) for errors
2. Verify WebGLBridge is in the scene
3. Make sure you're testing on a web server (not file://)

### "Cannot find function" error

1. Verify **EventMinimal** template is selected
2. Rebuild the game
3. Clear browser cache

### Redirect URL not working

1. Test with a simple URL: `?returnUrl=https://google.com`
2. Check URL encoding is correct
3. Verify the target URL is accessible

---

## 📚 Need More Details?

See the full guide: `WEBGL_BUILD_GUIDE.md`

---

## ✅ Checklist

- [ ] WebGLBridge added to scene
- [ ] EventMinimal template selected
- [ ] Game built successfully
- [ ] Tested locally
- [ ] Redirect URL working
- [ ] Ready to deploy! 🎉
