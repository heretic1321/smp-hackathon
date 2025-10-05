# WebGL Build Guide - Shadow Monarx Path

## Overview

This guide explains how to build and deploy the Shadow Monarx Path game as a WebGL application with proper redirect handling for game completion and player death events.

## Features

The WebGL template includes:
- ✅ Clean, fullscreen game experience
- ✅ Automatic redirect on game completion with stats
- ✅ Automatic redirect on player death with stats
- ✅ Support for both redirect URLs and iframe postMessage
- ✅ Query parameter support for return URLs
- ✅ No Ready Player Me or other third-party dependencies

---

## Building for WebGL

### 1. Unity Build Settings

1. Open **File > Build Settings**
2. Select **WebGL** platform
3. Click **Switch Platform** (if not already on WebGL)
4. Select the **EventMinimal** template:
   - Click **Player Settings**
   - Go to **Resolution and Presentation**
   - Under **WebGL Template**, select **EventMinimal**
5. Configure build settings:
   - **Compression Format**: Gzip or Brotli (recommended)
   - **Enable Exceptions**: None (for smaller build size)
   - **Code Optimization**: Master (for production)

### 2. Add WebGLBridge to Scene

The `WebGLBridge` component must be present in your game scene:

1. Create an empty GameObject in your main scene
2. Name it "WebGLBridge"
3. Add the `WebGLBridge.cs` script component
4. The bridge will automatically:
   - Subscribe to GameManager events
   - Send data to JavaScript when game completes or player dies
   - Persist across scene loads (DontDestroyOnLoad)

**Important**: The WebGLBridge will automatically find and connect to the GameManager. Make sure GameManager is initialized before the bridge.

### 3. Build the Game

1. Click **Build** in Build Settings
2. Choose output folder (e.g., `Builds/WebGL`)
3. Wait for build to complete
4. Test locally using a web server (see Testing section)

---

## URL Parameters

### Redirect URL

The game accepts a redirect URL via query parameters:

```
https://yourgame.com/?returnUrl=https://yourwebsite.com/game-complete
```

Or:

```
https://yourgame.com/?redirect=https://yourwebsite.com/game-complete
```

Both `returnUrl` and `redirect` parameters are supported.

### Game Completion Redirect

When the player completes the game, they will be redirected to:

```
https://yourwebsite.com/game-complete?gameCompleted=true&completionTime=1234.56&enemiesDefeated=25&bossDefeated=true&lootCollected=5&deathCount=2
```

**Parameters:**
- `gameCompleted=true` - Always true for completion
- `completionTime` - Total time in seconds (float)
- `enemiesDefeated` - Total number of enemies defeated
- `bossDefeated` - Whether boss was defeated (true/false)
- `lootCollected` - Number of loot items collected
- `deathCount` - Number of times player died during the run

### Player Death Redirect

When the player dies, they will be redirected to:

```
https://yourwebsite.com/game-over?playerDied=true&survivalTime=567.89&deathPhase=Phase3&enemiesDefeated=15&checkpointsReached=2&deathCount=1
```

**Parameters:**
- `playerDied=true` - Always true for death
- `survivalTime` - Time survived in seconds (float)
- `deathPhase` - Which phase player died in (e.g., "Phase1", "Phase2", "BossFight")
- `enemiesDefeated` - Total number of enemies defeated before death
- `checkpointsReached` - Number of checkpoints reached
- `deathCount` - Number of times player died total

---

## Integration Examples

### Example 1: Simple Redirect

Host the game and provide a return URL:

```html
<a href="https://yourgame.com/?returnUrl=https://yoursite.com/results">
  Play Shadow Monarx Path
</a>
```

### Example 2: Handling Results in Your Frontend

