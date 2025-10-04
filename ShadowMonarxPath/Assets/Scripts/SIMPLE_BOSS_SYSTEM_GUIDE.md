# Simple Boss System - Complete Setup Guide

## 🎯 Overview

This is a **SIMPLIFIED** boss cinematic and AI system that:
- ✅ NO Cinemachine complexity
- ✅ Simple camera movement through poses
- ✅ Triggered automatically by GameManager Phase 4 → Boss transition
- ✅ Boss starts with SIMPLE behaviour (menacing walk)
- ✅ Boss switches to COMPLEX behaviour when close to player
- ✅ Easy to setup, easy to debug

---

## 📋 Part 1: Cinematic Camera Setup (10 minutes)

### Step 1.1: Create Cinematic Camera System

Create these GameObjects in hierarchy:

```
Hierarchy:
├── _BossCinematic (empty parent)
│   ├── SimpleCinematicCamera (empty GameObject)
│   ├── Pose_1_WideShot (empty GameObject)
│   ├── Pose_2_MediumShot (empty GameObject)
│   └── Pose_3_CloseUp (empty GameObject)
```

### Step 1.2: Configure SimpleCinematicCamera

1. Select **SimpleCinematicCamera** GameObject
2. Add **SimpleCinematicCamera** component
3. Configure:

#### Camera
- **Cinematic Camera:** Drag **Main Camera** (the one with Camera component)

#### Cinematic Poses
- **Poses:** Size = 3
  - Element 0: Drag **Pose_1_WideShot**
  - Element 1: Drag **Pose_2_MediumShot**
  - Element 2: Drag **Pose_3_CloseUp**

#### Player Control
- **Player:** Leave empty (auto-finds by "Player" tag)

### Step 1.3: Position and Configure Poses

#### Pose_1_WideShot (Boss Reveal)

1. Select **Pose_1_WideShot**
2. Add **SimpleCinematicPose** component
3. Configure:
   - **Field Of View:** 70
   - **Transition Duration:** 0.5 (quick cut)
   - **Ease Curve:** EaseInOut
   - **Hold Duration:** 1.5
   - **Look At Target:** Drag your **Boss** GameObject

4. **Position in Scene:**
   - Place camera to show full boss (wide shot)
   - Position: e.g., 10 units away from boss
   - Height: e.g., 2 units above ground
   - Rotate to face boss (or leave if using Look At Target)

#### Pose_2_MediumShot (Boss Face/Upper Body)

1. Select **Pose_2_MediumShot**
2. Add **SimpleCinematicPose** component
3. Configure:
   - **Field Of View:** 50
   - **Transition Duration:** 1.5 (slow zoom)
   - **Ease Curve:** EaseInOut
   - **Hold Duration:** 1.5
   - **Look At Target:** Drag your **Boss** GameObject

4. **Position in Scene:**
   - Place camera closer to boss (medium shot)
   - Position: e.g., 5 units away from boss
   - Height: e.g., at boss head level
   - Frame boss upper body/face

#### Pose_3_CloseUp (Dramatic Close-up or Player Reaction)

1. Select **Pose_3_CloseUp**
2. Add **SimpleCinematicPose** component
3. Configure:
   - **Field Of View:** 60
   - **Transition Duration:** 1.0
   - **Ease Curve:** EaseInOut
   - **Hold Duration:** 1.0
   - **Look At Target:** Drag **Boss** or **Player** GameObject

4. **Position in Scene:**
   - Place camera for dramatic angle
   - Option A: Very close to boss face
   - Option B: Behind boss looking at player
   - Experiment with positioning!

**Important:** Use Scene view to position poses. The GameObject's transform IS the camera position/rotation!

---

## 📋 Part 2: Boss AI Controller Setup (15 minutes)

### Step 2.1: Configure Boss GameObject

1. Select your **Boss** GameObject
2. Ensure it has these components:
   - `vControlAIMelee` (Invector AI)
   - `vFSMBehaviourController` (Invector FSM)
   - `BossAIController` (our script)
   - `Animator` (main animator)
   - `EnemyDeathNotifier` (to notify GameManager on death)

### Step 2.2: Setup Boss Animators

#### Main Animator
- This is your boss's regular animator with all combat animations
- Should have: Idle, Walk, Run, Attack animations
- **Keep enabled** in hierarchy

#### Roar Animator (Optional but Recommended)
1. Create child GameObject under Boss: "RoarAnimator"
2. Add **Animator** component
3. Assign animator controller with ONLY roar animation
4. **Disable** this animator in hierarchy (BossAIController will enable it)

### Step 2.3: Configure BossAIController Component

Select Boss → BossAIController component:

#### Boss State
- **Is Activated:** ✗ Unchecked (starts inactive)
- **Has Reached Player Once:** ✗ Unchecked

