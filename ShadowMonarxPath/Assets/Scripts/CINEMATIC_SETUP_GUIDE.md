# Boss Cinematic System Setup Guide
## Unity 6 + Invector (Simple Camera Toggle)

This guide shows you how to set up the complete boss cinematic sequence for your Invector-based game using Unity 6 and Cinemachine 3.1.4.

---

## 📋 Overview

The cinematic system provides:
- ✅ Automatic player input disable during cinematics
- ✅ Simple camera toggle (no Cinemachine required)
- ✅ Boss roar animation synchronized with camera showcase
- ✅ Seamless transition back to gameplay
- ✅ Integration with Simple Boss FSM

---

## 🎯 Prerequisites

Before starting, ensure you have:
- [x] Unity 6 installed
- [x] Cinemachine 3.1.4+ package installed
- [x] Invector Third Person Controller (with AI)
- [x] Boss AI setup completed (see `SIMPLE_BOSS_FSM_SETUP.md`)
- [x] Player character with Invector components

---

## 📦 Step 1: No Cinemachine Needed
We will keep your existing Invector camera as the main camera and add a single extra Camera for the cinematic. No Cinemachine setup is required.

---

## 🎥 Step 2: Ensure Main Camera Is Controlled by Invector

Your main gameplay camera is already handled by Invector's `vThirdPersonCamera`. We'll leave it as-is.

---

## 📷 Step 3: Create a Dedicated Cinematic Camera

### Understanding Invector's Camera System

Invector uses `vThirdPersonCamera` which may or may not use Cinemachine by default. Here's how to integrate:

1. Create an empty GameObject in the scene: `BossCinematicCamera`
2. Add Component: `Camera`
3. Configure:
   - Clear Flags: Skybox (or Solid Color for dramatic effect)
   - Depth: higher than main camera (e.g., main=0, cinematic=1)
   - Field of View: 40–50 (more cinematic)
   - Audio Listener: DISABLE (only the main camera should have one)
4. Position/rotate to frame the boss
5. DISABLE this Camera component by default

---

## 🎬 Step 4: Make It Cinematic (Optional Movement)
Add small scripts or animations to the `BossCinematicCamera` transform for movement/rotation during the cinematic. Keep it simple at first.

### 4.3 Optional: Add Camera Movement

For a more dynamic cinematic, you can add movement:

#### Option A: Dolly Cart Movement

1. **Create Spline**:
   - Add Component → **Cinemachine Spline Dolly**
   - Create a spline path around the boss

2. **Configure Camera Body**:
   - Change Body to: `Spline Dolly`
   - Assign the spline you created
   - Set **Damping**: for smooth movement

#### Option B: Simple Rotation

1. **Add Script** to `BossCinematicCamera`:
```csharp
using UnityEngine;

public class CinematicCameraRotate : MonoBehaviour
{
    public float rotationSpeed = 5f;
    public Vector3 rotationAxis = Vector3.up;
    
    void Update()
    {
        transform.RotateAround(transform.position, rotationAxis, rotationSpeed * Time.deltaTime);
    }
}
```

#### Option C: Keep it Simple (Recommended for First Setup)

Just use a static camera position - it's easier to debug and works great!

---

## 🎮 Step 5: Setup InvectorCinematicUtility

This singleton manages the cinematic state and camera transitions.

### 5.1 Create Utility GameObject

1. **Create Empty GameObject** in scene: `InvectorCinematicUtility`
2. **Add Component**: `InvectorCinematicUtility` script
3. **Configure** in inspector:

   **Player References:**
   - **Player**: Drag your player GameObject (or leave null for auto-find)

   **Cameras:**
   - **Main Camera**: Drag your existing main Camera (used by Invector)
   - **Cinematic Camera**: Drag the `Camera` component on `BossCinematicCamera`

### 5.2 Verify Setup

In the inspector, you should see:
- ✅ Player Cinemachine Camera assigned
- ✅ Boss Cinemachine Camera assigned
- ✅ Boss camera is **disabled** (unchecked in inspector)
- ✅ Player camera is **enabled** (checked in inspector)

---

## 🚪 Step 6: Create Boss Cinematic Trigger

This trigger starts the cinematic when the player enters the boss arena.

### 6.1 Create Trigger GameObject

1. **Create Empty GameObject** near boss arena entrance: `BossCinematicTrigger`
2. **Add Component**: `Box Collider`
   - **Is Trigger**: ✅ CHECK THIS
   - **Size**: Make it wide enough to detect player entry (e.g., `(10, 5, 2)`)
3. **Position**: Place at the entrance to the boss arena
4. **Add Component**: `BossCinematicTrigger` script

### 6.2 Configure Trigger

In the inspector:

**Activation:**
- **One Shot**: ✅ Checked (trigger only once)
- **Trigger Layers**: Set to "Player" layer

**Boss Reference:**
- **Boss Game Object**: Drag your boss GameObject
- **Boss Controller**: Drag the `BossAIController` component (or leave for auto-find)

**Cinematic Settings:**
- **Cinematic Duration**: 5 seconds (adjust to your liking)
- **Roar Trigger Delay**: 1.5 seconds (when roar animation plays)

**Cinemachine 3.x Cameras:**
- **Player Cinemachine Camera**: Drag the `CinemachineCamera` component from player camera
- **Boss Cinemachine Camera**: Drag the `CinemachineCamera` component from boss camera

**Events** (optional):
- **On Cinematic Start**: Add callbacks if needed
- **On Boss Roar**: Add sound effects here
- **On Cinematic End**: Add additional logic here

---

## 🎭 Step 7: Setup Boss Animators

The boss needs TWO animators for the cinematic to work.

### 7.1 Main Boss Animator (Complex)

This is your existing boss animator with all combat animations.

1. **Already exists** on your boss GameObject
2. Has idle, walk, run, attack, etc.
3. Should be **enabled** by default

### 7.2 Roar Animator (Simple, Cinematic Only)

Create a separate simple animator for the roar:

1. **Create Animator Controller**:
   - Right-click in Project: Create → Animator Controller
   - Name: `BossRoarAnimator`

2. **Setup Animator**:
   - Open `BossRoarAnimator` in Animator window
   - **Add Parameter**: Trigger named `"Roar"`
   - **Create State**: "Roar" (assign your roar animation clip)
   - **Add Transition**: `Entry → Roar` (with condition: Roar trigger)
   - **Roar State Settings**:
     - Loop: ✅ UNCHECKED (play once)
     - Transition to Exit when done

3. **Create Child GameObject** under boss:
   - Name: `RoarAnimator`
   - Add Component: **Animator**
   - Assign `BossRoarAnimator` controller
   - **Disable** this Animator component (uncheck in inspector)

4. **Configure BossAIController**:
   - **Main Animator**: The main boss Animator component
   - **Roar Animator**: The `RoarAnimator` child GameObject's Animator component
   - **Roar Trigger Name**: `"Roar"`

---

## ✅ Step 8: Final Checklist & Testing

### Pre-Flight Checklist

Before testing, verify:

**Scene Setup:**
- [ ] Main Camera exists and is controlled by Invector `vThirdPersonCamera`
- [ ] `BossCinematicCamera` has `Camera` component (disabled) and no AudioListener
- [ ] `InvectorCinematicUtility` GameObject in scene with both Cameras assigned
- [ ] `BossCinematicTrigger` at arena entrance with both Cameras assigned

**Boss Setup:**
- [ ] Boss has `BossAIController` component
- [ ] Boss has main Animator (enabled)
- [ ] Boss has child GameObject with roar Animator (disabled)
- [ ] Boss has `vControlAIMelee` and `vFSMBehaviourController`
- [ ] `SimpleBossBehaviour.asset` assigned to FSM controller
- [ ] Combat behaviour assigned in BossAIController

**Player Setup:**
- [ ] Player has `vThirdPersonInput` component
- [ ] Player has "Player" tag
- [ ] Player camera setup correctly

### Testing Steps

1. **Enter Play Mode**
2. **Walk into the trigger zone**
3. **Observe**:
   - ✅ Player input should disable
   - ✅ Camera should switch to boss cinematic camera
   - ✅ Boss should switch to roar animator
   - ✅ After ~1.5s, boss roar animation plays
   - ✅ After 5s total, camera switches back to player
   - ✅ Player input restored
   - ✅ Boss switches back to main animator
   - ✅ Boss starts walking toward player (menacing speed)

### Debug Console Messages

Look for these messages to verify correct flow:

```
BossCinematicTrigger: Player entered, starting boss cinematic
InvectorCinematicUtility: Disabled player input
InvectorCinematicUtility: Disabled Invector camera
InvectorCinematicUtility: Switched to boss cinematic camera
BossAIController: Switched to roar animator on [BossName]
BossCinematicTrigger: Boss roar triggered
BossAIController: Triggering roar animation on [BossName]
BossAIController: Switched back to main animator on [BossName]
InvectorCinematicUtility: Restored player input
InvectorCinematicUtility: Restored Invector camera
InvectorCinematicUtility: Switched back to player camera
BossAIController: Boss activated - [BossName]
BossAIController: Set player as target
BossCinematicTrigger: Cinematic complete, boss activated
```

---

## 🐛 Troubleshooting

### Camera Doesn't Switch

**Issue**: Camera stays on player during cinematic.

