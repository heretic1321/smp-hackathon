# Simple Boss FSM - Quick Reference

## One-Line Summary
**Idle → Activated (by cinematic) → Roar → Menacing Walk → Auto-switch to Combat FSM**

## Quick Setup Checklist

### 1. Create FSM Asset
- [ ] Menu: `Tools → Boss System → Create Simple Boss FSM`
- [ ] Confirms: `SimpleBossBehaviour.asset` created

### 2. Boss GameObject Setup
- [ ] Has `vControlAIMelee` component
- [ ] Has `vFSMBehaviourController` component with `SimpleBossBehaviour` assigned
- [ ] Has `BossAIController` component
- [ ] Has main `Animator` component (complex animations)
- [ ] Has child GameObject with separate `Animator` for roar (disabled by default)

### 3. BossAIController Inspector
- [ ] **Main Animator**: Assigned (main complex animator)
- [ ] **Roar Animator**: Assigned (simple roar-only animator, on child GameObject)
- [ ] **Roar Trigger Name**: `"Roar"`
- [ ] **Boss Behaviour**: `SimpleBossBehaviour.asset`
- [ ] **Combat Behaviour**: Your complex FSM (e.g., `CustomDemonBehaviour.asset`)
- [ ] **Movement Speeds**: Default values OK (1.5, 2.5, 4.5, 6.0)

### 4. Cinematic Trigger Setup
- [ ] Calls `BossAIController.ActivateBoss()` when cinematic ends

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         SIMPLE BOSS FSM                          │
└─────────────────────────────────────────────────────────────────┘

    [Entry]
       ↓
┌──────────────────────────┐
│ Waiting For Activation   │  ← Boss is IDLE
│ (Gray)                   │
│                          │
│ Actions: None            │
│ Animation: Main animator │
└──────────────────────────┘
       ↓ Boss Activated? (Cinematic calls ActivateBoss())
┌──────────────────────────┐
│ Roar At Player           │  ← Boss ROARS
│ (Red)                    │
│                          │
│ Actions:                 │
│ - Set Target (Player)    │
│ - Trigger Roar Animation │
└──────────────────────────┘
       ↓ Automatic (default transition)
┌──────────────────────────┐
│ Menacing Approach        │  ← Boss WALKS SLOWLY
│ (Orange)                 │
│                          │
│ Actions:                 │
│ - Set Menacing Speed     │
│ - Chase Target           │
│ - Look To Target         │
└──────────────────────────┘
       ↓ Player Close (First Time)? (Distance < 5 units)
┌──────────────────────────┐
│ [SWITCHES TO COMBAT FSM] │  ← Boss ENTERS FULL COMBAT
│ (Automatic)              │
│                          │
│ Calls:                   │
│ - MarkPlayerReached()    │
│ - SetFullCombatSpeed()   │
│ - SwitchToFullCombat()   │
└──────────────────────────┘
```

## Key Methods Called During Flow

### Cinematic Phase (Before FSM activation)
```csharp
// Called by cinematic system
BossAIController.StartCinematic()      // Switch to roar animator
BossAIController.TriggerRoarAnimation() // Trigger roar on roar animator  
BossAIController.EndCinematic()         // Switch back to main animator
BossAIController.ActivateBoss()         // Activate FSM (sets isActivated = true)
```

### FSM Phase (Automatic)
```csharp
// State: Roar At Player
vSetCurrentTarget.DoAction()           // Sets player as target
vTriggerBossRoar.DoAction()            // Triggers roar animation again (optional)

// State: Menacing Approach
vSetBossMovementSpeed.DoAction()       // Sets slow walk speed
vChaseTarget.DoAction()                // Chase player
vLookToTarget.DoAction()               // Look at player

// Transition: When player gets close
vBossPlayerCloseFirstTime.Decide()     // Returns true when distance < 5
BossAIController.MarkPlayerReached()   // Called by decision
  → SetFullCombatSpeed()               // Restore normal speeds
  → SwitchToFullCombat()               // Switch to combat FSM
```

## Inspector Field Reference

### BossAIController Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| **isActivated** | bool | false | Boss activated by cinematic? |
| **hasReachedPlayerOnce** | bool | false | Player came close once? |
| **mainAnimator** | Animator | - | Main complex animator |
| **roarAnimator** | Animator | - | Simple roar-only animator |
| **roarTriggerName** | string | "Roar" | Trigger name for roar |
| **bossBehaviour** | vFSMBehaviour | - | SimpleBossBehaviour.asset |
| **combatBehaviour** | vFSMBehaviour | - | Complex combat FSM |
| **menacingWalkSpeed** | float | 1.5 | Slow intimidating walk |
| **normalWalkSpeed** | float | 2.5 | Normal combat walk |
| **runSpeed** | float | 4.5 | Combat running |
| **sprintSpeed** | float | 6.0 | Combat sprint |

## Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Boss doesn't activate | Check cinematic calls `ActivateBoss()` |
| Roar doesn't play | Check roar animator assigned & has "Roar" trigger |
| Boss doesn't walk | Check player has "Player" tag |
| Boss walks too fast | Decrease `menacingWalkSpeed` value |
| Doesn't switch to combat | Check `combatBehaviour` assigned |
| Combat FSM broken | Check combat FSM has valid states |

## Debug Console Messages

Look for these messages to verify correct flow:

```
BossAIController: Switched to roar animator on [BossName]
BossAIController: Triggering roar animation on [BossName]
BossAIController: Switched back to main animator on [BossName]
BossAIController: Boss activated - [BossName]
BossAIController: Set player as target
BossAIController: Set menacing walk speed (1.5)
vBossPlayerCloseFirstTime: [When close enough]
BossAIController: Player reached for first time - transitioning to full combat
BossAIController: Set full combat speed (run: 4.5, sprint: 6)
BossAIController: Switched to full combat FSM behaviour - [CombatFSMName]
```

## Files Created

| File | Purpose |
|------|---------|
| `SimpleBossFSMCreator.cs` | Editor script to create FSM asset |
| `vBossActivated.cs` | Decision: Is boss activated? |
| `vBossPlayerCloseFirstTime.cs` | Decision: Player close once? |
| `vTriggerBossRoar.cs` | Action: Trigger roar animation |
| `vSetBossMovementSpeed.cs` | Action: Set movement speed |
| `SimpleBossBehaviour.asset` | The FSM asset (generated) |

## Testing Commands (Context Menu)

Right-click `BossAIController` in inspector:
- **Reset Boss State** - Reset for testing
- **Test Cinematic Sequence** - Test animator switching
- **Test Roar Animation Only** - Test roar trigger

## That's It!

Once set up correctly, the boss will:
1. ✅ Idle until cinematic activates it
2. ✅ Roar at player dramatically  
3. ✅ Walk menacingly toward player
4. ✅ Automatically switch to full combat when close

No additional code or setup required! 🎮

