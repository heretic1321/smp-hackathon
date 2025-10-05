# Camera Shake Effect Guide

## ✅ Feature Added

Camera shake can now be added to any cinematic pose! Perfect for adding impact when the boss roars or lands.

---

## 🎯 Setup for Boss Cinematic

### Enable Shake on Pose 1:

1. **In Hierarchy**, find your **Pose 1** GameObject (first cinematic pose)
2. **In Inspector**, find the **SimpleCinematicPose** component
3. **Scroll to "Camera Shake (Optional)" section**
4. **Check "Enable Shake"** ✅
5. **Set Shake Intensity:** 0.3 (default, adjust as needed)
6. **Set Shake Duration:** 0.5 seconds (default, adjust as needed)

### Visual:

```
Pose 1 Inspector:
├─ SimpleCinematicPose Component:
│  ├─ Camera Settings:
│  │  └─ Field Of View: 60
│  ├─ Transition:
│  │  ├─ Transition Duration: 1.5s
│  │  └─ Ease Curve: (curve)
│  ├─ Hold:
│  │  └─ Hold Duration: 2s
│  ├─ Look At (Optional):
│  │  └─ Look At Target: (optional)
│  └─ Camera Shake (Optional): ✅
│     ├─ Enable Shake: ✅ (CHECK THIS!)
│     ├─ Shake Intensity: 0.3
│     └─ Shake Duration: 0.5s
```

---

## 🎬 How It Works

### Timeline for Pose 1 with Shake:

```
0.0s: Camera starts moving to Pose 1
    ↓
0.0s - 1.0s: Camera moving smoothly
    ↓
1.0s: CAMERA SHAKE STARTS! ✅ (during final approach)
    ↓
1.0s - 1.5s: Camera shakes while approaching (0.5 seconds)
    ↓
1.5s: Camera reaches Pose 1 (shake ends smoothly)
    ↓
1.5s - 3.5s: Camera holds at Pose 1 (2 seconds, no shake)
    ↓
3.5s: Camera moves to Pose 2
```

**Key:** Shake happens **during the transition**, not after the hold!

---

## 🎨 Shake Intensity Guide

### Subtle (0.1 - 0.2):
- **Effect:** Gentle rumble
- **Use:** Distant impact, footsteps
- **Feel:** Barely noticeable

### Medium (0.3 - 0.5): ✅ RECOMMENDED
- **Effect:** Noticeable shake
- **Use:** Boss roar, nearby impact
- **Feel:** Dramatic but not jarring

### Strong (0.6 - 1.0):
- **Effect:** Heavy shake
- **Use:** Explosion, boss landing
- **Feel:** Very dramatic

### Extreme (1.0 - 2.0):
- **Effect:** Violent shake
- **Use:** Massive impact, earthquake
- **Feel:** Intense, disorienting

---

## ⏱️ Shake Duration Guide

### Quick (0.1 - 0.3s):
- **Effect:** Sharp jolt
- **Use:** Sudden impact, punch
- **Feel:** Snappy

### Medium (0.4 - 0.7s): ✅ RECOMMENDED
- **Effect:** Sustained shake
- **Use:** Roar, explosion
- **Feel:** Impactful

### Long (0.8 - 1.5s):
- **Effect:** Prolonged shake
- **Use:** Earthquake, continuous rumble
- **Feel:** Overwhelming

### Very Long (1.5 - 2.0s):
- **Effect:** Extended shake
- **Use:** Major event, boss transformation
- **Feel:** Dramatic sequence

---

## 🎯 Recommended Settings for Boss Roar

### Default (Balanced):
```
Enable Shake: ✅
Shake Intensity: 0.3
Shake Duration: 0.5s
```

### Subtle (Less Dramatic):
```
Enable Shake: ✅
Shake Intensity: 0.15
Shake Duration: 0.3s
```

### Powerful (More Dramatic):
```
Enable Shake: ✅
Shake Intensity: 0.5
Shake Duration: 0.8s
```

### Extreme (Maximum Impact):
```
Enable Shake: ✅
Shake Intensity: 1.0
Shake Duration: 1.0s
```

---

## 🔧 Technical Details

### Shake Algorithm:

1. **Random Offset:** Camera moves randomly in X, Y, Z
2. **Dampening:** Shake intensity reduces over time
3. **Smooth Return:** Camera returns to original position

### Features:

- **Automatic dampening** (shake fades out naturally)
- **No permanent displacement** (camera returns to exact position)
- **Frame-independent** (works at any framerate)
- **Non-destructive** (doesn't affect other poses)

---

## 🎮 Testing

### Quick Test:

1. **Enable shake on Pose 1**
2. **Enter Play Mode**
3. **Skip to Boss Phase** (GameManager debug menu)
4. **Watch cinematic:**
   - Camera moves to Pose 1 ✅
   - Camera holds for 2 seconds ✅
   - Camera shakes at end of hold ✅
   - Camera moves to Pose 2 ✅

### Expected Console Output:

```
SimpleCinematicCamera: Starting cinematic sequence
SimpleCinematicCamera: Moving to pose 1/3
[Camera approaching Pose 1...]
SimpleCinematicCamera: Applying camera shake during approach (intensity: 0.3, duration: 0.5s) ✅
[Camera shakes while moving!]
[Camera reaches Pose 1, holds steady...]
SimpleCinematicCamera: Moving to pose 2/3
```

---

## 💡 Creative Uses

### Pose 1 (Wide Shot):
- **Shake at end:** Boss roars, camera shakes ✅
- **Timing:** Sync with roar SFX

### Pose 2 (Close-up):
- **Shake at end:** Boss steps forward
- **Intensity:** 0.4 (medium)

### Pose 3 (Player Reaction):
- **No shake:** Keep player shot stable
- **Or subtle shake:** 0.1 (player feels impact)

---

## 🎬 Timing with Boss Roar

### Perfect Sync:

```
Boss Cinematic Sequence:
├─ 0.0s: Cinematic starts
├─ 0.0s: Boss switches to roar animator
├─ 1.5s: Boss roar SFX plays (GameManager delay)
├─ 1.5s: Boss roar animation triggers
├─ 3.5s: Camera shake triggers (end of Pose 1 hold) ✅
└─ Result: Shake happens during/after roar!
```

### To Sync Better:

**Option 1: Adjust Pose 1 Hold Duration**
- Current: 2 seconds
- Try: 1.5 seconds (shake happens right when roar plays)

**Option 2: Adjust Boss Roar Delay**
- Current: 1.5 seconds
- Try: 2.0 seconds (roar happens right before shake)

---

## 🚨 Troubleshooting

### Shake Not Happening

**Check:**
- [ ] "Enable Shake" is checked on Pose 1
- [ ] Shake Intensity > 0
- [ ] Shake Duration > 0
- [ ] Console shows "Applying camera shake" message

### Shake Too Subtle

**Fix:**
- Increase Shake Intensity (try 0.5 or 0.7)
- Increase Shake Duration (try 0.8s)

### Shake Too Strong

**Fix:**
- Decrease Shake Intensity (try 0.2 or 0.15)
- Decrease Shake Duration (try 0.3s)

### Shake Happens at Wrong Time

**Understand:**
- Shake happens **during the final approach** to the pose
- If transition is 1.5s and shake is 0.5s, shake starts at 1.0s
- Shake duration is subtracted from transition duration
- Adjust shake duration to change when it starts

### Camera Doesn't Return to Position

**This shouldn't happen** - shake automatically restores position
- If it does, check for other scripts moving camera

---

## 🎨 Multiple Shakes

You can enable shake on **any pose**, not just Pose 1!

### Example: Three Shakes

```
Pose 1: Enable Shake ✅ (Boss roars)
    Intensity: 0.3, Duration: 0.5s

Pose 2: Enable Shake ✅ (Boss steps forward)
    Intensity: 0.4, Duration: 0.3s

Pose 3: No Shake ❌ (Keep stable for player shot)
```

---

## 📊 Comparison

| Setting | Intensity | Duration | Effect |
|---------|-----------|----------|--------|
| **Subtle** | 0.15 | 0.3s | Gentle rumble |
| **Default** | 0.3 | 0.5s | Noticeable shake ✅ |
| **Strong** | 0.5 | 0.8s | Heavy impact |
| **Extreme** | 1.0 | 1.0s | Violent shake |

---

## ✅ Setup Checklist

- [ ] Select Pose 1 GameObject in hierarchy
- [ ] Find SimpleCinematicPose component
- [ ] Scroll to "Camera Shake (Optional)"
- [ ] Check "Enable Shake" ✅
- [ ] Set Shake Intensity: 0.3 (or adjust)
- [ ] Set Shake Duration: 0.5s (or adjust)
- [ ] Save scene
- [ ] Test: Watch cinematic, verify shake happens
- [ ] Adjust intensity/duration if needed

---

## 🎯 Quick Reference

### Enable Shake:
```
Pose 1 → SimpleCinematicPose → Camera Shake (Optional) → Enable Shake ✅
```

### Recommended Values:
```
Shake Intensity: 0.3
Shake Duration: 0.5s
```

### When It Happens:
```
During the FINAL APPROACH to the pose (before reaching destination)
```

---

**Status:** ✅ Implemented and Easy to Use!
**Setup Time:** 30 seconds
**Effect:** Professional cinematic impact

Add camera shake to make your boss entrance even more dramatic! 🎬📹
