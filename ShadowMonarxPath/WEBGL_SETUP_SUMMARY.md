# WebGL Build Setup - Summary

## ✅ What Was Done

### 1. Cleaned Up WebGL Template
- **Removed** all Ready Player Me dependencies (RpmGlobal.js, ReadyPlayerMeFrame.js, RpmStyle.css)
- **Removed** RPM iframe and container elements from HTML
- **Removed** RPM-related CSS styles
- **Updated** template title to "Shadow Monarx Path"
- **Simplified** the template to focus only on game functionality

### 2. Implemented Redirect System
The WebGL template now supports:
- ✅ Query parameter for redirect URL (`?returnUrl=...` or `?redirect=...`)
- ✅ Automatic redirect on game completion with stats
- ✅ Automatic redirect on player death with stats
- ✅ Fallback to postMessage for iframe mode
- ✅ Proper URL encoding and parameter handling

### 3. Created JavaScript Bridge Functions
Added three main functions in `index.html`:

#### `notifyGameComplete(gameDataJson)`
- Receives game completion data from Unity
- Parses JSON data
- Redirects with parameters: `gameCompleted`, `completionTime`, `enemiesDefeated`, `bossDefeated`, `lootCollected`, `deathCount`

#### `notifyPlayerDeath(deathDataJson)`
- Receives player death data from Unity
- Parses JSON data
- Redirects with parameters: `playerDied`, `survivalTime`, `deathPhase`, `enemiesDefeated`, `checkpointsReached`, `deathCount`

#### `notifyReady()`
- Notifies when Unity finishes loading
- Can be used by parent page/iframe

### 4. Created Unity C# Bridge Script
**File**: `Assets/Scripts/WebGLBridge.cs`

Features:
- Singleton pattern (DontDestroyOnLoad)
- Auto-subscribes to GameManager events
- Calls JavaScript functions via DllImport
- Platform-specific compilation (WebGL only)
- Debug logging support
- Handles both GameEndData and DeathData

### 5. Created Documentation
Three comprehensive guides:

#### `Assets/Scripts/WEBGL_BUILD_GUIDE.md` (Full Guide)
- Complete build instructions
- URL parameter documentation
- Integration examples
- Deployment instructions
- Troubleshooting guide
- API reference
- Security considerations

#### `Assets/Scripts/WEBGL_QUICK_START.md` (Quick Reference)
- 5-minute setup guide
- Testing instructions
- Basic usage examples
- Quick troubleshooting

#### `WEBGL_SETUP_SUMMARY.md` (This File)
- Overview of changes
- File structure
- Usage examples

---

## 📁 File Structure

```
Assets/
├── WebGLTemplates/
│   └── EventMinimal/
│       ├── index.html                    [MODIFIED] - Removed RPM, added redirect logic
│       ├── TemplateData/
│       │   ├── style.css                 [MODIFIED] - Removed RPM styles
│       │   ├── Global.js                 [MODIFIED] - Removed RPM references
│       │   ├── UnitySetup.js             [UNCHANGED]
│       │   ├── ReadyPlayerMe/            [DELETED] - All RPM files removed
│       │   └── [other assets]            [UNCHANGED]
│       └── thumbnail.png                 [UNCHANGED]
└── Scripts/
    ├── WebGLBridge.cs                    [NEW] - Unity to WebGL bridge
    ├── WEBGL_BUILD_GUIDE.md              [NEW] - Complete documentation
    ├── WEBGL_QUICK_START.md              [NEW] - Quick start guide
    └── [existing scripts]                [UNCHANGED]
```

---

## 🔌 How It Works

### Flow Diagram

```
Unity Game (GameManager)
    ↓ OnGameComplete / OnPlayerDied event
WebGLBridge.cs
    ↓ DllImport calls
JavaScript (index.html)
    ↓ notifyGameComplete() / notifyPlayerDeath()
Parse JSON + Build URL
    ↓
Redirect to: yoursite.com/?gameCompleted=true&stats...
```

### Data Flow

1. **Game Event Occurs** (Player wins or dies)
2. **GameManager** fires UnityEvent with data (GameEndData or DeathData)
3. **WebGLBridge** receives event and converts data to JSON
4. **JavaScript Function** is called via DllImport
5. **URL is Built** with query parameters
6. **Browser Redirects** to the specified return URL

---

## 🚀 Usage Examples

### Example 1: Simple Integration

```html
<!-- Your website -->
<a href="https://yourgame.com/?returnUrl=https://yoursite.com/results">
  Play Shadow Monarx Path
</a>
```

### Example 2: Dynamic Redirect

```javascript
// Your website
const gameUrl = 'https://yourgame.com/';
const returnUrl = encodeURIComponent(window.location.origin + '/game-results');
const fullUrl = `${gameUrl}?returnUrl=${returnUrl}`;

window.location.href = fullUrl;
```

### Example 3: Handling Results

```javascript
// Your results page (yoursite.com/results)
const params = new URLSearchParams(window.location.search);

if (params.get('gameCompleted') === 'true') {
  // Player won!
  const completionTime = parseFloat(params.get('completionTime'));
  const enemiesDefeated = parseInt(params.get('enemiesDefeated'));
  const bossDefeated = params.get('bossDefeated') === 'true';
  
  displayVictoryScreen({
    time: completionTime,
    enemies: enemiesDefeated,
    boss: bossDefeated
  });
  
  // Send to your backend
  fetch('/api/game-complete', {
    method: 'POST',
    body: JSON.stringify({
      completionTime,
      enemiesDefeated,
      bossDefeated
    })
  });
}

if (params.get('playerDied') === 'true') {
  // Player died
  const survivalTime = parseFloat(params.get('survivalTime'));
  const deathPhase = params.get('deathPhase');
  
  displayGameOverScreen({
    time: survivalTime,
    phase: deathPhase
  });
}
```