**Solutions**:
1. Ensure `BossCinematicCamera` Camera component is DISABLED at start
2. Ensure `InvectorCinematicUtility` has both Cameras assigned
3. Ensure `BossCinematicCamera` has higher Depth than Main Camera
4. Ensure only one AudioListener is active (main camera)

### Player Can Still Move During Cinematic

**Issue**: Player input not disabled.

**Solutions**:
1. Check that `vThirdPersonInput` component exists on player
2. Verify `InvectorCinematicUtility` found the player (check console)
3. Ensure player has "Player" tag
4. Check that `SetLockBasicInput(true)` is being called

### Boss Doesn't Roar

**Issue**: Roar animation doesn't play.

**Solutions**:
1. Verify roar animator has `"Roar"` trigger parameter
2. Check that roar animator is assigned in BossAIController
3. Ensure roar animator child GameObject exists and is disabled by default
4. Check that `StartCinematic()` enables roar animator
5. Verify roar animation clip is assigned to "Roar" state

### Cinematic Never Ends

**Issue**: Stuck in cinematic mode.

**Solutions**:
1. Check `cinematicDuration` is set (default 5 seconds)
2. Verify coroutine is running (check console for start/end messages)
3. Ensure `EndCinematic()` is being called
4. Check for exceptions in console

### Boss Doesn't Activate After Cinematic

**Issue**: Boss stays idle.

**Solutions**:
1. Check that `ActivateBoss()` is called at end of cinematic
2. Verify `SimpleBossBehaviour.asset` is assigned to boss FSM
3. Check FSM state in Invector FSM debug window
4. Ensure `vBossActivated` decision returns true

---

## 🎨 Advanced Customization

### Adjusting Cinematic Duration

In `BossCinematicTrigger`:
- **Cinematic Duration**: Total length of cinematic
- **Roar Trigger Delay**: When roar plays (from start)

Example timings:
- **Epic (10s)**: Duration=10, Roar Delay=3
- **Quick (3s)**: Duration=3, Roar Delay=0.5
- **Default (5s)**: Duration=5, Roar Delay=1.5

### Multiple Camera Angles

Create multiple boss cameras and switch between them:

1. Create `BossCinematicCamera_1`, `BossCinematicCamera_2`, etc.
2. Use Timeline or custom script to enable/disable them in sequence
3. Each should have incrementing priority (20, 21, 22...)

### Adding Timeline for Complex Cinematics

For more control, use Unity Timeline:

1. Create **Timeline asset**
2. Add **Cinemachine Track**
3. Add camera shots as clips on timeline
4. Trigger timeline from `BossCinematicTrigger` instead of simple coroutine

See Unity documentation: [Cinemachine with Timeline](https://docs.unity3d.com/Packages/com.unity.cinemachine@3.1/manual/setup-timeline.html)

---

## 📚 Reference

### Key Classes

- **InvectorCinematicUtility**: Manages cinematic state and camera switching
- **BossCinematicTrigger**: Triggers cinematic when player enters
- **BossAIController**: Boss-specific logic and animator management
- **CinemachineCamera**: Cinemachine 3.x virtual camera (not VirtualCamera!)
- **CinemachineBrain**: Manages camera blending and priorities

### Cinemachine 3.x Key Differences

| Cinemachine 2.x | Cinemachine 3.x |
|----------------|----------------|
| `CinemachineVirtualCamera` | `CinemachineCamera` |
| `GameObject.SetActive()` | `camera.enabled` |
| `m_Priority` | `Priority` |
| Namespace: `Cinemachine` | Namespace: `Unity.Cinemachine` |

### Important Unity 6 Notes

- Cinemachine 3.x is the default for Unity 6
- Uses new namespace: `Unity.Cinemachine`
- Component names changed (Virtual Camera → Camera)
- Priority system is the same
- Blending system is the same

---

## 🎯 Next Steps

After cinematic setup:
1. ✅ Test multiple times to ensure reliability
2. ✅ Add sound effects to boss roar
3. ✅ Add VFX to boss activation
4. ✅ Tune camera positions for drama
5. ✅ Setup combat behaviour FSM (see `SIMPLE_BOSS_FSM_SETUP.md`)
6. ✅ Polish animation transitions
7. ✅ Test with different boss animations

---

## 📝 Summary

You now have a complete boss cinematic system that:
- ✅ Uses Unity 6 and Cinemachine 3.1.4
- ✅ Integrates with Invector's player and camera systems
- ✅ Smoothly transitions between gameplay and cinematic cameras
- ✅ Disables player input during cinematics
- ✅ Showcases boss with roar animation
- ✅ Seamlessly returns to gameplay
- ✅ Activates boss AI after cinematic

The system is modular, reusable, and easy to customize for different boss encounters!

