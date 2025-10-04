# Boss Cinematic Encounter System - Setup Guide

## Overview

This system creates a complete boss encounter with:
- Cinematic introduction when player enters boss area
- Boss roar animation synchronized with camera
- Smooth player control handling
- Boss walks menacingly, then runs in combat

## Files Created

### Core Scripts
- `Assets/Scripts/BossAIController.cs` - Boss AI management
- `Assets/Scripts/BossCinematicTrigger.cs` - Triggers cinematic on player entry
- `Assets/Scripts/InvectorCinematicUtility.cs` - Handles Invector player/camera control

### FSM Components
- `Assets/Scripts/FSM/Decisions/vBossActivated.cs` - Checks if boss is activated
- `Assets/Scripts/FSM/Decisions/vBossPlayerCloseFirstTime.cs` - Checks first close encounter
- `Assets/Scripts/FSM/Actions/vSetBossMovementSpeed.cs` - Controls boss movement speed

### Editor Tools
- `Assets/Scripts/Editor/BossFSMBehaviourCreator.cs` - Creates FSM behaviour asset

---

## Setup Instructions

### Step 1: Create Boss FSM Behaviour Asset

1. In Unity menu, go to: **Tools > Boss System > Create Boss FSM Behaviour**
2. This creates: `Assets/Prefabs/FSMBehaviour/BossBehaviour.asset`
3. The FSM includes these states:
   - **Entry** → **Waiting For Activation**
   - **Waiting For Activation** (boss idle until cinematic)
   - **Menacing Approach** (slow walk toward player)
   - **Full Combat** (normal combat with running)
   - **Chase** (chase player when out of range)

### Step 2: Create Boss Animator Controllers

**You need TWO animator controllers:**

#### Main Boss Animator (Complex)
1. Create: `Assets/Animator/BossMainAnimator.controller`
2. Include all normal boss animations (idle, walk, run, attack, etc.)
3. Set idle animation to loop by default
4. This will be attached to the boss GameObject

#### Roar Animator (Simple)
1. Create: `Assets/Animator/BossRoarAnimator.controller`
2. Add your boss roar animation clip
3. Create a trigger parameter named: `Roar`
4. Create a state: "Roar"
5. Transition: Entry → Roar (on trigger "Roar")
6. Transition: Roar → Exit (on animation end)

**Note:** The system automatically switches between these animators during cinematics.

### Step 3: Setup Boss Prefab/GameObject

Add these components to your boss GameObject:

1. **vControlAIMelee** (Invector AI - should already exist)
2. **vFSMBehaviourController** (Invector FSM)
   - Assign the `BossBehaviour.asset` to FSM Behaviour field
3. **BossAIController** (our custom script)
   - Main Animator: Assign the complex boss animator (auto-assigned if not set)
   - Roar Animator: Assign the simple roar animator controller
   - Configure movement speeds:
     - Menacing Walk Speed: 1.5
     - Normal Walk Speed: 2.5
     - Run Speed: 4.5
     - Sprint Speed: 6.0
4. **Single Animator Component:**
   - Attach the **Main Boss Animator** to the Animator component on the boss
   - The Roar Animator will be referenced by BossAIController for cinematic switching

### Step 4: Configure FSM Behaviour

Open `BossBehaviour.asset` in the FSM Editor and configure transitions:

#### Waiting For Activation State:
- Add transition to "Menacing Approach"
- Decision: **vBossActivated** (returns true when cinematic ends)

#### Menacing Approach State:
- Add Actions:
  - **Chase Target** (speed: 1)
  - **Look To Target**
  - **vSetBossMovementSpeed** (use menacing walk = true)
- Add transition to "Full Combat"
- Decision: **vBossPlayerCloseFirstTime** (close distance: 5.0)

#### Full Combat State:
- Add Actions:
  - **Melee Combat**
  - **vSetBossMovementSpeed** (use menacing walk = false)

#### Chase State:
- Add Actions:
  - **Chase Target** (speed: 2)
  - **Enable Weapon**

#### AnyState Transitions:
- **To Chase:** When Can See Target AND NOT In Combat Range
- **To Full Combat:** When Can See Target AND In Combat Range AND Boss Activated

### Step 5: Setup Cinemachine Virtual Cameras

1. Install Cinemachine package if not already installed
2. Create two virtual cameras:

#### Player Camera (Normal Gameplay)
- Name: "PlayerVirtualCamera"
- Priority: 10
- Follow: Player
- Look At: Player
- Keep active during gameplay

#### Boss Intro Camera (Cinematic)
- Name: "BossIntroVirtualCamera"  
- Priority: 20 (higher than player camera)
- Position to showcase boss dramatically
- Set inactive by default
- Optional: Add dolly track for camera movement

### Step 6: Setup Boss Arena Trigger