```javascript
// In your results page
const urlParams = new URLSearchParams(window.location.search);

if (urlParams.get('gameCompleted') === 'true') {
  const stats = {
    completionTime: parseFloat(urlParams.get('completionTime')),
    enemiesDefeated: parseInt(urlParams.get('enemiesDefeated')),
    bossDefeated: urlParams.get('bossDefeated') === 'true',
    lootCollected: parseInt(urlParams.get('lootCollected')),
    deathCount: parseInt(urlParams.get('deathCount'))
  };
  
  console.log('Game completed!', stats);
  // Send to your backend, display results, etc.
}

if (urlParams.get('playerDied') === 'true') {
  const deathStats = {
    survivalTime: parseFloat(urlParams.get('survivalTime')),
    deathPhase: urlParams.get('deathPhase'),
    enemiesDefeated: parseInt(urlParams.get('enemiesDefeated')),
    checkpointsReached: parseInt(urlParams.get('checkpointsReached')),
    deathCount: parseInt(urlParams.get('deathCount'))
  };
  
  console.log('Player died', deathStats);
  // Handle death, show retry screen, etc.
}
```

### Example 3: Iframe Integration (Alternative)

If you embed the game in an iframe, you can also listen for postMessage events:

```javascript
window.addEventListener('message', (event) => {
  if (event.data.type === 'GAME_COMPLETE') {
    console.log('Game completed!', event.data.payload);
    // Handle completion
  }
  
  if (event.data.type === 'PLAYER_DEATH') {
    console.log('Player died!', event.data.payload);
    // Handle death
  }
  
  if (event.data.type === 'UNITY_READY') {
    console.log('Unity is ready!');
    // Game has loaded
  }
});
```

```html
<iframe src="https://yourgame.com" width="1920" height="1080"></iframe>
```

---

## Testing Locally

### Using Python (Recommended)

```bash
cd Builds/WebGL
python -m http.server 8000
```

Then visit: `http://localhost:8000`

### Using Node.js

```bash
npx http-server Builds/WebGL -p 8000
```

### Testing with Redirect URL

```
http://localhost:8000/?returnUrl=http://localhost:3000/results
```

---

## Deployment

### 1. Upload Build Files

Upload the entire build folder to your web server:
- `index.html`
- `Build/` folder (contains .data, .wasm, .framework, .loader files)
- `TemplateData/` folder (contains assets, CSS, JS)
- `StreamingAssets/` folder (if present)

### 2. Configure Server Headers

For optimal performance and compatibility, configure your web server:

#### Compression (Gzip)

If using Gzip compression, add these headers:

```apache
# Apache (.htaccess)
<IfModule mod_mime.c>
  AddEncoding gzip .gz
  AddType application/octet-stream .data.gz
  AddType application/wasm .wasm.gz
  AddType application/javascript .js.gz
  AddType application/octet-stream .symbols.json.gz
</IfModule>
```

```nginx
# Nginx
location ~ \.gz$ {
    add_header Content-Encoding gzip;
    add_header Content-Type application/octet-stream;
}
```

#### CORS Headers (if needed)

```apache
# Apache
Header set Access-Control-Allow-Origin "*"
```

```nginx
# Nginx
add_header Access-Control-Allow-Origin *;
```

### 3. CDN Deployment (Optional)

You can deploy to CDN services like:
- **Vercel**: Drag and drop build folder
- **Netlify**: Drag and drop build folder
- **AWS S3 + CloudFront**: Upload and configure static hosting
- **GitHub Pages**: Push to gh-pages branch

---

## Troubleshooting

### Issue: Game doesn't redirect after completion

**Solution**: 
1. Check browser console for errors
2. Verify `WebGLBridge` component is in the scene
3. Ensure GameManager events are firing
4. Test with `enableDebugLogs = true` in WebGLBridge

### Issue: "Cannot find function notifyGameComplete"

**Solution**: 
- This error occurs when building for WebGL but the template isn't selected
- Make sure **EventMinimal** template is selected in Player Settings
- Rebuild the game

### Issue: Redirect URL not working

**Solution**:
1. Check URL encoding: `?returnUrl=https%3A%2F%2Fyoursite.com`
2. Verify the URL is accessible (no CORS issues)
3. Test with a simple URL first: `?returnUrl=https://google.com`

### Issue: Game loads but stays on loading screen

**Solution**:
1. Check browser console for errors
2. Verify all build files are uploaded correctly
3. Check server compression headers match build compression format
4. Test in different browsers (Chrome, Firefox, Safari)

### Issue: Build size too large

**Solution**:
1. Use **Brotli** compression (smallest)
2. Set Code Optimization to **Master**
3. Disable exceptions: **None**
4. Strip engine code in Player Settings
5. Use texture compression (ASTC, DXT5, etc.)

---

## Advanced Configuration

