# Boss Cinematic Pose System - Quick Reference

## 🎬 Quick Setup (5 Minutes)

### 1. Create Poses (30 seconds each)
```
1. Create empty GameObject → name it "BossPose_01"
2. Add Component → CinematicPose
3. Move Scene View camera to desired angle
4. Click "Take Pose from Scene View" in Inspector
5. Adjust FOV/timing if needed
6. Repeat for poses 2, 3, etc.
```

### 2. Create Cinemachine Camera
```
1. GameObject → Create Empty → "BossCinemachineCamera"
2. Add Component → CinemachineCamera
3. DISABLE the component (uncheck)
4. Leave Body/Aim as "None"
```

### 3. Add Sequence Utility
```
1. GameObject → Create Empty → "BossCinemachineSequenceUtility"
2. Add Component → BossCinemachineSequenceUtility
3. Assign:
   - Main Camera
   - Boss Cinemachine Camera
   - Poses list (in order)
   - Default Look At Target (optional, e.g., boss)
```

### 4. Add Trigger
```
1. GameObject → Create Empty → "BossCinematicTrigger"
2. Add Component → Box Collider
   - Is Trigger: ✅
   - Size: 10, 5, 2
3. Add Component → BossCinemachinePoseTrigger
4. Assign:
   - Sequence Utility
   - Main Camera
   - Boss Cinemachine Camera
   - Poses list (same as utility)
   - Boss Controller
   - Roar Delay: 1.5
   - Total Duration: 5.0
```

### 5. Test
```
1. Enter Play Mode
2. Walk into trigger
3. Watch cinematic!
```

---

## 📋 Inspector Quick Settings

### CinematicPose Component
```
Field Of View: 60° (wide) or 35° (dramatic)
Transition Duration: 1.0s (smooth blend)
Transition Curve: EaseInOut
Look At Target: [Boss Transform]
Hold Duration: 0.5-1.5s
```

### BossCinemachinePoseTrigger
```
One Shot: ✅
Trigger Layers: Player
Boss Controller: [BossAIController]
Roar Delay: 1.5s
Total Duration: 5.0s
Poses: [List of 3-5 poses]
```

---

## 🎨 Pose Capture Shortcuts

### From Scene View (Recommended!)
```
1. Navigate Scene View to desired camera angle
2. Select CinematicPose GameObject
3. Inspector → "Take Pose from Scene View"
4. Done! Position, rotation, FOV captured.
```

### From Main Camera
```
1. Position Main Camera manually (or in Play Mode)
2. Select CinematicPose GameObject  
3. Inspector → "Take Pose from Camera View"
4. Done!
```

---

## 🎯 Typical 3-Pose Boss Intro

### Pose 1: Wide Establishing (0-1.5s)
```
Position: High, behind player
FOV: 60°
Transition: 1.0s
Hold: 0.5s
Look At: Boss
```

### Pose 2: Boss Close-Up (1.5-3.5s)
```
Position: Low angle, near boss face
FOV: 35°
Transition: 1.0s
Hold: 1.0s ← Boss roars here
Look At: Boss Head
```

### Pose 3: Over-Shoulder (3.5-5.0s)
```
Position: Behind boss, looking at player
FOV: 40°
Transition: 0.8s
Hold: 0.7s
Look At: Player
```

---

## 🔧 Common Settings

| Setting | Smooth | Fast | Dramatic |
|---------|--------|------|----------|
| Transition Duration | 1.5s | 0.5s | 2.0s |
| Hold Duration | 1.0s | 0.3s | 2.0s |
| FOV (Wide) | 60° | 70° | 50° |
| FOV (Close) | 40° | 40° | 30° |
| Curve | EaseInOut | Linear | Custom |

---

## 🐛 Quick Fixes

| Issue | Fix |
|-------|-----|
| Poses don't capture | Check editor script in `Camera/Editor/` folder |
| Camera doesn't move | Check poses are in order, duration > 0 |
| Camera snaps | Increase transition duration to 1.0s+ |
| Boss doesn't roar | Check Boss Controller assigned, roar delay set |
| Stuck in cinematic | Check Total Duration is set (e.g., 5.0) |
| Input not restored | Check player has `vThirdPersonInput` |

---

## ⌨️ Workflow Tips

1. **Iterate Fast**: Use Scene View capture to quickly try different angles
2. **Preview Gizmos**: Selected poses show cyan camera frustum in Scene
3. **Test Often**: Enter Play Mode frequently to see timing
4. **FOV Range**: 
   - 60-70° = Standard/wide
   - 40-50° = Cinematic
   - 30-35° = Dramatic close-up
5. **Timing Rule**: Total of (transition + hold) per pose = time per shot

---

## 📐 Scene Hierarchy Example

```
BossArena/
├── Boss (with BossAIController)
├── BossPose_01_Wide
│   └── CinematicPose
├── BossPose_02_CloseUp
│   └── CinematicPose
├── BossPose_03_OverShoulder
│   └── CinematicPose
├── BossCinemachineCamera (disabled)
│   └── CinemachineCamera
├── BossCinemachineSequenceUtility
│   └── BossCinemachineSequenceUtility
└── BossCinematicTrigger
    ├── BoxCollider (trigger)
    └── BossCinemachinePoseTrigger
```

---

## 🎮 Complete Flow

```
Player enters trigger
    ↓
Disable Invector input/camera
Enable Boss CinemachineCamera
    ↓
Blend to Pose 1 (wide shot)
Hold for 0.5s
    ↓
Blend to Pose 2 (close-up)
Boss roars at 1.5s
Hold for 1.0s
    ↓
Blend to Pose 3 (over-shoulder)
Hold for 0.7s
    ↓
Disable Boss CinemachineCamera
Restore Invector camera/input
Activate boss FSM
    ↓
Boss walks toward player (menacing)
```

---

## 📦 Required Components

### On Boss GameObject
- BossAIController
- vControlAIMelee
- vFSMBehaviourController
- Main Animator (enabled)
- Child with Roar Animator (disabled)

### In Scene
- Main Camera (with CinemachineBrain, optional)
- BossCinemachineCamera (CinemachineCamera, disabled)
- 3-5 CinematicPose GameObjects
- BossCinemachineSequenceUtility GameObject
- Trigger with BossCinemachinePoseTrigger

---

## 🎉 That's It!

You now have a professional multi-angle boss cinematic with:
- ✅ Easy pose capture from Scene View
- ✅ Smooth camera blending
- ✅ Per-pose FOV and timing control
- ✅ Boss roar integration
- ✅ No Timeline setup required!

**Time to setup**: ~5 minutes  
**Flexibility**: Infinite camera angles  
**Iteration speed**: Instant with Scene View capture

Go create amazing boss intros! 🎬

