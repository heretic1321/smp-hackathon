# WebGL Build Checklist

Use this checklist to ensure your WebGL build is properly configured and ready for deployment.

## Pre-Build Setup

### ✅ Scene Setup
- [ ] Open your main game scene (e.g., `Dungeon.unity`)
- [ ] Create empty GameObject named "WebGLBridge"
- [ ] Add `WebGLBridge.cs` component to the GameObject
- [ ] Verify `GameManager` exists in the scene
- [ ] Test that game completion/death events fire correctly in Editor

### ✅ Unity Build Settings
- [ ] Open `File > Build Settings`
- [ ] Select **WebGL** platform
- [ ] Click **Switch Platform** (wait for reimport if needed)
- [ ] Add your main scene to "Scenes In Build"
- [ ] Verify scene order is correct

### ✅ Player Settings
- [ ] Click **Player Settings** in Build Settings
- [ ] Navigate to **Resolution and Presentation**
- [ ] Set **WebGL Template** to **EventMinimal**
- [ ] Set **Default Canvas Width** (e.g., 1920)
- [ ] Set **Default Canvas Height** (e.g., 1080)

### ✅ Publishing Settings
- [ ] Go to **Publishing Settings** (in Player Settings)
- [ ] Set **Compression Format**: Gzip or Brotli (recommended)
- [ ] Enable **Data Caching** (for faster subsequent loads)
- [ ] Set **Enable Exceptions**: None (for smaller build size)

### ✅ Other Settings
- [ ] Go to **Other Settings** (in Player Settings)
- [ ] Set **Color Space**: Linear (for better graphics)
- [ ] Set **Auto Graphics API**: Enabled
- [ ] Set **Scripting Backend**: IL2CPP (recommended)
- [ ] Set **API Compatibility Level**: .NET Standard 2.1

### ✅ Optimization Settings
- [ ] Go to **Optimization** (in Player Settings)
- [ ] Set **Code Optimization**: Master (for production)
- [ ] Enable **Strip Engine Code**: Yes
- [ ] Set **Managed Stripping Level**: High (for smaller build)

---

## Building

### ✅ Build Process
- [ ] Click **Build** (not "Build And Run" for first build)
- [ ] Choose output folder (e.g., `Builds/WebGL`)
- [ ] Wait for build to complete (may take 5-30 minutes)
- [ ] Check console for any errors or warnings
- [ ] Verify build folder contains:
  - `index.html`
  - `Build/` folder
  - `TemplateData/` folder
  - `StreamingAssets/` folder (if applicable)

### ✅ Build Output Verification
- [ ] Check `Build/` folder contains:
  - `.data` or `.data.gz` file
  - `.wasm` or `.wasm.gz` file
  - `.framework.js` or `.framework.js.gz` file
  - `.loader.js` file
- [ ] Verify file sizes are reasonable:
  - Total build < 200MB (ideally < 100MB)
  - Individual files not corrupted (size > 0)

---

## Local Testing

### ✅ Setup Local Server
Choose one method:

**Python (Recommended):**
```bash
cd Builds/WebGL
python -m http.server 8000
```

**Node.js:**
```bash
npx http-server Builds/WebGL -p 8000
```

**VS Code Extension:**
- Install "Live Server" extension
- Right-click `index.html` > "Open with Live Server"

### ✅ Basic Testing
- [ ] Open browser to `http://localhost:8000`
- [ ] Game loads without errors
- [ ] Loading screen appears and disappears
- [ ] Game is playable
- [ ] Controls work correctly
- [ ] Audio plays correctly
- [ ] Graphics render properly

### ✅ Console Testing
- [ ] Open browser console (F12)
- [ ] Check for "ShadowMonarxPath: Return URL from params" message
- [ ] Check for "[WebGLBridge]" debug messages
- [ ] Verify no JavaScript errors
- [ ] Verify no Unity errors

### ✅ Redirect Testing
- [ ] Test with redirect URL: `http://localhost:8000/?returnUrl=http://localhost:3000`
- [ ] Play through to game completion
- [ ] Verify redirect happens with correct parameters
- [ ] Check URL contains: `gameCompleted=true`, `completionTime`, etc.

### ✅ Death Testing
- [ ] Test with redirect URL
- [ ] Let player die in game
- [ ] Verify redirect happens with correct parameters
- [ ] Check URL contains: `playerDied=true`, `survivalTime`, etc.

### ✅ Browser Compatibility
Test in multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Edge
- [ ] Mobile browser (Chrome Mobile or Safari iOS)

---

## Deployment Preparation

### ✅ Server Requirements
- [ ] Web server with HTTPS support
- [ ] Sufficient storage for build files (100-200MB typical)
- [ ] CORS headers configured (if needed)
- [ ] Compression headers configured (if using Gzip/Brotli)

### ✅ Compression Headers
If using **Gzip** compression, configure server:

**Apache (.htaccess):**
```apache
<IfModule mod_mime.c>
  AddEncoding gzip .gz
  AddType application/octet-stream .data.gz
  AddType application/wasm .wasm.gz
  AddType application/javascript .js.gz
</IfModule>
```

**Nginx:**
```nginx
location ~ \.gz$ {
    add_header Content-Encoding gzip;
}
```

### ✅ CORS Headers (if needed)
If game assets are on different domain:

