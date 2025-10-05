# EventMinimal WebGL Template

## Overview

Clean, fullscreen WebGL template for Shadow Monarx Path with built-in redirect support for game completion and player death events.

## Features

- ✅ **Fullscreen Experience**: No UI clutter, just the game
- ✅ **Redirect Support**: Automatic redirect with game stats
- ✅ **Dual Mode**: Works with both redirects and iframe postMessage
- ✅ **Clean Codebase**: No third-party dependencies
- ✅ **Mobile Friendly**: Responsive design for all devices
- ✅ **Loading Screen**: Smooth poster-to-game transition

## Template Structure

```
EventMinimal/
├── index.html              # Main template with redirect logic
├── TemplateData/
│   ├── style.css          # Fullscreen styles
│   ├── Global.js          # Canvas initialization
│   ├── UnitySetup.js      # Unity loader configuration
│   ├── favicon.ico        # Browser icon
│   ├── poster.png         # Loading screen image
│   └── [progress bars, logos, etc.]
├── thumbnail.png          # Template preview in Unity
└── README.md             # This file
```

## JavaScript Functions

### `notifyReady()`
Called when Unity finishes loading.

```javascript
function notifyReady() {
  // Notify parent/iframe that game is ready
  parent?.postMessage({type:'UNITY_READY'}, '*')
}
```

### `notifyGameComplete(gameDataJson)`
Called when player completes the game.

**Parameters:**
- `gameDataJson` (string): JSON string of GameEndData

**Behavior:**
- If `returnUrl` exists: Redirects with query parameters
- Otherwise: Sends postMessage to parent

**Redirect URL Example:**
```
https://yoursite.com/?gameCompleted=true&completionTime=1234.56&enemiesDefeated=25&bossDefeated=true&lootCollected=5&deathCount=2
```

### `notifyPlayerDeath(deathDataJson)`
Called when player dies.

**Parameters:**
- `deathDataJson` (string): JSON string of DeathData

**Behavior:**
- If `returnUrl` exists: Redirects with query parameters
- Otherwise: Sends postMessage to parent

**Redirect URL Example:**
```
https://yoursite.com/?playerDied=true&survivalTime=567.89&deathPhase=Phase3&enemiesDefeated=15&checkpointsReached=2&deathCount=1
```

### `notifyExit()`
Optional manual exit function.

**Behavior:**
- Redirects to returnUrl with `exitFromUnity=true`
- Or sends EXIT_GAME postMessage

## Query Parameters

### Input Parameters

| Parameter | Alias | Description | Example |
|-----------|-------|-------------|---------|
| `returnUrl` | `redirect` | URL to redirect after game ends | `https://yoursite.com/results` |

### Output Parameters (Game Complete)

| Parameter | Type | Description |
|-----------|------|-------------|
| `gameCompleted` | boolean | Always `true` |
| `completionTime` | float | Time in seconds |
| `enemiesDefeated` | int | Total enemies killed |
| `bossDefeated` | boolean | Boss defeated |
| `lootCollected` | int | Loot items collected |
| `deathCount` | int | Times died |

### Output Parameters (Player Death)

| Parameter | Type | Description |
|-----------|------|-------------|
| `playerDied` | boolean | Always `true` |
| `survivalTime` | float | Time survived (seconds) |
| `deathPhase` | string | Phase where died |
| `enemiesDefeated` | int | Enemies killed |
| `checkpointsReached` | int | Checkpoints reached |
| `deathCount` | int | Total deaths |

## Usage Examples

### Basic Usage

```html
<a href="https://yourgame.com/">Play Game</a>
```

### With Redirect

```html
<a href="https://yourgame.com/?returnUrl=https://yoursite.com/results">
  Play Game
</a>
```

### Dynamic Redirect

```javascript
const gameUrl = 'https://yourgame.com/';
const returnUrl = encodeURIComponent(window.location.origin + '/results');
window.location.href = `${gameUrl}?returnUrl=${returnUrl}`;
```

### Iframe Mode

```html
<iframe src="https://yourgame.com/" width="1920" height="1080"></iframe>

<script>
window.addEventListener('message', (event) => {
  if (event.data.type === 'GAME_COMPLETE') {
    console.log('Victory!', event.data.payload);
  }
  if (event.data.type === 'PLAYER_DEATH') {
    console.log('Game Over', event.data.payload);
  }
});
</script>
```

## Customization

### Change Loading Poster

Replace `TemplateData/poster.png` with your own image (recommended: 1920x1080).

### Modify Redirect Parameters

Edit the `notifyGameComplete()` or `notifyPlayerDeath()` functions in `index.html`:

```javascript
function notifyGameComplete(gameDataJson){
  const gameData = JSON.parse(gameDataJson || '{}');
  
  // Add custom parameters
  const redirectUrl = returnUrl + 
    '?gameCompleted=true' +
    '&customParam=' + encodeURIComponent(yourValue);
  
  window.location.href = redirectUrl;
}
```

### Change Styles

Edit `TemplateData/style.css` to customize appearance.

### Disable Auto-Redirect

Comment out or remove the redirect logic:

```javascript
function notifyGameComplete(gameDataJson){
  const gameData = JSON.parse(gameDataJson);
  
  // Instead of redirecting, do something else
  console.log('Game completed!', gameData);
  showCustomUI(gameData);
}
```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Notes

- Template uses minimal JavaScript
- No external dependencies
- Fullscreen canvas for optimal performance
- Mobile-optimized with `devicePixelRatio = 1`

## Security

- All parameters are URL-encoded
- No eval() or dangerous functions
- CORS-friendly
- Works in iframes (with proper headers)

## Troubleshooting

### Game doesn't load
- Check browser console for errors
- Verify all files are uploaded
- Check server compression headers

### Redirect doesn't work
- Verify returnUrl is properly encoded
- Check that target URL is accessible
- Test with simple URL: `?returnUrl=https://google.com`

### Functions not found
- Ensure template is selected in Unity Player Settings
- Rebuild the game
- Clear browser cache

## Related Files

- **Unity Bridge**: `Assets/Scripts/WebGLBridge.cs`
- **Quick Start**: `Assets/Scripts/WEBGL_QUICK_START.md`
- **Full Guide**: `Assets/Scripts/WEBGL_BUILD_GUIDE.md`
- **Example**: `Assets/Scripts/EXAMPLE_INTEGRATION.html`

## Version

**Version**: 1.0  
**Last Updated**: October 2025  
**Game**: Shadow Monarx Path

## License

Part of Shadow Monarx Path project.