#### Components
- **Main Animator:** Drag boss's main Animator component
- **Roar Animator:** Drag RoarAnimator child's Animator (if you created one)
- **Roar Trigger Name:** "Roar" (must match trigger parameter in roar animator)

#### FSM Behaviour
- **Simple Behaviour:** Drag your SIMPLE FSM behaviour asset
  - This should make boss walk slowly towards player
  - No attacks, just menacing approach
- **Complex Behaviour:** Drag your COMPLEX FSM behaviour asset
  - This is your full combat behaviour (attacks, combos, etc.)

#### Behavior Transition
- **Combat Activation Distance:** 5.0
  - Boss switches from simple to complex when within this distance

#### Movement Speed Settings
- **Menacing Walk Speed:** 1.5 (slow, scary approach)
- **Normal Walk Speed:** 2.5
- **Run Speed:** 4.5
- **Sprint Speed:** 6.0

---

## 📋 Part 3: GameManager Integration (5 minutes)

### Step 3.1: Configure GameManager Boss Fight Setup

1. Select **GameManager** GameObject
2. Find **Boss Fight Setup** section
3. Configure:

#### Boss Fight Setup
- **Boss Controller:** Drag your **Boss** GameObject (with BossAIController)
- **Boss Cinematic Camera:** Drag **SimpleCinematicCamera** GameObject
- **Boss Roar SFX:** Assign roar sound effect AudioClip

That's it! GameManager will automatically:
1. Trigger cinematic when transitioning to Boss phase
2. Play camera sequence through poses
3. Play roar SFX
4. Trigger roar animation
5. Activate boss with simple behaviour
6. Boss will auto-switch to complex behaviour when close

---

## 📋 Part 4: Create FSM Behaviours (20 minutes)

### Step 4.1: Create Simple Behaviour

1. In Project window, navigate to `Assets/Prefabs/FSMBehaviour/`
2. Right-click → Create → Invector → FSM → FSM Behaviour
3. Name it: "SimpleBossBehaviour"
4. Double-click to open FSM editor
5. Create this simple state machine:

```
States:
├── Idle (default state)
│   Actions: None
│   Transitions:
│   └── If "Player In Range" → Chase
│
└── Chase
    Actions:
    └── Chase Target (follow player slowly)
    Transitions:
    └── If "Player Out of Range" → Idle
```

**Key Points:**
- NO attack actions
- Just chase/follow player
- Slow movement (BossAIController sets speed)

### Step 4.2: Create Complex Behaviour

1. Right-click → Create → Invector → FSM → FSM Behaviour
2. Name it: "ComplexBossBehaviour"
3. This is your full combat behaviour
4. Include:
   - Chase state
   - Attack states (melee attacks)
   - Combo states
   - Dodge/Block states (if needed)
   - Death state

**Use your existing CustomDemonBehaviour or create new one**

---

## 📋 Part 5: Testing Checklist

### ✅ Test 1: Cinematic Camera (5 minutes)

1. **Setup:**
   - Set GameManager → Starting Phase to "BossFight"
   - Ensure all poses are positioned
   - Ensure SimpleCinematicCamera has all references

2. **Test:**
   - Press Play
   - Cinematic should start automatically
   - Camera should move through 3 poses
   - Player input should be disabled during cinematic
   - After cinematic, player control returns

3. **Expected Console Output:**
   ```
   GameManager: Transitioning from Phase4 to BossFight
   GameManager: Starting boss cinematic
   SimpleCinematicCamera: Starting cinematic sequence
   SimpleCinematicCamera: Moving to pose 1/3
   SimpleCinematicCamera: Moving to pose 2/3
   SimpleCinematicCamera: Moving to pose 3/3
   SimpleCinematicCamera: Cinematic sequence complete
   BossAIController: Boss roar triggered
   BossAIController: Boss activated with simple behaviour
   ```

4. **Troubleshooting:**
   - ❌ Camera doesn't move → Check poses are assigned and positioned
   - ❌ Player can still move → Check player has vThirdPersonInput component
   - ❌ No roar animation → Check roar animator is assigned and has "Roar" trigger

### ✅ Test 2: Simple Behaviour (5 minutes)

1. **Setup:**
   - After cinematic completes
   - Boss should be activated

2. **Test:**
   - Boss should walk slowly towards player
   - NO attacks yet
   - Just menacing approach

3. **Expected Console Output:**
   ```
   BossAIController: Boss activated with simple behaviour
   BossAIController: Switched to simple behaviour - SimpleBossBehaviour
   BossAIController: Set menacing walk speed (1.5)
   ```

