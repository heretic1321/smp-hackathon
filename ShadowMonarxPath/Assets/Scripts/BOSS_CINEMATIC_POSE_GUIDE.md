# Boss Cinematic Pose System - Setup Guide
## Unity 6 + Cinemachine 3.x + Invector

This guide explains how to set up the **pose-based boss cinematic system** that uses `CinematicPose` components to create dynamic camera sequences.

---

## 🎯 Overview

The pose-based cinematic system provides:
- ✅ Multiple camera angles/shots using `CinematicPose` transforms
- ✅ Smooth blending between poses with custom curves
- ✅ Per-pose FOV, hold duration, and look-at targets
- ✅ Easy pose capture from Scene View or Camera View
- ✅ Automatic player input disable during cinematics
- ✅ Integration with boss roar animation and FSM activation
- ✅ Clean Cinemachine + Invector integration

---

## 📦 Component Overview

### Core Scripts

1. **`CinematicPose.cs`** (in `Assets/Scripts/Camera/`)
   - Defines a single camera pose with position, rotation, FOV
   - Contains transition settings (duration, curve)
   - Optional look-at target
   - Hold duration after arriving at pose
   - Events and particle triggers

2. **`BossCinemachineSequenceUtility.cs`**
   - Manages the cinematic sequence
   - Disables Invector input and camera
   - Enables CinemachineCamera
   - Blends through list of `CinematicPose` transforms
   - Restores gameplay after sequence

3. **`BossCinemachinePoseTrigger.cs`**
   - Triggers the cinematic when player enters
   - Manages boss roar timing
   - Drives the pose sequence
   - Activates boss FSM after cinematic

---

## 🎬 Step-by-Step Setup

### Step 1: Create Camera Poses

1. **Create pose GameObjects**:
   - Create empty GameObjects in your scene for each camera shot
   - Name them descriptively: `BossPose_01_WideShot`, `BossPose_02_CloseUp`, etc.
   - Position them in your scene where you want the camera

2. **Add CinematicPose component**:
   - Select each pose GameObject
   - Add Component → `CinematicPose`

3. **Capture poses easily** (NEW FEATURE!):
   - **Option A: From Scene View**:
     1. Move Scene view camera to desired angle/position
     2. Select the CinematicPose GameObject
     3. In Inspector, click **"Take Pose from Scene View"**
     4. Position, rotation, and FOV are captured automatically!
   
   - **Option B: From Main Camera**:
     1. Enter Play mode (or position Main Camera in edit mode)
     2. Move Main Camera to desired position
     3. Select the CinematicPose GameObject
     4. In Inspector, click **"Take Pose from Camera View"**
     5. Position, rotation, and FOV are captured!

4. **Configure each pose**:
   - **Field Of View**: Captured automatically or set manually (1-179°)
   - **Transition Duration**: How long to blend from previous pose (seconds)
   - **Transition Curve**: Easing curve for the blend (default: EaseInOut)
   - **Look At Target**: Optional target for camera to look at (e.g., boss head)
   - **Hold Duration**: How long to hold at this pose before moving to next
   - **Particles**: Optional particle systems to trigger
   - **Events**: Optional callbacks (onEnter, onArrive, onExit)

---

### Step 2: Setup Cinemachine Camera

1. **Ensure Main Camera has CinemachineBrain**:
   - Select Main Camera
   - Add Component → `CinemachineBrain` (if not already present)
   - Configure:
     - Update Method: `Smart Update`
     - Blend Update Method: `Late Update`
     - Default Blend: `EaseInOut` (1 second)