**Apache:**
```apache
Header set Access-Control-Allow-Origin "*"
```

**Nginx:**
```nginx
add_header Access-Control-Allow-Origin *;
```

### ✅ File Upload
- [ ] Upload entire build folder to server
- [ ] Preserve folder structure
- [ ] Verify all files uploaded correctly
- [ ] Check file permissions (readable by web server)

---

## Post-Deployment Testing

### ✅ Production Testing
- [ ] Open game URL in browser
- [ ] Game loads without errors
- [ ] Test game completion flow
- [ ] Test player death flow
- [ ] Test redirect with real return URL
- [ ] Verify parameters received correctly

### ✅ Performance Testing
- [ ] Check initial load time (< 30 seconds ideal)
- [ ] Check frame rate (30+ FPS minimum)
- [ ] Check memory usage (< 2GB)
- [ ] Test on slower connections (3G/4G)
- [ ] Test on lower-end devices

### ✅ Integration Testing
- [ ] Test with your actual frontend/website
- [ ] Verify redirect URL works correctly
- [ ] Test parameter parsing on your backend
- [ ] Verify data is saved correctly
- [ ] Test full user flow end-to-end

---

## Frontend Integration

### ✅ Integration Code
- [ ] Add game link to your website
- [ ] Include proper `returnUrl` or `redirect` parameter
- [ ] Create results page to handle redirect
- [ ] Parse URL parameters correctly
- [ ] Display game stats to user
- [ ] Send data to your backend API

### ✅ Example Integration
```javascript
// Launch game
const gameUrl = 'https://yourgame.com/';
const returnUrl = encodeURIComponent(window.location.origin + '/results');
window.location.href = `${gameUrl}?returnUrl=${returnUrl}`;

// Handle results (on results page)
const params = new URLSearchParams(window.location.search);
if (params.get('gameCompleted') === 'true') {
  const stats = {
    completionTime: parseFloat(params.get('completionTime')),
    enemiesDefeated: parseInt(params.get('enemiesDefeated')),
    bossDefeated: params.get('bossDefeated') === 'true',
    lootCollected: parseInt(params.get('lootCollected')),
    deathCount: parseInt(params.get('deathCount'))
  };
  
  // Send to backend
  fetch('/api/game-complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stats)
  });
}
```

---

## Security Checklist

### ✅ Security Measures
- [ ] Use HTTPS for production
- [ ] Validate redirect URLs (whitelist domains)
- [ ] Sanitize all URL parameters on backend
- [ ] Implement rate limiting on results endpoint
- [ ] Verify game data integrity on backend
- [ ] Don't trust client-side data (validate server-side)
- [ ] Use CSRF tokens if needed
- [ ] Implement proper authentication

---

## Troubleshooting

### Common Issues

#### Game doesn't load
- [ ] Check browser console for errors
- [ ] Verify all files uploaded correctly
- [ ] Check server compression headers
- [ ] Test in different browser
- [ ] Clear browser cache

#### Redirect doesn't work
- [ ] Verify `returnUrl` parameter is correct
- [ ] Check URL encoding
- [ ] Verify target URL is accessible
- [ ] Check browser console for errors
- [ ] Test with simple URL (e.g., google.com)

#### "Cannot find function" error
- [ ] Verify EventMinimal template is selected
- [ ] Rebuild the game
- [ ] Check `index.html` contains JavaScript functions
- [ ] Clear browser cache

#### Build size too large
- [ ] Use Brotli compression (smallest)
- [ ] Set Code Optimization to Master
- [ ] Enable Strip Engine Code
- [ ] Set Managed Stripping Level to High
- [ ] Compress textures (ASTC, DXT5, etc.)
- [ ] Remove unused assets

---

## Documentation

### ✅ Documentation Files
- [ ] Read `WEBGL_QUICK_START.md` for quick setup
- [ ] Read `WEBGL_BUILD_GUIDE.md` for full documentation
- [ ] Check `EXAMPLE_INTEGRATION.html` for integration example
- [ ] Review `Assets/WebGLTemplates/EventMinimal/README.md`

---

## Final Checklist

### ✅ Ready for Production
- [ ] WebGLBridge added to scene
- [ ] EventMinimal template selected
- [ ] Build completed successfully
- [ ] Tested locally with web server
- [ ] Tested game completion flow
- [ ] Tested player death flow
- [ ] Tested redirect URLs
- [ ] Deployed to production server
- [ ] Tested on production URL
- [ ] Tested in multiple browsers
- [ ] Tested on mobile devices
- [ ] Frontend integration complete
- [ ] Backend integration complete
- [ ] Security measures implemented
- [ ] Performance is acceptable
- [ ] Documentation reviewed

---

## Support

If you encounter issues:

1. Check browser console (F12) for errors
2. Enable debug logs in WebGLBridge (`enableDebugLogs = true`)
3. Test in different browsers
4. Verify all files are present and uploaded correctly
5. Check server configuration (compression, CORS)
6. Review documentation files

---

## Build Information

**Project**: Shadow Monarx Path  
**Platform**: WebGL  
**Template**: EventMinimal  
**Version**: 1.0  
**Date**: October 2025

---

## Notes

Add any project-specific notes here:

- 
- 
- 

---

**Status**: [ ] Ready for Build | [ ] Build Complete | [ ] Deployed | [ ] Live
