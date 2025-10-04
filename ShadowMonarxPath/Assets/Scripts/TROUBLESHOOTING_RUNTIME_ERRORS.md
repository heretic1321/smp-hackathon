# Runtime Error Troubleshooting Guide

## 🔴 Error: Multiple Audio Listeners

### Symptom
```
There are 2 audio listeners in the scene. Please ensure there is always exactly one audio listener in the scene.
```

### Cause
Multiple cameras or GameObjects have Audio Listener components attached.

### Solution

**Step 1: Find All Audio Listeners**
1. In Unity, go to **Edit → Project Settings → Audio**
2. Or use this script to find them:

```csharp
// Paste in Console or create temporary script
foreach(AudioListener listener in FindObjectsOfType<AudioListener>())
{
    Debug.Log($"Audio Listener found on: {listener.gameObject.name}");
}
```

**Step 2: Remove Extra Listeners**

Common locations:
- ✓ **Main Camera** - Keep this one
- ❌ **Invector Third Person Camera** - Remove if present
- ❌ **Player Camera** - Remove if present
- ❌ **Any other cameras** - Remove

**How to Remove:**
1. Select the GameObject with extra Audio Listener
2. In Inspector, find **Audio Listener** component
3. Click the gear icon (⚙️) → **Remove Component**

**Keep ONLY ONE Audio Listener** - typically on Main Camera.

---

## 🔴 Error: NullReferenceException in FSM State

### Symptom
```
NullReferenceException: Object reference not set to an instance of an object
Invector.vCharacterController.AI.FSMBehaviour.vFSMState+FSMComponent..ctor
```

### Cause
Your FSM Behaviour asset has a state with empty or null actions list.

### Solution

**Option A: Regenerate SimpleBossBehaviour (QUICKEST FIX)**

The SimpleBossFSMCreator has been fixed. Regenerate the asset:

1. **In Unity menu:** `Tools → Boss System → Create Simple Boss FSM`
2. Click **"Yes"** to overwrite existing file
3. New SimpleBossBehaviour.asset will be created with proper initialization
4. Reassign to your boss if needed
5. Press Play - error should be gone!

**Option B: Check FSM Behaviour Assets Manually**

1. **Find Your FSM Behaviour Assets:**
   - Navigate to where you created SimpleBossBehaviour and ComplexBossBehaviour
   - Usually in `Assets/Prefabs/FSMBehaviour/` or `Assets/ScriptableObjects/`

2. **Check SimpleBossBehaviour:**
   - Double-click to open in FSM Editor
   - Check each state (Idle, Chase, etc.)
   - Ensure each state has at least one action OR is properly configured
   - If a state is empty, either:
     - Add an action (e.g., "Do Nothing" or "Wait")
     - Or remove the state if not needed

3. **Check ComplexBossBehaviour:**
   - Same process as above
   - Ensure all states have actions
   - Ensure transitions are properly configured

**Option B: Create New FSM Behaviours from Scratch**

If your FSM behaviours are corrupted:

1. **Delete old behaviours:**
   - Delete SimpleBossBehaviour asset
   - Delete ComplexBossBehaviour asset

2. **Create SimpleBossBehaviour:**
   ```
   Right-click in Project → Create → Invector → FSM → FSM Behaviour
   Name: SimpleBossBehaviour
   
   States:
   ├── Idle (Default State)
   │   Actions: [Empty is OK for idle]
   │   Transitions:
   │   └── If "Player In Range" → Chase
   │
   └── Chase
       Actions:
       └── Chase Target (Invector action)
       Transitions:
       └── If "Player Out of Range" → Idle
   ```

3. **Create ComplexBossBehaviour:**
   ```
   Right-click in Project → Create → Invector → FSM → FSM Behaviour
   Name: ComplexBossBehaviour
   
   States:
   ├── Idle (Default State)
   │   Actions: [Empty is OK]
   │   Transitions:
   │   └── If "Player In Range" → Chase
   │
   ├── Chase
   │   Actions:
   │   └── Chase Target
   │   Transitions:
   │   └── If "Player In Attack Range" → Attack
   │
   └── Attack
       Actions:
       └── Melee Attack (Invector action)
       Transitions:
       └── If "Attack Complete" → Chase
   ```

4. **Reassign to Boss:**
   - Select Boss GameObject
   - BossAIController component
   - Drag new SimpleBossBehaviour to Simple Behaviour slot
   - Drag new ComplexBossBehaviour to Complex Behaviour slot

**Option C: Temporary Workaround**

If you need to test other systems first:

1. **Disable Boss AI temporarily:**
   - Select Boss GameObject
   - Uncheck BossAIController component
   - Uncheck vFSMBehaviourController component