2. **Create dedicated boss cinematic camera**:
   - Create new GameObject: `BossCinemachineCamera`
   - Add Component → `CinemachineCamera`
   - Configure:
     - **Enabled**: ❌ UNCHECK (disabled by default)
     - **Priority**: 10 (doesn't matter much as we toggle enabled)
     - **Body**: None (we control via script)
     - **Aim**: None (we control via script)
     - **Lens**:
       - Field of View: 60 (will be overridden by poses)
       - Near/Far Clip Planes: Default

---

### Step 3: Setup Sequence Utility

1. **Create utility GameObject**:
   - Create empty GameObject: `BossCinemachineSequenceUtility`
   - Add Component → `BossCinemachineSequenceUtility`

2. **Configure in Inspector**:
   
   **Player / Invector:**
   - **Player**: Auto-finds player with "Player" tag (or assign manually)

   **Cinemachine:**
   - **Main Camera**: Drag your Main Camera
   - **Cinemachine Brain**: Leave null (auto-found)
   - **Boss Cinemachine Camera**: Drag `BossCinemachineCamera`

   **Sequence:**
   - **Poses**: Drag your `CinematicPose` GameObjects here **in order**
   - **Default Look At Target**: Optional fallback target (e.g., boss transform)

---

### Step 4: Setup Trigger

1. **Create trigger GameObject**:
   - Create empty GameObject at boss arena entrance: `BossCinematicTrigger`
   - Add Component → `Box Collider` (or Sphere Collider)
   - Configure collider:
     - **Is Trigger**: ✅ CHECK THIS
     - **Size**: Make large enough to detect player entry (e.g., 10x5x2)

2. **Add trigger component**:
   - Add Component → `BossCinemachinePoseTrigger`

3. **Configure in Inspector**:

   **Activation:**
   - **One Shot**: ✅ Checked (trigger only once)
   - **Trigger Layers**: Set to "Player" layer

   **References:**
   - **Sequence Utility**: Drag `BossCinemachineSequenceUtility` GameObject
   - **Main Camera**: Drag Main Camera
   - **Boss Cinemachine Camera**: Drag `BossCinemachineCamera`

   **Poses:**
   - **Poses**: Drag same pose list as in utility (in order)
   - **Default Look At Target**: Drag boss GameObject (or specific bone)

   **Boss Hooks:**
   - **Boss Controller**: Drag boss GameObject's `BossAIController` component
   - **Roar Delay**: When to trigger roar (e.g., 1.5 seconds)
   - **Total Duration**: Total cinematic length (e.g., 5 seconds)

   **Events** (optional):
   - **On Sequence Start**: Add sound effects, screen fades, etc.
   - **On Roar**: Add roar sound effect, screen shake, etc.
   - **On Sequence End**: Add transition effects

---

### Step 5: Setup Boss

Your boss setup remains the same as in `SIMPLE_BOSS_FSM_SETUP.md`:

1. **Boss Components**:
   - `BossAIController`
   - `vControlAIMelee`
   - `vFSMBehaviourController` (with `SimpleBossBehaviour.asset`)
   - Main Animator (complex animations)
   - Child GameObject with Roar Animator (simple, for cinematic)

2. **BossAIController Settings**:
   - Main Animator: Boss's main Animator
   - Roar Animator: Child GameObject's Animator
   - Roar Trigger Name: `"Roar"`
   - Boss Behaviour: `SimpleBossBehaviour.asset`
   - Combat Behaviour: `CustomDemonBehaviour.asset`

---

## 🎨 Creating Great Cinematic Sequences

### Example Pose Sequence

Here's a suggested 5-second boss intro sequence:

#### Pose 1: Wide Establishing Shot (0-1.5s)
```
Name: BossPose_01_Wide
Position: Behind player, elevated, showing both player and boss
FOV: 50°
Transition Duration: 1.0s
Hold Duration: 0.5s
Look At Target: Boss
```

#### Pose 2: Boss Close-Up (1.5-3.5s)
```
Name: BossPose_02_BossCloseUp
Position: Low angle, close to boss face
FOV: 35° (more dramatic)
Transition Duration: 1.0s
Hold Duration: 1.0s (boss roars during this)
Look At Target: Boss head
```

#### Pose 3: Over-the-Shoulder (3.5-5.0s)
```
Name: BossPose_03_OverShoulder
Position: Behind boss shoulder, looking at player
FOV: 40°
Transition Duration: 0.8s
Hold Duration: 0.7s
Look At Target: Player
```

### Tips for Better Poses

1. **Vary FOV**: Wider shots (60-70°) for establishing, tighter (30-40°) for drama
2. **Use Look At Targets**: Makes camera tracking feel more intentional
3. **Hold Duration**: Give audience time to appreciate each shot (0.5-1.5s)
4. **Transition Curves**: 
   - `EaseInOut`: Smooth, professional
   - `Linear`: Fast, action-packed
   - Custom: Create dramatic pauses or speed-ups
5. **Test in Play Mode**: Iterate until it feels right!

---

## 🎯 Testing Workflow

1. **Setup poses while scene is stopped**:
   - Use "Take Pose from Scene View" to quickly capture angles
   - Adjust FOV and timings in Inspector
   - Use Scene view camera gizmos to visualize

2. **Enter Play Mode**:
   - Walk into trigger zone
   - Watch cinematic play

3. **Observe**:
   - ✅ Player input disabled
   - ✅ Camera smoothly blends through poses
   - ✅ Boss switches to roar animator
   - ✅ Roar plays at specified delay
   - ✅ Camera returns to gameplay
   - ✅ Boss activated and starts walking

4. **Iterate**:
   - Exit Play Mode
   - Adjust pose timings, curves, FOV
   - Repeat

---

## 🐛 Troubleshooting

### Poses Don't Capture

**Issue**: "Take Pose" buttons don't work.

**Solutions**:
- Ensure `CinematicPoseEditor.cs` is in `Assets/Scripts/Camera/Editor/` folder
- Reimport the script (right-click → Reimport)
- Check console for errors

### Camera Doesn't Move

**Issue**: Camera stays at first pose or doesn't blend.

**Solutions**:
- Check that poses are in correct order in the list
- Verify `Transition Duration` is > 0
- Ensure `BossCinemachineCamera` is assigned and starts disabled
- Check that `CinemachineBrain` is on Main Camera

### Cinematic Never Ends

**Issue**: Player stays locked in cinematic.

**Solutions**:
- Check `Total Duration` is set (e.g., 5 seconds)
- Verify `BossCinemachinePoseTrigger` is calling `EndSequence()`
- Check console for errors

### Boss Doesn't Roar

**Issue**: Roar animation doesn't play during cinematic.

**Solutions**:
- Check `Boss Controller` is assigned in trigger
- Verify `Roar Delay` is > 0 and < Total Duration
- Ensure boss has two animators (main + roar)
- Check `BossAIController` roar animator is assigned

### Camera Snaps Instead of Blending

**Issue**: Camera teleports between poses.

**Solutions**:
- Increase `Transition Duration` on poses (e.g., 1.0s)
- Check `Transition Curve` is set (not null)
- Verify `CinemachineBrain` default blend is set

---

## 📊 Component Reference

### CinematicPose Fields

| Field | Type | Description |
|-------|------|-------------|
| `fieldOfView` | float | Camera FOV (1-179°) |
| `transitionDuration` | float | Blend time from previous pose |
| `transitionCurve` | AnimationCurve | Easing for blend |
| `lookAtTarget` | Transform | Optional aim target |
| `particleSystems` | List | VFX to trigger |
| `triggerParticlesOnEnter` | bool | Play VFX when starting blend |
| `triggerParticlesOnArrive` | bool | Play VFX when arriving |
| `holdDuration` | float | Pause time at this pose |
| `onEnter` | UnityEvent | Callback when starting blend |
| `onArrive` | UnityEvent | Callback when arrived |
| `onExit` | UnityEvent | Callback when leaving |

### Editor Utilities

| Button | Function |
|--------|----------|
| **Take Pose from Scene View** | Captures Scene camera position/rotation/FOV |
| **Take Pose from Camera View** | Captures Main Camera position/rotation/FOV |

---

## ✨ Advanced Features

### Dynamic Look-At Targets

Instead of static look-at, you can:
- Use bone transforms (e.g., boss head, player chest)
- Switch look-at per pose for dramatic effect
- Leave null for free camera orientation

### Event-Driven Effects

Use `onEnter`, `onArrive`, `onExit` events to:
- Trigger sound effects
- Spawn VFX particles
- Show subtitle text
- Trigger boss animations

### Variable Hold Times

You can dynamically adjust hold duration by:
- Setting different hold times per pose
- Using events to extend/skip poses
- Modifying `holdMultiplier` in `PlayPoseSequence()`

---

## 🔗 Related Documentation

- **`SIMPLE_BOSS_FSM_SETUP.md`** - Boss AI and FSM setup
- **`BOSS_SETUP_GUIDE.md`** - Complete boss system overview
- **`BossAIController.cs`** - Boss script with roar animation

---

## 📝 Quick Setup Checklist

- [ ] Create 3-5 `CinematicPose` GameObjects in scene
- [ ] Use "Take Pose from Scene View" to capture angles
- [ ] Configure FOV, transition duration, hold duration per pose
- [ ] Add optional look-at targets (boss, player, specific bones)
- [ ] Create `BossCinemachineCamera` (disabled by default)
- [ ] Add `BossCinemachineSequenceUtility` to scene
- [ ] Assign Main Camera, Boss Camera, and pose list
- [ ] Create trigger collider at arena entrance
- [ ] Add `BossCinemachinePoseTrigger` component
- [ ] Assign utility, cameras, poses, and boss references
- [ ] Set roar delay and total duration
- [ ] Test in Play Mode and iterate!

---

## 🎉 Result

You now have a professional, multi-angle boss cinematic that:
- ✅ Smoothly blends between custom camera poses
- ✅ Integrates with boss roar animation
- ✅ Disables player input during cinematic
- ✅ Activates boss FSM after sequence
- ✅ Is easy to author with Scene View capture buttons
- ✅ Supports per-pose FOV, curves, and timings

The system is modular, reusable for other cinematics, and requires no Timeline setup!

