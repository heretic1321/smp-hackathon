# Simple Boss FSM Setup Guide

This guide explains how to set up the **Simple Boss Behaviour FSM** for your boss encounter. This FSM handles the initial boss sequence before transitioning to full combat.

## What This FSM Does

The Simple Boss Behaviour handles:
1. **Idle State** - Boss waits for activation (cinematic to complete)
2. **Roar State** - Boss sets player as target and plays roar animation  
3. **Menacing Approach** - Boss slowly walks toward player with intimidating presence
4. **Auto-Switch to Combat** - Automatically switches to complex combat FSM when player gets close

## FSM Flow

```
Entry → Waiting For Activation (Idle)
  ↓ (Boss Activated by cinematic)
Roar At Player (Sets target + plays roar animation)
  ↓ (Automatic after state completes)
Menacing Approach (Slow menacing walk toward player)
  ↓ (Player gets close - distance check)
[Switches to Combat Behaviour FSM]
```

## Step 1: Create the Simple Boss FSM Asset

1. In Unity Editor menu, click: **Tools → Boss System → Create Simple Boss FSM**
2. This will create `SimpleBossBehaviour.asset` at `Assets/Prefabs/FSMBehaviour/SimpleBossBehaviour.asset`
3. The asset includes all necessary states, actions, and decisions pre-configured

## Step 2: Setup Boss GameObject Components

Your boss GameObject needs these components:

### Required Invector Components
- `vControlAIMelee` - Invector's AI melee controller
- `vFSMBehaviourController` - FSM controller for AI states
- `Animator` - Main complex animator for boss animations

### Required Custom Components  
- `BossAIController` - Your custom boss controller script

### Component Configuration

#### vFSMBehaviourController
- **Current Behaviour**: Assign `SimpleBossBehaviour.asset`

#### BossAIController
Configure these fields in the inspector:

**Boss State:**
- `isActivated`: Leave unchecked (false) - will be set by cinematic
- `hasReachedPlayerOnce`: Leave unchecked (false) - will be set when player gets close

**Components:**
- `Main Animator`: Assign your boss's main Animator component (with complex animations)
- `Roar Animator`: Assign a separate Animator component for roar animation (see Animator Setup below)
- `Roar Trigger Name`: Set to `"Roar"` (or whatever trigger name your roar animator uses)

**FSM Behaviour:**
- `Boss Behaviour`: Assign `SimpleBossBehaviour.asset`
- `Combat Behaviour`: Assign your complex combat FSM (e.g., `CustomDemonBehaviour.asset`)

**Movement Speed Settings:**
- `Menacing Walk Speed`: 1.5 (slow intimidating walk)
- `Normal Walk Speed`: 2.5 (normal combat walk)
- `Run Speed`: 4.5 (combat running)
- `Sprint Speed`: 6.0 (combat sprint)

## Step 3: Setup Animators

### Main Boss Animator
This is your complex animator with all combat animations:
- Idle, Walk, Run, Attack, etc.
- This animator should be on the boss GameObject
- Assigned to `Main Animator` field in BossAIController

### Roar Animator (Simple, Separate)
Create a **separate, simple** Animator Controller for just the roar:

1. Create new Animator Controller: `Assets/Animator/BossRoarAnimator.controller`
2. Setup:
   - Create a trigger parameter named `"Roar"`
   - Create a state called `"Roar"` 
   - Assign your roar animation clip to this state
   - Create transition: `Entry → Roar` (with trigger condition `Roar`)
   - Set `"Roar"` state to NOT loop
3. Create a child GameObject under your boss called `RoarAnimator`
4. Add an `Animator` component to this child GameObject
5. Assign `BossRoarAnimator.controller` to this Animator
6. Disable this Animator by default (uncheck the component)
7. Assign this Animator component to `Roar Animator` field in BossAIController

**Why two animators?**
- The main animator is complex and handles all combat
- The roar animator is simple and only plays during the cinematic
- This prevents conflicts and makes the roar animation easy to sync with cinematics

## Step 4: Setup Cinematic Trigger

Your cinematic trigger should call `BossAIController.ActivateBoss()` when the cinematic ends. This will:
- Set `isActivated = true`
- Find the player and set as target
- Trigger the FSM transition from "Waiting" to "Roar" state

See `BossCinematicTrigger.cs` for reference implementation.

## How the FSM Works

### State 1: Waiting For Activation
- **Purpose**: Boss is idle, waiting for cinematic
- **Actions**: None (just idle animation from main animator)
- **Transition**: When `BossActivated` decision returns true (set by cinematic calling `ActivateBoss()`)