2. **Test other phases:**
   - Set GameManager Starting Phase to Phase1 or Phase2
   - Test enemy spawning, barriers, etc.

3. **Re-enable when FSM is fixed**

---

## 🔴 Common FSM Issues

### Issue: Empty Actions List

**Symptom:** NullReferenceException when entering a state

**Fix:**
- Open FSM Behaviour in editor
- Select the problematic state
- Add at least one action (even if it's "Do Nothing")
- Or ensure the state is properly initialized

### Issue: Missing Decisions

**Symptom:** State never transitions

**Fix:**
- Ensure decisions are created (e.g., "Player In Range")
- Assign decisions to transitions
- Check decision parameters (range values, etc.)

### Issue: Corrupted FSM Asset

**Symptom:** Persistent errors even after fixing

**Fix:**
- Delete the FSM Behaviour asset
- Create a new one from scratch
- Reassign to AI controller

---

## 🛠️ Quick Diagnostic Steps

### Step 1: Check Audio Listeners
```
1. Search hierarchy for "Camera"
2. Check each for Audio Listener component
3. Remove all except Main Camera
```

### Step 2: Check FSM Behaviours
```
1. Find SimpleBossBehaviour asset
2. Double-click to open
3. Check each state has actions or is empty-but-valid
4. Save and close
5. Repeat for ComplexBossBehaviour
```

### Step 3: Verify Boss Setup
```
1. Select Boss GameObject
2. Check BossAIController has both behaviours assigned
3. Check vFSMBehaviourController is enabled
4. Check vControlAIMelee is enabled
```

### Step 4: Test in Phases
```
1. Set GameManager Starting Phase to Phase1
2. Press Play
3. If no errors → audio fixed
4. Walk to Phase 2 → test enemy spawning
5. Set Starting Phase to BossFight → test boss
```

---

## 📋 Prevention Checklist

Before pressing Play:

- [ ] Only ONE Audio Listener in scene (on Main Camera)
- [ ] SimpleBossBehaviour asset exists and is valid
- [ ] ComplexBossBehaviour asset exists and is valid
- [ ] Both behaviours assigned in BossAIController
- [ ] All FSM states have actions (or are properly empty)
- [ ] Boss has all required components enabled
- [ ] GameManager has all references assigned

---

## 🔍 Debug Commands

### Find All Audio Listeners
```csharp
// In Console or temporary script
foreach(AudioListener listener in FindObjectsOfType<AudioListener>())
{
    Debug.Log($"Audio Listener on: {listener.gameObject.name} (Path: {GetGameObjectPath(listener.gameObject)})");
}

string GetGameObjectPath(GameObject obj)
{
    string path = obj.name;
    while (obj.transform.parent != null)
    {
        obj = obj.transform.parent.gameObject;
        path = obj.name + "/" + path;
    }
    return path;
}
```

### Check FSM Behaviour
```csharp
// Select Boss, run in Console
var boss = Selection.activeGameObject.GetComponent<BossAIController>();
Debug.Log($"Simple Behaviour: {(boss.simpleBehaviour != null ? "Assigned" : "NULL")}");
Debug.Log($"Complex Behaviour: {(boss.complexBehaviour != null ? "Assigned" : "NULL")}");
```

---

## 💡 Quick Fixes Summary

| Error | Quick Fix |
|-------|-----------|
| Multiple Audio Listeners | Remove Audio Listener from all cameras except Main Camera |
| FSM NullReference | Check FSM Behaviour assets, ensure states have actions |
| Boss doesn't move | Assign SimpleBossBehaviour and ComplexBossBehaviour |
| Boss attacks immediately | Check you assigned SIMPLE behaviour (not complex) |
| Cinematic doesn't play | Check SimpleCinematicCamera and poses are assigned |

---

## 🆘 Still Having Issues?

1. **Run GameManagerDiagnostics:**
   - Add GameManagerDiagnostics component to any GameObject
   - Press Play
   - Check console for detailed report

2. **Check Console for Specific Errors:**
   - Red errors = must fix
   - Yellow warnings = should fix
   - Look for "GameManager:" messages for system status

3. **Test Individual Systems:**
   - Disable boss temporarily
   - Test Phase 1 → 2 transition first
   - Add systems back one at a time

4. **Create Minimal FSM:**
   - Create simplest possible FSM (just Idle state)
   - Test if that works
   - Gradually add complexity

---

For more help, see:
- **SIMPLE_BOSS_SYSTEM_GUIDE.md** - Boss setup
- **COMPLETE_SETUP_GUIDE.md** - Full game setup
- **GAME_MANAGER_GUIDE.md** - API reference