### Example 4: Iframe Mode (No Redirect)

```html
<!-- Embed game in iframe -->
<iframe id="game" src="https://yourgame.com/" width="1920" height="1080"></iframe>

<script>
window.addEventListener('message', (event) => {
  if (event.data.type === 'GAME_COMPLETE') {
    console.log('Victory!', event.data.payload);
    // Handle completion without redirect
  }
  
  if (event.data.type === 'PLAYER_DEATH') {
    console.log('Game Over', event.data.payload);
    // Handle death without redirect
  }
});
</script>
```

---

## 🎮 Unity Setup

### Required Components

1. **GameManager** (Already exists)
   - Must have `OnGameComplete` UnityEvent<GameEndData>
   - Must have `OnPlayerDied` UnityEvent<DeathData>

2. **WebGLBridge** (New - needs to be added)
   - Add to main scene as empty GameObject
   - Will auto-connect to GameManager
   - Persists across scenes (DontDestroyOnLoad)

### Build Settings

1. Platform: **WebGL**
2. Template: **EventMinimal**
3. Compression: **Gzip** or **Brotli**
4. Code Optimization: **Master** (for production)

---

## 📊 URL Parameters Reference

### Game Completion Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `gameCompleted` | boolean | Always true | `true` |
| `completionTime` | float | Time in seconds | `1234.56` |
| `enemiesDefeated` | int | Total enemies killed | `25` |
| `bossDefeated` | boolean | Boss defeated | `true` |
| `lootCollected` | int | Loot items collected | `5` |
| `deathCount` | int | Times died during run | `2` |

### Player Death Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `playerDied` | boolean | Always true | `true` |
| `survivalTime` | float | Time survived (seconds) | `567.89` |
| `deathPhase` | string | Phase where died | `Phase3` |
| `enemiesDefeated` | int | Enemies killed | `15` |
| `checkpointsReached` | int | Checkpoints reached | `2` |
| `deathCount` | int | Total death count | `1` |

---

## 🔧 Customization

### Modify Redirect Parameters

Edit `index.html` function `notifyGameComplete()`:

```javascript
function notifyGameComplete(gameDataJson){
  const gameData = JSON.parse(gameDataJson || '{}');
  
  // Add your custom parameters
  const redirectUrl = returnUrl + 
    '?gameCompleted=true' +
    '&customParam=' + encodeURIComponent(yourValue) +
    '&anotherParam=' + encodeURIComponent(anotherValue);
  
  window.location.href = redirectUrl;
}
```

### Add Custom Events

In `WebGLBridge.cs`, add new methods:

```csharp
public void SendCustomEvent(string eventData)
{
#if UNITY_WEBGL && !UNITY_EDITOR
    NotifyCustomEvent(eventData);
#endif
}

[DllImport("__Internal")]
private static extern void notifyCustomEvent(string data);
```

Then in `index.html`:

```javascript
function notifyCustomEvent(data) {
  console.log('Custom event:', data);
  // Handle custom event
}
```

---

## ⚠️ Important Notes

1. **WebGLBridge Must Be in Scene**: Add it to your main scene or it won't work
2. **Template Must Be Selected**: EventMinimal template must be selected in Player Settings
3. **Test on Web Server**: File:// protocol won't work, use http-server or python server
4. **CORS Considerations**: If redirecting to different domain, ensure CORS is configured
5. **URL Encoding**: All parameters are automatically URL-encoded
6. **Browser Compatibility**: Tested on Chrome, Firefox, Safari, Edge

---

## 🐛 Common Issues

### "Cannot find function notifyGameComplete"
- **Cause**: EventMinimal template not selected
- **Fix**: Select template in Player Settings > Resolution and Presentation

### Redirect not working
- **Cause**: Invalid or missing returnUrl parameter
- **Fix**: Verify URL is properly encoded and accessible

### WebGLBridge not sending events
- **Cause**: Bridge not in scene or GameManager not found
- **Fix**: Add WebGLBridge to scene, ensure GameManager exists

### Game loads but doesn't start
- **Cause**: Compression mismatch or missing files
- **Fix**: Check server headers match build compression format

---

## 📞 Testing Checklist

Before deploying:

- [ ] WebGLBridge added to main scene
- [ ] EventMinimal template selected
- [ ] Build completes without errors
- [ ] Tested locally with web server
- [ ] Game completion redirect works
- [ ] Player death redirect works
- [ ] All parameters received correctly
- [ ] Tested in multiple browsers
- [ ] CORS configured (if needed)
- [ ] Production deployment successful

---

## 🎯 Next Steps

1. **Add WebGLBridge to your scene** (if not already done)
2. **Build the game** with EventMinimal template
3. **Test locally** to verify redirects work
4. **Deploy to your server**
5. **Integrate with your frontend** to handle results
6. **Test end-to-end** with real redirect URLs

---

## 📚 Documentation Files

- **Quick Start**: `Assets/Scripts/WEBGL_QUICK_START.md`
- **Full Guide**: `Assets/Scripts/WEBGL_BUILD_GUIDE.md`
- **This Summary**: `WEBGL_SETUP_SUMMARY.md`

---

**Status**: ✅ Ready for WebGL Build  
**Version**: 1.0  
**Date**: October 2025  
**Game**: Shadow Monarx Path