### Custom Redirect Logic

You can modify the redirect behavior in `index.html`:

```javascript
// Custom redirect with additional parameters
function notifyGameComplete(gameDataJson){
  const gameData = JSON.parse(gameDataJson || '{}');
  
  // Add custom parameters
  const redirectUrl = returnUrl + 
    '?gameCompleted=true' +
    '&score=' + calculateScore(gameData) +
    '&rank=' + calculateRank(gameData);
  
  window.location.href = redirectUrl;
}
```

### Disable Auto-Redirect

If you want to handle the data without redirecting:

```javascript
function notifyGameComplete(gameDataJson){
  const gameData = JSON.parse(gameDataJson);
  
  // Send to your API instead of redirecting
  fetch('https://yourapi.com/game-complete', {
    method: 'POST',
    body: JSON.stringify(gameData)
  });
  
  // Show custom UI
  showVictoryScreen(gameData);
}
```

### Manual Exit Button

You can add a manual exit button in Unity that calls:

```csharp
WebGLBridge.Instance.ExitGame();
```

This will trigger the `notifyExit()` function in JavaScript.

---

## API Reference

### JavaScript Functions (in index.html)

#### `notifyReady()`
Called when Unity finishes loading.

#### `notifyGameComplete(gameDataJson)`
Called when player completes the game.
- **Parameter**: JSON string of GameEndData

#### `notifyPlayerDeath(deathDataJson)`
Called when player dies.
- **Parameter**: JSON string of DeathData

#### `notifyExit()`
Called for manual exit (optional).

### C# API (WebGLBridge.cs)

#### `WebGLBridge.Instance`
Singleton instance of the bridge.

#### `ExitGame()`
Manually trigger exit/redirect.

---

## Data Structures

### GameEndData (JSON)

```json
{
  "gameCompleted": true,
  "completionTime": 1234.56,
  "completionTimestamp": "2025-10-05T12:34:56Z",
  "totalEnemiesDefeated": 25,
  "enemiesDefeatedPhase2": 3,
  "enemiesDefeatedPhase4": 5,
  "bossDefeated": true,
  "phase1Completed": true,
  "phase2Completed": true,
  "phase3Completed": true,
  "phase4Completed": true,
  "bossFightCompleted": true,
  "lootItemsCollected": 5,
  "collectedLootNames": ["Relic1", "Relic2", "Relic3"],
  "finalHealthPercentage": 75.5,
  "deathCount": 2
}
```

### DeathData (JSON)

```json
{
  "playerDied": true,
  "survivalTime": 567.89,
  "deathTimestamp": "2025-10-05T12:45:00Z",
  "deathPhase": "Phase3",
  "checkpointsReached": 2,
  "phase1Completed": true,
  "phase2Completed": true,
  "phase3Completed": false,
  "phase4Completed": false,
  "reachedBossFight": false,
  "totalEnemiesDefeated": 15,
  "enemiesDefeatedPhase2": 3,
  "enemiesDefeatedPhase4": 0,
  "deathCount": 1,
  "lastHealthPercentage": 0,
  "deathPosition": {"x": 10.5, "y": 2.0, "z": -5.3}
}
```

---

## Security Considerations

1. **Validate Redirect URLs**: Consider whitelisting allowed redirect domains
2. **Sanitize Parameters**: Always validate and sanitize URL parameters on your backend
3. **HTTPS Only**: Use HTTPS for production deployments
4. **Rate Limiting**: Implement rate limiting on your results endpoint
5. **Data Validation**: Verify game data integrity on your backend

---

## Support

For issues or questions:
1. Check browser console for errors
2. Enable debug logs in WebGLBridge
3. Test in different browsers
4. Verify all build files are present and correctly uploaded

---

## Summary Checklist

- [ ] WebGLBridge component added to scene
- [ ] EventMinimal template selected in Player Settings
- [ ] Build completed successfully
- [ ] Tested locally with web server
- [ ] Redirect URL working correctly
- [ ] Game completion redirect tested
- [ ] Player death redirect tested
- [ ] Server headers configured (if using compression)
- [ ] Deployed to production server
- [ ] Frontend integration completed

---

**Version**: 1.0  
**Last Updated**: October 2025  
**Game**: Shadow Monarx Path
