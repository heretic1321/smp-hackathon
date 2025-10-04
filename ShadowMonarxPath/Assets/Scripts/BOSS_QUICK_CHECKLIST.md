# Boss System - Quick Setup Checklist

## ⚡ 30-Minute Boss Setup

### Step 1: Create Cinematic (10 min)

```
Create GameObjects:
├── SimpleCinematicCamera (add SimpleCinematicCamera component)
├── Pose_1 (add SimpleCinematicPose component)
├── Pose_2 (add SimpleCinematicPose component)
└── Pose_3 (add SimpleCinematicPose component)
```

**Configure SimpleCinematicCamera:**
- Cinematic Camera → Main Camera
- Poses array → Drag 3 poses

**Position Each Pose:**
- Move GameObject to camera position
- Rotate to face boss (or use Look At Target)
- Set FOV, transition time, hold time

### Step 2: Setup Boss AI (10 min)

**Boss GameObject needs:**
- vControlAIMelee ✓
- vFSMBehaviourController ✓
- BossAIController ✓
- EnemyDeathNotifier ✓

**Configure BossAIController:**
- Main Animator → Boss animator
- Simple Behaviour → SimpleBossBehaviour asset
- Complex Behaviour → ComplexBossBehaviour asset
- Combat Activation Distance → 5.0

### Step 3: Create FSM Behaviours (10 min)

**SimpleBossBehaviour:**
- Idle state (default)
- Chase state (walk towards player, NO attacks)

**ComplexBossBehaviour:**
- Idle state
- Chase state
- Attack state (with melee attacks)

### Step 4: Connect to GameManager (5 min)

**GameManager → Boss Fight Setup:**
- Boss Controller → Drag Boss
- Boss Cinematic Camera → Drag SimpleCinematicCamera
- Boss Roar SFX → Assign audio clip

---

## ✅ Testing Checklist

### Test Cinematic
- [ ] Set Starting Phase to "BossFight"
- [ ] Press Play
- [ ] Camera moves through 3 poses
- [ ] Player input disabled during cinematic
- [ ] Roar plays
- [ ] Player control returns after

### Test Simple Behaviour
- [ ] Boss walks slowly towards player
- [ ] Boss does NOT attack
- [ ] Speed is slow/menacing

### Test Behaviour Transition
- [ ] Get close to boss (within 5 units)
- [ ] Boss switches to complex behaviour
- [ ] Boss starts attacking

### Test Boss Death
- [ ] Kill boss
- [ ] Victory phase triggers
- [ ] Loot spawns
- [ ] Victory music plays

---

## 🚨 Common Mistakes

1. **❌ Forgot to assign Simple Behaviour**
   - Boss doesn't move after cinematic
   - Fix: Assign SimpleBossBehaviour in BossAIController

2. **❌ Assigned Complex Behaviour to Simple slot**
   - Boss attacks immediately
   - Fix: Swap behaviours (Simple = walk only, Complex = combat)

3. **❌ Poses not positioned**
   - Camera doesn't move
   - Fix: Move pose GameObjects in scene view

4. **❌ No EnemyDeathNotifier on boss**
   - Boss death doesn't trigger victory
   - Fix: Add EnemyDeathNotifier component to boss

5. **❌ Combat distance too high**
   - Boss switches to complex too early
   - Fix: Set Combat Activation Distance to 5-10 units

---

## 🔧 Debug Commands

**Right-click BossAIController:**
- Reset Boss State
- Force Switch to Complex Behaviour
- Force Switch to Simple Behaviour

**Right-click SimpleCinematicCamera:**
- Test Play Cinematic

**GameManager Debug GUI:**
- Enable Debug Mode + Show Debug GUI
- Click "Boss Fight" button to jump to boss

---

## 📊 Expected Console Output

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
BossAIController: Switched to simple behaviour - SimpleBossBehaviour
[Player gets close]
BossAIController: Switched to complex behaviour - ComplexBossBehaviour
[Boss dies]
EnemyDeathNotifier: Notified GameManager of Boss death
GameManager: Boss defeated!
GameManager: Transitioning from BossFight to Victory
```

---

## 📐 Recommended Settings

**SimpleCinematicPose:**
- Pose 1: FOV 70, Transition 0.5s, Hold 1.5s
- Pose 2: FOV 50, Transition 1.5s, Hold 1.5s
- Pose 3: FOV 60, Transition 1.0s, Hold 1.0s

**BossAIController:**
- Menacing Walk Speed: 1.5
- Combat Activation Distance: 5.0
- Normal Walk Speed: 2.5
- Run Speed: 4.5

---

## 🎯 Success Criteria

- ✓ Cinematic plays automatically when entering boss phase
- ✓ Camera moves smoothly through 3 poses
- ✓ Boss walks slowly towards player after cinematic
- ✓ Boss switches to combat when close
- ✓ Boss attacks in combat mode
- ✓ Boss death triggers victory and loot

---

For detailed setup, see **SIMPLE_BOSS_SYSTEM_GUIDE.md**