1. Create empty GameObject: "BossCinematicTrigger"
2. Position it where player should trigger cinematic
3. Add Collider component (Box or Sphere)
   - Set as Trigger: ✓
   - Size to cover entry area
4. Add **BossCinematicTrigger** component:
   - One Shot: ✓
   - Trigger Layers: Set to Player layer
   - Boss GameObject: Assign your boss
   - Cinematic Duration: 5.0 seconds
   - Roar Trigger Delay: 1.5 seconds (when roar happens)
   - Player Virtual Camera: Assign PlayerVirtualCamera
   - Boss Virtual Camera: Assign BossIntroVirtualCamera

### Step 7: Setup Cinematic Utility (One-Time Scene Setup)

1. Create empty GameObject: "InvectorCinematicUtility"
2. Add **InvectorCinematicUtility** component
3. Assign camera references:
   - Player Virtual Camera: PlayerVirtualCamera
   - Boss Virtual Camera: BossIntroVirtualCamera
4. Player reference will auto-find player with "Player" tag

---

## How It Works

### Sequence Flow:

1. **Player enters trigger area**
   - BossCinematicTrigger detects player
   - Disables player input (vThirdPersonInput)
   - Disables Invector camera (vThirdPersonCamera)
   - Activates Boss Virtual Camera

2. **Cinematic plays**
   - Camera showcases boss
   - After roarTriggerDelay, boss roar animation triggers
   - Boss roar animator plays roar animation

3. **Cinematic ends**
   - Player input restored
   - Invector camera restored
   - Player camera reactivated
   - Boss activated (IsActivated = true)

4. **Boss AI begins**
   - FSM transitions from "Waiting" → "Menacing Approach"
   - Boss walks slowly toward player
   - When player is within 5 units, transitions to "Full Combat"
   - Boss can now run and sprint

---

## Testing

### Test Cinematic Sequence:
1. Select boss in scene
2. Inspector → BossAIController → Right-click → "Test Cinematic Sequence"

### Test Just Roar Animation:
1. Select boss in scene
2. Inspector → BossAIController → Right-click → "Test Roar Animation Only"

### Test Cinematic:
1. Select BossCinematicTrigger in scene
2. Enter play mode
3. Inspector → BossCinematicTrigger → Right-click → "Test Trigger Cinematic"

### Reset Boss State:
1. Select boss in scene
2. Inspector → BossAIController → Right-click → "Reset Boss State"

### Reset Trigger:
1. Select BossCinematicTrigger in scene
2. Inspector → BossCinematicTrigger → Right-click → "Reset Trigger"

---

## Customization

### Adjust Movement Speeds:
In BossAIController component:
- **Menacing Walk Speed**: How slow boss walks initially
- **Run Speed**: Boss speed after first encounter
- **Sprint Speed**: Boss max speed in combat

### Adjust Cinematic Timing:
In BossCinematicTrigger component:
- **Cinematic Duration**: Total length of cinematic
- **Roar Trigger Delay**: When roar triggers (from start)

### Adjust Combat Distance:
In vBossPlayerCloseFirstTime decision:
- **Close Distance**: How close player must be to trigger full combat

---

## Troubleshooting

### Boss doesn't roar:
- Ensure both Main Animator and Roar Animator are assigned in BossAIController
- Check roar trigger name matches ("Roar" by default)
- Verify roar animation is in the roar animator controller
- Make sure cinematic starts (switches to roar animator) before triggering roar

### Player control doesn't restore:
- Check InvectorCinematicUtility exists in scene
- Verify player has vThirdPersonInput component
- Check that player has "Player" tag

### Boss doesn't activate after cinematic:
- Verify BossAIController is on boss GameObject
- Check BossCinematicTrigger has boss reference assigned
- Ensure FSM behaviour has vBossActivated decision

### Boss runs immediately (doesn't walk):
- Check "Menacing Approach" state has vSetBossMovementSpeed action
- Verify "use menacing walk" is checked in the action
- Ensure transition from Waiting → Menacing Approach works

### Cameras don't switch:
- Verify both virtual cameras are assigned in BossCinematicTrigger
- Check that Cinemachine Brain is on main camera
- Ensure boss camera is inactive at start

---

## Advanced: Timeline Integration

For more complex cinematics, you can use Unity Timeline:

1. Create Timeline for boss intro
2. In BossCinematicTrigger, use OnCinematicStart event to play Timeline
3. Add signal track in Timeline to trigger boss roar at specific time
4. Use Timeline to control camera movement instead of simple virtual camera

---

## Notes

- The system uses Invector's FSM for AI behavior
- Player control is handled through Invector's vThirdPersonInput
- Cinemachine handles camera transitions
- Boss state is persistent within the play session
- One-shot trigger prevents re-triggering the cinematic

---

## Support

For issues or questions, check:
- Invector FSM documentation
- Cinemachine documentation
- Unity Timeline documentation (for advanced cinematics)