### State 2: Roar At Player
- **Purpose**: Boss roars at player dramatically
- **Actions**:
  1. `Set Current Target` - Sets player as AI target
  2. `Trigger Boss Roar` - Triggers roar animation on roar animator
- **Transition**: Automatic default transition after state completes (2-3 seconds)

### State 3: Menacing Approach
- **Purpose**: Boss slowly walks toward player
- **Actions**:
  1. `Set Boss Movement Speed` - Sets slow menacing walk speed
  2. `Chase Target` - Move toward player
  3. `Look To Target` - Face player while moving
- **Transition**: When `Player Close (First Time)` decision returns true
  - Checks if player is within `closeDistance` (default 5 units)
  - Only returns true ONCE (subsequent checks return false)
  - Automatically calls `BossAIController.MarkPlayerReached()` which:
    - Sets `hasReachedPlayerOnce = true`
    - Calls `SetFullCombatSpeed()`
    - Calls `SwitchToFullCombat()` → switches FSM to your combat behaviour

## Testing

### In-Editor Testing (Context Menu)
Right-click on `BossAIController` component in inspector:
- **Reset Boss State** - Reset activation and reached flags
- **Test Cinematic Sequence** - Test animator switching (start → roar → end)
- **Test Roar Animation Only** - Test just the roar trigger

### Runtime Testing Workflow
1. Start play mode
2. Boss should be idle in "Waiting For Activation" state
3. Trigger the cinematic (enter trigger zone)
4. Cinematic should:
   - Call `BossAIController.StartCinematic()` (switches to roar animator)
   - Call `BossAIController.TriggerRoarAnimation()` (plays roar)
   - Call `BossAIController.EndCinematic()` (switches back to main animator)
   - Call `BossAIController.ActivateBoss()` (activates boss FSM)
5. Boss should transition to "Roar At Player" state
6. Boss should automatically transition to "Menacing Approach" and walk slowly toward player
7. When you get close to boss (~5 units), it should switch to combat behaviour FSM

## Troubleshooting

### Boss doesn't activate after cinematic
- Check that cinematic calls `BossAIController.ActivateBoss()`
- Check that `SimpleBossBehaviour.asset` is assigned to vFSMBehaviourController
- Check FSM debug view to see current state

### Roar animation doesn't play
- Check that `Roar Animator` field is assigned in BossAIController
- Check that roar animator has a trigger parameter named `"Roar"`
- Check that roar animator is enabled during cinematic
- Check that `TriggerRoarAnimation()` is being called at the right time

### Boss doesn't walk toward player
- Check that player GameObject has tag `"Player"`
- Check that `SetPlayerAsTarget()` is finding the player
- Check console for "Set player as target" debug message
- Check that boss has transitioned to "Menacing Approach" state in FSM debug view

### Boss doesn't switch to combat behaviour
- Check that `Combat Behaviour` field is assigned in BossAIController
- Check that player is within `closeDistance` (default 5 units)
- Check that `vBossPlayerCloseFirstTime` decision is in the FSM
- Check console for "Player reached for first time" message
- Check that `MarkPlayerReached()` is being called

### Boss walks too fast/slow
- Adjust `Menacing Walk Speed` in BossAIController inspector
- Default is 1.5 - increase for faster menacing walk, decrease for slower

### Combat behaviour doesn't work after switch
- Check that `Combat Behaviour` asset is properly configured
- Check that combat FSM has valid states and transitions
- Check FSM debug view to confirm switch occurred
- Check console for "Switched to full combat FSM behaviour" message

## Custom FSM Decisions and Actions

This system includes custom FSM components you can use in other behaviours:

### Decisions
- `vBossActivated` - Check if boss has been activated by cinematic
- `vBossPlayerCloseFirstTime` - Check if player is close for the FIRST TIME only

### Actions  
- `vSetBossMovementSpeed` - Set boss movement speed (menacing vs full combat)
- `vTriggerBossRoar` - Trigger the roar animation via BossAIController

All components are in the `Boss/` category in the FSM editor.

## Next Steps

Once the simple FSM is working:
1. Tune the `closeDistance` in `vBossPlayerCloseFirstTime` decision
2. Adjust movement speeds for desired effect
3. Ensure your combat behaviour FSM is properly configured
4. Add sound effects to roar animation
5. Add VFX to boss activation/roar
6. Fine-tune cinematic camera timing

## See Also

- `BOSS_SETUP_GUIDE.md` - Full boss system setup (includes cinematic setup)
- `BOSS_SYSTEM_README.md` - Overall system architecture
- `BossAIController.cs` - Boss controller script with all public methods
- `BossCinematicTrigger.cs` - Cinematic trigger implementation