4. **Troubleshooting:**
   - ❌ Boss doesn't move → Check SimpleBehaviour is assigned
   - ❌ Boss attacks immediately → Check you assigned SIMPLE behaviour, not complex
   - ❌ Boss moves too fast → Check menacing walk speed setting

### ✅ Test 3: Behaviour Transition (5 minutes)

1. **Setup:**
   - Boss is in simple behaviour
   - Let boss approach player

2. **Test:**
   - When boss gets within 5 units of player
   - Boss should switch to complex behaviour
   - Boss should start attacking

3. **Expected Console Output:**
   ```
   BossAIController: Switched to complex behaviour - ComplexBossBehaviour
   BossAIController: Set full combat speed (run: 4.5, sprint: 6)
   ```

4. **Troubleshooting:**
   - ❌ Boss doesn't switch → Check Combat Activation Distance setting
   - ❌ Boss switches too early/late → Adjust Combat Activation Distance
   - ❌ Boss doesn't attack → Check ComplexBehaviour has attack actions

### ✅ Test 4: Boss Death (5 minutes)

1. **Setup:**
   - Boss is in combat
   - Reduce boss health to 0 (or use debug command)

2. **Test:**
   - Boss dies
   - GameManager should be notified
   - Victory phase should trigger
   - Loot should spawn

3. **Expected Console Output:**
   ```
   EnemyDeathNotifier: Death detected for Boss
   EnemyDeathNotifier: Notified GameManager of Boss death
   GameManager: Boss defeated!
   GameManager: Transitioning from BossFight to Victory
   GameManager: Spawned loot 'Item' at LootSpawnPoint_1
   ```

4. **Troubleshooting:**
   - ❌ No notification → Check boss has EnemyDeathNotifier component
   - ❌ No loot spawns → Check GameManager loot setup
   - ❌ No victory music → Check GameManager victory music assigned

### ✅ Test 5: Full Playthrough (10 minutes)

1. **Setup:**
   - Set GameManager → Starting Phase to "Phase1"
   - Ensure all phases are setup

2. **Test:**
   - Play through Phase 1 → 2 → 3 → 4 → Boss → Victory
   - Verify each transition works
   - Verify boss cinematic plays
   - Verify boss behaviour transitions
   - Verify boss death triggers victory

3. **Success Criteria:**
   - ✓ All phases transition smoothly
   - ✓ Boss cinematic plays automatically
   - ✓ Boss starts with simple behaviour
   - ✓ Boss switches to complex when close
   - ✓ Boss death spawns loot
   - ✓ Victory music plays

---

## 📋 Part 6: Debug Tools

### Context Menu Commands (Right-click BossAIController)

- **Reset Boss State** - Reset to inactive state
- **Force Switch to Complex Behaviour** - Manually switch to combat mode
- **Force Switch to Simple Behaviour** - Manually switch to walk mode
- **Test Cinematic Sequence** - Test animator swap and roar

### Context Menu Commands (Right-click SimpleCinematicCamera)

- **Test Play Cinematic** - Play cinematic sequence in play mode

### GameManager Debug GUI

Enable in GameManager:
- **Enable Debug Mode:** ✓
- **Show Debug GUI:** ✓

Then in play mode:
- Click "Boss Fight" button to jump to boss phase
- Use to quickly test boss without playing through all phases

---

## 📋 Part 7: Common Issues & Solutions

### Issue: Cinematic Doesn't Play

**Symptoms:** Transition to boss phase but no cinematic

**Fixes:**
1. ✓ Check SimpleCinematicCamera is assigned in GameManager
2. ✓ Check poses array is filled (3 poses)
3. ✓ Check poses have SimpleCinematicPose component
4. ✓ Check poses are positioned in scene (not at 0,0,0)
5. ✓ Check Main Camera is assigned in SimpleCinematicCamera

### Issue: Camera Doesn't Move

**Symptoms:** Cinematic starts but camera stays still

**Fixes:**
1. ✓ Check pose GameObjects are positioned in scene
2. ✓ Check transition durations are > 0
3. ✓ Check poses are in correct order in array
4. ✓ Look at console for error messages

### Issue: Boss Doesn't Move After Cinematic

**Symptoms:** Cinematic completes but boss stands still

**Fixes:**
1. ✓ Check SimpleBehaviour is assigned in BossAIController
2. ✓ Check boss has vControlAIMelee component
3. ✓ Check boss has vFSMBehaviourController component
4. ✓ Check SimpleBehaviour has Chase/Follow actions
5. ✓ Check player has "Player" tag

### Issue: Boss Attacks Immediately

**Symptoms:** Boss attacks right after cinematic, no slow walk

**Fixes:**
1. ✓ Check you assigned SIMPLE behaviour, not complex
2. ✓ Check SimpleBehaviour doesn't have attack actions
3. ✓ Check BossAIController calls SwitchToSimpleBehaviour on activate

