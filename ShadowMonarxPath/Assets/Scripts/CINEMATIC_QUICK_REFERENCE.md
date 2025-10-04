# Boss Cinematic System - Quick Reference Card
## Unity 6 + Invector (Simple Camera Toggle)

---

## 🎬 Component Checklist

### In Scene (Required)
- [ ] **Main Camera** (controlled by Invector `vThirdPersonCamera`)
- [ ] **InvectorCinematicUtility** GameObject
- [ ] **BossCinematicTrigger** GameObject (at arena entrance)
- [ ] **BossCinematicCamera** with `Camera` (disabled by default, higher Depth than main), no AudioListener

### On Boss GameObject
- [ ] `BossAIController`
- [ ] `vControlAIMelee`
- [ ] `vFSMBehaviourController` (with SimpleBossBehaviour)
- [ ] Main Animator (enabled)
- [ ] Child "RoarAnimator" GameObject with Animator (disabled)

### On Player GameObject
- [ ] `vThirdPersonInput`
- [ ] "Player" tag
- [ ] Camera child with `vThirdPersonCamera`

---

## ⚙️ Inspector Settings Quick Guide

### InvectorCinematicUtility
```
Player: [Player GameObject or auto-find]
Main Camera: [Main Camera component]
Cinematic Camera: [BossCinematicCamera's Camera component]
```

### BossCinematicTrigger
```
One Shot: ✅
Trigger Layers: Player
Boss Game Object: [Boss GameObject]
Boss Controller: [BossAIController component]
Cinematic Duration: 5.0
Roar Trigger Delay: 1.5
Main Camera: [Main Camera]
Cinematic Camera: [BossCinematicCamera's Camera]
```

### Cameras
```
Main Camera: Enabled (default), has AudioListener
BossCinematicCamera: Disabled (default), Depth > Main, NO AudioListener
```

### BossAIController
```
Main Animator: [Boss main Animator]
Roar Animator: [RoarAnimator child Animator]
Roar Trigger Name: "Roar"
Boss Behaviour: SimpleBossBehaviour.asset
Combat Behaviour: CustomDemonBehaviour.asset
Menacing Walk Speed: 1.5
```

---

## 🔧 Camera Toggle Reference

### Activation Code (Simple & Robust)

```csharp
// Enable cinematic, disable main
cinematicCamera.enabled = true;
mainCamera.enabled = false;

// Restore main after cinematic
cinematicCamera.enabled = false;
mainCamera.enabled = true;
```

---

## 📐 Recommended Camera Positions

### Player Camera (Gameplay)
```
Position: Behind player, slightly above
Example: (0, 2, -4) relative to player
Rotation: (10, 0, 0)
FOV: 60
Distance: 3-5 units
```

### Boss Camera (Cinematic)
```
Position: Low angle, looking up at boss
Example: (0, 1, -6) relative to boss
Rotation: (15, 0, 0)
FOV: 40-50 (more cinematic)
Look At: Boss chest/head
```

---

## 🎯 Testing Workflow

1. **Enter Play Mode**
2. **Walk into trigger** (yellow gizmo box)
3. **Watch for**:
   - Input disabled
   - Camera switches to boss
   - Boss switches to roar animator
   - Roar plays at ~1.5s
   - At 5s: camera returns, input restored
   - Boss starts walking

4. **Check Console** for these messages:
```
Player entered, starting boss cinematic
Disabled player input
Switched to boss cinematic camera
Switched to roar animator
Boss roar triggered
Switched back to main animator
Restored player input
Boss activated
```

---

## 🐛 Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Camera doesn't switch | Ensure cinematic Camera is disabled at start, Depth > Main, one AudioListener |
| Player can move | Check `vThirdPersonInput` exists on player |
| Boss doesn't roar | Check roar animator has "Roar" trigger |
| Stuck in cinematic | Check `cinematicDuration` is set |
| Boss doesn't activate | Check `SimpleBossBehaviour` assigned |

---

## 📊 Timing Presets

### Quick (3 seconds)
```
Cinematic Duration: 3.0
Roar Trigger Delay: 0.5
```

### Default (5 seconds)
```
Cinematic Duration: 5.0
Roar Trigger Delay: 1.5
```

### Epic (10 seconds)
```
Cinematic Duration: 10.0
Roar Trigger Delay: 3.0
```

---

## 🔗 File References

| File | Purpose |
|------|---------|
| `InvectorCinematicUtility.cs` | Camera & input management |
| `BossCinematicTrigger.cs` | Trigger and sequence control |
| `BossAIController.cs` | Boss animator management |
| `CINEMATIC_SETUP_GUIDE.md` | Full detailed setup guide |
| `SIMPLE_BOSS_FSM_SETUP.md` | Boss AI/FSM setup guide |

---

## 🎮 Context Menu Commands

### BossCinematicTrigger
- **Reset Trigger** - Allow re-triggering
- **Test Trigger Cinematic** - Manual cinematic start

### BossAIController
- **Reset Boss State** - Reset for testing
- **Test Cinematic Sequence** - Test animator switching
- **Test Roar Animation Only** - Test roar alone

---

## ✨ Pro Tips

1. **Camera Priority**: Always keep boss camera priority higher than player (20 vs 10)
2. **Start Disabled**: Boss camera MUST start disabled for proper switching
3. **Tag Player**: Player GameObject needs "Player" tag
4. **Two Animators**: Boss needs both main and roar animators
5. **Roar Child**: Roar animator should be on child GameObject (keeps it organized)
6. **Test Often**: Use context menu commands to test without replaying full sequence

---

## 📞 Need Help?

Refer to full guides:
- **Setup**: `CINEMATIC_SETUP_GUIDE.md`
- **Boss FSM**: `SIMPLE_BOSS_FSM_SETUP.md`
- **Boss AI**: `BOSS_SETUP_GUIDE.md`

All systems work together:
```
Trigger Enter
    ↓
Cinematic Plays (camera + roar)
    ↓
Boss Activated
    ↓
Simple FSM: Idle → Roar → Menacing Walk
    ↓
Player Gets Close
    ↓
Switch to Combat FSM
```

Everything is modular and reusable! 🎉

