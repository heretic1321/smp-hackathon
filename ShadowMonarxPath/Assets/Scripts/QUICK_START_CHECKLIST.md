# Quick Start Checklist - Get Running in 30 Minutes

## ⚡ Super Quick Setup (If You're in a Hurry)

### 1. Create Core Objects (5 min)
```
Create in Hierarchy:
- GameManager (empty)
- AudioManager (empty)
- _PhaseSystem (empty parent)
  - 6 checkpoint child objects
- _PhaseTriggers (empty parent)
  - 5 trigger child objects (BoxCollider + PhaseTransitionTrigger)
- _PhaseBarriers (empty parent)
  - 2 barrier child objects (BoxCollider, NOT trigger)
- _PhaseSpawners (empty parent)
  - Phase2_Spawner + 3 spawn points
  - Phase4_Spawner + 5 spawn points
```

### 2. Add Components (5 min)
- **GameManager** → Add `GameManager` component
- **AudioManager** → Add `AudioManager` component
- **Each trigger** → Add `PhaseTransitionTrigger` component
- **Each spawner** → Add `NPCSpawner` component
- **Enemy prefabs** → Add `EnemyDeathNotifier` component
- **Loot prefabs** → Add `LootPickup` component

### 3. Assign References (10 min)
Open GameManager inspector and drag:
- AudioManager
- All music clips
- Both spawners
- Both barriers
- All 6 checkpoints
- Boss reference
- Loot prefabs and spawn points

### 4. Position Everything (10 min)
- Place checkpoints at spawn locations
- Place triggers at doorways/transitions
- Place barriers to block passages
- Place spawn points in combat areas
- Rotate everything to face correct direction

### 5. Verify Player Tag
- Select player GameObject
- Set Tag to "Player"

### 6. Test!
- Press Play
- Check console for "GameManager: Initialized" message
- Walk through first trigger
- Verify enemies spawn

---

## 🔍 Diagnostic Tool

Add `GameManagerDiagnostics` component to any GameObject and:
- It auto-runs diagnostics on Start
- Press **F1** during play to re-run
- Check console for detailed report of what's missing

---

## ✅ Critical Checkpoints

Before testing, verify these are TRUE:

### GameManager
- [ ] GameManager GameObject exists in scene
- [ ] GameManager component attached
- [ ] AudioManager reference assigned
- [ ] At least 1 music clip assigned
- [ ] Phase 2 Spawner assigned
- [ ] Phase 4 Spawner assigned
- [ ] Phase 2 Barrier assigned
- [ ] Phase 4 Barrier assigned
- [ ] 6 checkpoints assigned in array

### Triggers
- [ ] At least 1 PhaseTransitionTrigger exists
- [ ] Trigger has BoxCollider component
- [ ] BoxCollider "Is Trigger" is CHECKED
- [ ] PhaseTransitionTrigger component attached
- [ ] Target Phase is set
- [ ] Trigger is positioned where player walks

### Player
- [ ] Player GameObject exists
- [ ] Player has "Player" tag (CRITICAL!)
- [ ] Player can move and collide with triggers

### Enemies
- [ ] Enemy prefabs have EnemyDeathNotifier component
- [ ] Spawners have enemy prefabs assigned
- [ ] Spawners have spawn points assigned
- [ ] Spawn points are positioned in scene

### Barriers
- [ ] Barriers have Collider component
- [ ] Collider "Is Trigger" is UNCHECKED (solid wall)
- [ ] Barriers are initially DISABLED in hierarchy

---

## 🚨 Top 5 Common Mistakes

### 1. Player Missing "Player" Tag
**Symptom:** Nothing happens when walking through triggers
**Fix:** Select player → Tag dropdown → "Player"

### 2. Trigger Collider Not Set to Trigger
**Symptom:** Player bumps into invisible wall
**Fix:** Select trigger → Collider component → Check "Is Trigger"

### 3. Barrier Collider Set to Trigger
**Symptom:** Player walks through barrier
**Fix:** Select barrier → Collider component → UNCHECK "Is Trigger"

### 4. Spawner "Spawn On Start" Enabled
**Symptom:** Enemies spawn immediately at game start
**Fix:** Select spawner → NPCSpawner → UNCHECK "Spawn On Start"

### 5. Enemy Missing EnemyDeathNotifier
**Symptom:** Killing enemies doesn't count, barriers don't open
**Fix:** Add EnemyDeathNotifier component to enemy prefabs

---

## 🎮 Quick Test Sequence

### Test 1: Basic Setup (30 seconds)
1. Press Play
2. Check console for "GameManager: Initialized at phase Phase1"
3. If you see it → ✅ Basic setup works!
4. If not → ❌ GameManager not in scene or has errors

### Test 2: Phase Transition (1 minute)
1. Walk to first trigger
2. Check console for "GameManager: Transitioning from Phase1 to Phase2"
3. If you see it → ✅ Triggers work!
4. If not → ❌ Check trigger setup (collider, component, player tag)

### Test 3: Enemy Spawning (30 seconds)
1. After Phase 2 starts
2. Check console for "GameManager: Spawned X enemies for Phase 2"
3. Look around for enemies
4. If enemies appear → ✅ Spawning works!
5. If not → ❌ Check spawner setup (prefabs, spawn points)

### Test 4: Enemy Tracking (1 minute)
1. Kill one enemy
2. Check console for "EnemyDeathNotifier: Notified GameManager"
3. Check console for "GameManager: Enemy defeated"
4. If you see both → ✅ Enemy tracking works!
5. If not → ❌ Add EnemyDeathNotifier to enemy prefabs

### Test 5: Debug GUI (30 seconds)
1. Enable "Show Debug GUI" in GameManager
2. Press Play
3. Look for debug panel top-left corner
4. Click phase buttons to jump phases
5. If it works → ✅ Full system operational!

---

## 📞 Still Having Issues?

### Run Diagnostics
1. Create empty GameObject named "Diagnostics"
2. Add `GameManagerDiagnostics` component
3. Press Play
4. Check console for detailed report
5. Fix any ❌ errors shown

### Check Console
- Look for RED errors (must fix)
- Look for YELLOW warnings (should fix)
- Look for "GameManager:" messages (good!)

### Enable Debug Mode
- GameManager → Enable Debug Mode ✓
- GameManager → Show Debug GUI ✓
- Press Play
- Use on-screen buttons to test

---

## 🎯 Minimal Working Setup

If you just want to test the system works:

```
Minimum Required:
1. GameManager with GameManager component
2. AudioManager with AudioManager component
3. ONE PhaseTransitionTrigger (Phase1 → Phase2)
4. Player with "Player" tag
5. 1 music clip assigned to Phase 1

That's it! This will let you test phase transitions.
```

Then gradually add:
- Spawners for enemies
- Barriers for blocking
- More triggers for more phases
- Boss cinematic system
- Loot system

---

## 📚 Full Documentation

For complete setup:
- **COMPLETE_SETUP_GUIDE.md** - Full A-Z guide (all features)
- **GAME_MANAGER_GUIDE.md** - Detailed API reference
- **GAME_MANAGER_QUICK_REFERENCE.md** - Code snippets

---

## ⏱️ Time Estimates

- **Minimal test setup:** 10 minutes
- **Basic playable (Phase 1-2):** 20 minutes
- **Full game (all phases):** 45-60 minutes
- **Boss cinematic:** +20 minutes
- **Polish and testing:** +30 minutes

**Total for complete setup:** ~2 hours

---

Good luck! 🚀