### Issue: Boss Never Switches to Complex Behaviour

**Symptoms:** Boss walks slowly forever, never attacks

**Fixes:**
1. ✓ Check Combat Activation Distance is reasonable (5-10 units)
2. ✓ Check ComplexBehaviour is assigned
3. ✓ Check boss Update() is running (not disabled)
4. ✓ Manually test with "Force Switch to Complex Behaviour" context menu

### Issue: Roar Animation Doesn't Play

**Symptoms:** No roar during cinematic

**Fixes:**
1. ✓ Check Roar Animator is assigned in BossAIController
2. ✓ Check roar animator has "Roar" trigger parameter
3. ✓ Check Roar Trigger Name matches animator parameter
4. ✓ Check roar animator controller has roar animation
5. ✓ Check Boss Roar SFX is assigned in GameManager

---

## 📋 Part 8: FSM Behaviour Quick Setup

### Simple Behaviour Template

**Purpose:** Boss walks menacingly towards player, no attacks

**States:**
1. **Idle**
   - Default state
   - Transition: Player detected → Chase

2. **Chase**
   - Action: Chase Target
   - Speed: Walk (BossAIController sets to 1.5)
   - Transition: Player lost → Idle

**Decisions Needed:**
- Player In Range (detection range: 50 units)
- Player Lost (lost range: 60 units)

### Complex Behaviour Template

**Purpose:** Full combat with attacks

**States:**
1. **Idle**
   - Default state
   - Transition: Player detected → Chase

2. **Chase**
   - Action: Chase Target
   - Speed: Run
   - Transition: Player in attack range → Attack

3. **Attack**
   - Action: Melee Attack
   - Transition: Attack complete → Chase
   - Transition: Player out of range → Chase

4. **Combo** (Optional)
   - Action: Combo Attack
   - Transition: Combo complete → Chase

**Decisions Needed:**
- Player In Range (detection: 50 units)
- Player In Attack Range (attack: 3 units)
- Attack Cooldown Complete

---

## 📋 Part 9: Final Checklist

Before declaring boss system complete:

### Cinematic System
- [ ] SimpleCinematicCamera GameObject exists
- [ ] SimpleCinematicCamera component configured
- [ ] 3 poses created and positioned
- [ ] Each pose has SimpleCinematicPose component
- [ ] Poses assigned to SimpleCinematicCamera array
- [ ] Main Camera assigned
- [ ] Look At Targets assigned (usually boss)

### Boss AI
- [ ] Boss has BossAIController component
- [ ] Boss has vControlAIMelee component
- [ ] Boss has vFSMBehaviourController component
- [ ] Boss has EnemyDeathNotifier component
- [ ] Main animator assigned and enabled
- [ ] Roar animator created and assigned (optional)
- [ ] SimpleBehaviour FSM created and assigned
- [ ] ComplexBehaviour FSM created and assigned
- [ ] Combat Activation Distance set (5-10 units)
- [ ] Movement speeds configured

### GameManager Integration
- [ ] Boss Controller assigned in GameManager
- [ ] Boss Cinematic Camera assigned in GameManager
- [ ] Boss Roar SFX assigned in GameManager
- [ ] Boss Fight Music assigned in GameManager
- [ ] Victory Music assigned in GameManager
- [ ] Loot prefabs and spawn points assigned

### Testing
- [ ] Cinematic plays automatically on boss phase
- [ ] Camera moves through all poses smoothly
- [ ] Player input disabled during cinematic
- [ ] Boss activates after cinematic
- [ ] Boss starts with simple behaviour
- [ ] Boss walks slowly towards player
- [ ] Boss switches to complex when close
- [ ] Boss attacks in complex behaviour
- [ ] Boss death triggers victory phase
- [ ] Loot spawns on victory

---

## 🎉 System Complete!

Your boss system now:
- ✅ Has simple, no-Cinemachine camera system
- ✅ Automatically triggers from GameManager
- ✅ Boss starts with menacing walk
- ✅ Boss switches to combat when close
- ✅ Fully integrated with game phases
- ✅ Easy to setup and debug

**Next Steps:**
- Fine-tune pose positions for dramatic shots
- Adjust combat activation distance
- Polish FSM behaviours
- Add more attack variations
- Test full playthrough multiple times

---

## 📚 Related Documentation

- **COMPLETE_SETUP_GUIDE.md** - Full game setup
- **GAME_MANAGER_GUIDE.md** - GameManager API reference
- **QUICK_START_CHECKLIST.md** - Quick setup guide

---

**Estimated Setup Time:** 50 minutes
**Difficulty:** Medium
**Prerequisites:** Basic Unity knowledge, Invector AI understanding
