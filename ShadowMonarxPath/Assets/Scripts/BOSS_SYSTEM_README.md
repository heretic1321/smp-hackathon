# Boss Cinematic Encounter System

## Quick Start

This system provides a complete boss encounter with cinematic introduction for Invector character controller projects.

## What You Get

✅ **Cinematic Trigger** - Automatically starts cinematic when player enters area  
✅ **Boss Roar Animation** - Synchronized roar during camera showcase  
✅ **Player Control Management** - Seamless disable/enable of Invector controls  
✅ **Dynamic AI Behavior** - Boss walks menacingly, then runs in combat  
✅ **FSM Integration** - Full Invector FSM behaviour system  
✅ **Cinemachine Support** - Professional camera transitions  

## Files Overview

### Scripts (`Assets/Scripts/`)
```
BossAIController.cs              - Main boss behavior controller
BossCinematicTrigger.cs          - Trigger for cinematic sequence
InvectorCinematicUtility.cs      - Player/camera control manager

FSM/
  Decisions/
    vBossActivated.cs            - FSM: Is boss activated?
    vBossPlayerCloseFirstTime.cs - FSM: First close encounter?
  Actions/
    vSetBossMovementSpeed.cs     - FSM: Control movement speed

Editor/
  BossFSMBehaviourCreator.cs     - Tool to create FSM asset
```

### Documentation
- `BOSS_SETUP_GUIDE.md` - Detailed setup instructions
- `BOSS_SYSTEM_README.md` - This file

## Quick Setup (5 Minutes)

### 1. Create FSM Behaviour
Menu: `Tools > Boss System > Create Boss FSM Behaviour`

### 2. Setup Boss GameObject
Add components:
- vControlAIMelee (Invector)
- vFSMBehaviourController (assign BossBehaviour.asset)
- BossAIController (assign roar animator)
- Two Animators (main + roar)

### 3. Create Cinemachine Cameras
- PlayerVirtualCamera (priority 10)
- BossIntroVirtualCamera (priority 20, inactive)

### 4. Setup Trigger Area
- Create GameObject with trigger collider
- Add BossCinematicTrigger component
- Assign boss, cameras, and configure timing

### 5. Add Cinematic Utility
- Create GameObject with InvectorCinematicUtility
- Assign camera references

## Features

### Boss AI States
1. **Waiting For Activation** - Idle until cinematic completes
2. **Menacing Approach** - Slow, intimidating walk toward player
3. **Full Combat** - Normal combat with running enabled
4. **Chase** - Pursues player when out of range

### Cinematic Sequence
1. Player enters trigger → Cinematic starts
2. Player controls disabled
3. Boss switches from main animator to roar animator
4. Camera switches to boss showcase
5. Boss roars at specified timing
6. Boss switches back to main animator
7. Cinematic ends → Player controls restored
8. Boss becomes active and begins approach

### Movement Behavior
- **Initial:** Boss walks slowly (menacing)
- **After First Close Encounter:** Boss can run/sprint (full combat)
- Speeds are fully configurable in BossAIController

## Testing Tools

All components have context menu options for testing:

**BossAIController:**
- Test Roar Animation
- Reset Boss State

**BossCinematicTrigger:**
- Test Trigger Cinematic
- Reset Trigger

## Configuration Options

### BossAIController
- Main animator (complex animations)
- Roar animator (simple roar-only)
- Menacing walk speed
- Normal walk/run/sprint speeds
- Roar trigger name

### BossCinematicTrigger
- Cinematic duration
- Roar trigger delay
- One-shot behavior
- Layer mask for detection
- UnityEvents for custom behavior

### FSM Decisions
- Boss activation check
- First close encounter distance

## Integration Points

### With Invector FSM
- Custom decisions for boss-specific behavior
- Custom actions for movement speed control
- Fully compatible with existing FSM actions

### With Cinemachine
- Virtual camera switching
- Camera priority management
- Optional Timeline integration

### With Invector Character Controller
- vThirdPersonInput disable/enable
- vThirdPersonCamera disable/enable
- vControlAIMelee speed control
- vFSMBehaviourController integration

## Advanced Usage

### Custom Cinematic Events
Use UnityEvents in BossCinematicTrigger:
- `onCinematicStart` - Called when cinematic begins
- `onBossRoar` - Called when roar triggers
- `onCinematicEnd` - Called when cinematic ends

### Timeline Integration
For complex cinematics, integrate Unity Timeline:
1. Create Timeline asset
2. Trigger from `onCinematicStart` event
3. Add signal tracks for boss roar
4. Control camera with Timeline instead of simple switch

### Multiple Boss Encounters
The system supports multiple bosses:
1. Each boss needs its own BossAIController
2. Each encounter needs its own BossCinematicTrigger
3. One InvectorCinematicUtility can handle all encounters
4. Boss FSM behaviour can be shared or unique per boss

## Architecture

```
Player Enters Trigger
       ↓
BossCinematicTrigger
       ↓
InvectorCinematicUtility (Disables Player/Camera)
       ↓
Cinemachine (Switches Cameras)
       ↓
BossAIController (Triggers Roar)
       ↓
[Cinematic Duration Elapses]
       ↓
InvectorCinematicUtility (Restores Player/Camera)
       ↓
BossAIController (Activates Boss)
       ↓
vFSMBehaviourController (FSM Begins)
       ↓
vBossActivated Decision → True
       ↓
Menacing Approach State (Slow Walk)
       ↓
vBossPlayerCloseFirstTime Decision → True
       ↓
Full Combat State (Run Enabled)
```

## Dependencies

- Invector Third Person Controller
- Invector FSM AI Controller
- Cinemachine (recommended, not required)
- Unity 2020.3+ (or compatible with your Invector version)

## Compatibility

✅ Invector Melee Combat AI  
✅ Invector Shooter AI  
✅ Invector FSM Behaviour System  
✅ Cinemachine 2.x  
✅ Unity Input System (legacy and new)  

## Performance

- Minimal overhead (only active during cinematic)
- No runtime allocations after initialization
- FSM decisions only check when needed
- Optimized for single boss encounter per trigger

## Troubleshooting

See `BOSS_SETUP_GUIDE.md` for detailed troubleshooting section.

Common issues:
- Boss doesn't roar → Check roar animator assignment
- Controls don't restore → Verify InvectorCinematicUtility in scene
- Boss runs immediately → Check FSM transitions and actions
- Camera doesn't switch → Verify Cinemachine setup

## Credits

Created for Unity game development with Invector Third Person Controller.  
Uses Invector FSM AI system for boss behavior management.  
Inspired by classic boss encounter cinematics in action games.

## Version

Version 1.0 - Initial Release

## License

Use freely in your projects. No attribution required.

---

For detailed setup instructions, see `BOSS_SETUP_GUIDE.md`

