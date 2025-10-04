# Complete Game Setup Guide - A to Z

## 🎯 Overview

This guide will walk you through setting up the complete game from scratch, fixing all issues with:
1. Game Manager & Phase System
2. Enemy Spawning & Tracking
3. Phase Transition Triggers
4. Barrier System
5. Boss Cinematic System
6. Audio Management

---

## 📋 Part 1: Scene Hierarchy Setup (15 minutes)

### Step 1.1: Create Core Manager Objects

Create these GameObjects in your scene hierarchy:

```
Hierarchy:
├── GameManager (empty GameObject)
├── AudioManager (empty GameObject)
├── _PhaseSystem (empty GameObject, parent for organization)
│   ├── Phase1_Checkpoint (empty GameObject with Transform)
│   ├── Phase2_Checkpoint (empty GameObject with Transform)
│   ├── Phase3_Checkpoint (empty GameObject with Transform)
│   ├── Phase4_Checkpoint (empty GameObject with Transform)
│   ├── Phase5_BossCheckpoint (empty GameObject with Transform)
│   └── Phase6_VictoryCheckpoint (empty GameObject with Transform)
├── _PhaseTriggers (empty GameObject, parent for organization)
│   ├── Trigger_Phase1_to_Phase2 (GameObject with BoxCollider)
│   ├── Trigger_Phase2_to_Phase3 (GameObject with BoxCollider)
│   ├── Trigger_Phase3_to_Phase4 (GameObject with BoxCollider)
│   ├── Trigger_Phase4_to_Boss (GameObject with BoxCollider)
│   └── BossCinematicTrigger (GameObject with BoxCollider)
├── _PhaseBarriers (empty GameObject, parent for organization)
│   ├── Phase2_Barrier (GameObject with BoxCollider)
│   └── Phase4_Barrier (GameObject with BoxCollider)
├── _PhaseSpawners (empty GameObject, parent for organization)
│   ├── Phase2_Spawner (empty GameObject)
│   │   ├── SpawnPoint_1 (empty GameObject)
│   │   ├── SpawnPoint_2 (empty GameObject)
│   │   └── SpawnPoint_3 (empty GameObject)
│   └── Phase4_Spawner (empty GameObject)
│       ├── SpawnPoint_1 (empty GameObject)
│       ├── SpawnPoint_2 (empty GameObject)
│       ├── SpawnPoint_3 (empty GameObject)
│       ├── SpawnPoint_4 (empty GameObject)
│       └── SpawnPoint_5 (empty GameObject)
├── _PhaseItems (empty GameObject, parent for organization)
│   ├── HealingItemSpawnPoint (empty GameObject)
│   ├── LootSpawnPoint_1 (empty GameObject)
│   ├── LootSpawnPoint_2 (empty GameObject)
│   └── LootSpawnPoint_3 (empty GameObject)
└── _BossCinematic (empty GameObject, parent for organization)
    ├── BossCinemachineSequenceUtility (empty GameObject)
    ├── BossCinemachineCamera (GameObject with CinemachineCamera)
    ├── CinematicPose_1 (empty GameObject)
    ├── CinematicPose_2 (empty GameObject)
    └── CinematicPose_3 (empty GameObject)
```

---

## 📋 Part 2: GameManager Setup (10 minutes)

### Step 2.1: Configure GameManager Component

1. Select **GameManager** GameObject
2. Add **GameManager** component (if not already added)
3. Configure fields:

#### Audio System
- **Audio Manager:** Drag **AudioManager** GameObject here

#### Phase Music & Ambient
- **Phase 1 Music:** Assign eerie exploration music clip
- **Phase 1 Ambient:** Assign ambient wind/dungeon sounds
- **Phase 2 Combat Music:** Assign fast combat music
- **Phase 3 Rest Music:** Assign calm/peaceful music
- **Phase 4 Combat Music:** Assign intense combat music
- **Boss Fight Music:** Assign epic boss music
- **Victory Music:** Assign victory/celebration music

#### Phase 2 Setup
- **Phase 2 Spawner:** Drag **Phase2_Spawner** GameObject
- **Phase 2 Enemy Count:** Set to `3` (or desired number)
- **Phase 2 Barrier:** Drag **Phase2_Barrier** GameObject

#### Phase 3 Setup
- **Healing Item Prefab:** Assign your healing item prefab
- **Healing Item Spawn Point:** Drag **HealingItemSpawnPoint**

#### Phase 4 Setup
- **Phase 4 Spawner:** Drag **Phase4_Spawner** GameObject
- **Phase 4 Enemy Count:** Set to `5` (or desired number)
- **Phase 4 Barrier:** Drag **Phase4_Barrier** GameObject

#### Boss Fight Setup
- **Boss Controller:** Drag your Boss GameObject (with BossAIController)
- **Boss Cinematic Trigger:** Drag **BossCinematicTrigger** GameObject

#### Victory/Loot Setup
- **Loot Prefabs:** Size = 3, assign loot item prefabs
- **Loot Spawn Points:** Size = 3, drag LootSpawnPoint_1/2/3

#### Player Reference
- **Player:** Will auto-find by "Player" tag (or drag manually)
- **Phase Checkpoints:** Size = 6
  - Element 0: Phase1_Checkpoint
  - Element 1: Phase2_Checkpoint
  - Element 2: Phase3_Checkpoint
  - Element 3: Phase4_Checkpoint
  - Element 4: Phase5_BossCheckpoint
  - Element 5: Phase6_VictoryCheckpoint

#### Debug/Testing
- **Starting Phase:** Phase1 (for normal play) or any phase for testing
- **Enable Debug Mode:** ✓ (check for testing)
- **Show Debug GUI:** ✓ (check for on-screen controls)

---

## 📋 Part 3: AudioManager Setup (5 minutes)

### Step 3.1: Configure AudioManager Component

1. Select **AudioManager** GameObject
2. Add **AudioManager** component
3. Configure:
   - **Music Volume:** 0.7
   - **Ambient Volume:** 0.5
   - **SFX Volume:** 1.0
   - **Crossfade Duration:** 2.0

---

## 📋 Part 4: Phase Checkpoints Setup (5 minutes)

### Step 4.1: Position Checkpoints

Position each checkpoint Transform at key locations:

1. **Phase1_Checkpoint:** Starting area (player spawn point)
2. **Phase2_Checkpoint:** Just before first combat area entrance
3. **Phase3_Checkpoint:** Rest area entrance
4. **Phase4_Checkpoint:** Before final combat area
5. **Phase5_BossCheckpoint:** Boss arena entrance
6. **Phase6_VictoryCheckpoint:** (optional, not used for respawn)

**Important:** Rotate each checkpoint to face the direction player should look when spawning!

---

## 📋 Part 5: Phase Transition Triggers Setup (15 minutes)

### Step 5.1: Configure Each Trigger

#### Trigger_Phase1_to_Phase2

1. Select **Trigger_Phase1_to_Phase2**
2. Add **BoxCollider** component
   - ✓ **Is Trigger:** Checked
   - **Size:** Adjust to cover doorway/passage (e.g., 5, 3, 2)
3. Add **PhaseTransitionTrigger** component
   - **Target Phase:** Phase2
   - **One Shot:** ✓ Checked
   - **Trigger Layers:** Default (or set to include Player layer)
4. **Position:** Place at entrance to Phase 2 area

#### Trigger_Phase2_to_Phase3

1. Select **Trigger_Phase2_to_Phase3**
2. Add **BoxCollider** component
   - ✓ **Is Trigger:** Checked
   - **Size:** Adjust to cover passage
3. Add **PhaseTransitionTrigger** component
   - **Target Phase:** Phase3
   - **One Shot:** ✓ Checked
4. **Position:** Place AFTER Phase2_Barrier (player reaches after killing enemies)

#### Trigger_Phase3_to_Phase4

1. Select **Trigger_Phase3_to_Phase4**
2. Add **BoxCollider** component
   - ✓ **Is Trigger:** Checked
   - **Size:** Adjust to cover passage
3. Add **PhaseTransitionTrigger** component
   - **Target Phase:** Phase4
   - **One Shot:** ✓ Checked
4. **Position:** Place at exit of rest area

#### Trigger_Phase4_to_Boss

1. Select **Trigger_Phase4_to_Boss**
2. Add **BoxCollider** component
   - ✓ **Is Trigger:** Checked
   - **Size:** Adjust to cover passage
3. Add **PhaseTransitionTrigger** component
   - **Target Phase:** BossFight
   - **One Shot:** ✓ Checked
4. **Position:** Place AFTER Phase4_Barrier (before boss arena)

### Step 5.2: Verify Player Tag

**CRITICAL:** Ensure your player GameObject has the tag "Player"
- Select player GameObject
- Set Tag dropdown to "Player"

---

## 📋 Part 6: Barrier Setup (10 minutes)

### Step 6.1: Phase 2 Barrier

1. Select **Phase2_Barrier**
2. Add **BoxCollider** component
   - **Is Trigger:** ✗ UNCHECKED (solid collider)
   - **Size:** Adjust to block passage (e.g., 5, 3, 1)
3. **Position:** Place to block player progress after Phase 2 trigger
4. **Initial State:** Disabled in hierarchy (GameManager will enable it)
5. **Optional:** Add visual mesh (wall, gate, energy field, etc.)

### Step 6.2: Phase 4 Barrier

1. Select **Phase4_Barrier**
2. Add **BoxCollider** component
   - **Is Trigger:** ✗ UNCHECKED (solid collider)
   - **Size:** Adjust to block passage
3. **Position:** Place to block player progress after Phase 4 trigger
4. **Initial State:** Disabled in hierarchy
5. **Optional:** Add visual mesh

---

## 📋 Part 7: NPC Spawner Setup (15 minutes)

### Step 7.1: Phase 2 Spawner

1. Select **Phase2_Spawner**
2. Add **NPCSpawner** component
3. Configure:
   - **NPC Prefabs:** Size = 1-3
     - Add your skeleton enemy prefabs (basic skeletons)
   - **Spawn Points:** Size = 3
     - Drag SpawnPoint_1, SpawnPoint_2, SpawnPoint_3
   - **Number Of NPCs To Spawn:** 3
   - **Allow Multiple At Same Point:** ✗ Unchecked
   - **Waypoint Area:** (Optional) Assign if using AI waypoints
   - **Spawn On Start:** ✗ UNCHECKED (GameManager spawns them)

4. **Position Spawn Points:**
   - Place SpawnPoint_1/2/3 at strategic locations in Phase 2 combat area
   - Spread them out (not too close together)
   - Rotate to face desired enemy spawn direction

### Step 7.2: Phase 4 Spawner

1. Select **Phase4_Spawner**
2. Add **NPCSpawner** component
3. Configure:
   - **NPC Prefabs:** Size = 1-3
     - Add your skeleton enemy prefabs (harder variants)
   - **Spawn Points:** Size = 5
     - Drag SpawnPoint_1 through SpawnPoint_5
   - **Number Of NPCs To Spawn:** 5
   - **Allow Multiple At Same Point:** ✗ Unchecked
   - **Waypoint Area:** (Optional)
   - **Spawn On Start:** ✗ UNCHECKED

4. **Position Spawn Points:**
   - Place SpawnPoint_1/2/3/4/5 in Phase 4 combat area
   - More spread out than Phase 2
   - Consider tactical positioning

---

## 📋 Part 8: Boss Cinematic Setup (20 minutes)

### Step 8.1: Boss Cinematic Trigger

1. Select **BossCinematicTrigger**
2. Add **BoxCollider** component
   - ✓ **Is Trigger:** Checked
   - **Size:** Cover boss arena entrance (e.g., 6, 3, 2)
3. Add **BossCinemachinePoseTrigger** component
4. Configure:

#### Activation
- **One Shot:** ✓ Checked
- **Trigger Layers:** Default

#### References
- **Sequence Utility:** Drag **BossCinemachineSequenceUtility** GameObject
- **Main Camera:** Drag **Main Camera** (camera with CinemachineBrain)
- **Boss Cinemachine Camera:** Drag **BossCinemachineCamera**

#### Poses
- **Poses:** Size = 3
  - Element 0: Drag **CinematicPose_1**
  - Element 1: Drag **CinematicPose_2**
  - Element 2: Drag **CinematicPose_3**
- **Default Look At Target:** Drag your Boss GameObject

#### Boss Hooks
- **Boss Controller:** Drag your Boss GameObject (with BossAIController)
- **Roar Delay:** 1.5 (seconds into cinematic to trigger roar)
- **Total Duration:** 5.0 (total cinematic length)

5. **Position:** Place at boss arena entrance (player triggers when entering)

### Step 8.2: Boss Cinemachine Sequence Utility

1. Select **BossCinemachineSequenceUtility**
2. Add **BossCinemachineSequenceUtility** component
3. Configure:

#### Player / Invector
- **Player:** Will auto-find by "Player" tag (or drag manually)

#### Cinemachine
- **Main Camera:** Drag **Main Camera**
- **Cinemachine Brain:** Leave empty (auto-finds)
- **Boss Cinemachine Camera:** Drag **BossCinemachineCamera**

#### Sequence
- **Poses:** Size = 3
  - Element 0: Drag **CinematicPose_1**
  - Element 1: Drag **CinematicPose_2**
  - Element 2: Drag **CinematicPose_3**
- **Default Look At Target:** Drag your Boss GameObject

### Step 8.3: Boss Cinemachine Camera

1. Select **BossCinemachineCamera**
2. Add **CinemachineCamera** component (Unity 6 / Cinemachine 3.x)
3. Configure:
   - **Priority:** 20 (higher than player camera)
   - **Lens → Field of View:** 60
   - **Body:** Do Not Track Position (or Transposer)
   - **Aim:** Do Not Aim (or Composer)
   - **Initial State:** DISABLED (checkbox unchecked)

### Step 8.4: Cinematic Poses

For each pose (CinematicPose_1, CinematicPose_2, CinematicPose_3):

1. Select pose GameObject
2. Add **CinematicPose** component
3. Configure:

#### CinematicPose_1 (Wide Shot - Boss Reveal)
- **Field Of View:** 70
- **Transition Duration:** 0.5 (fast initial cut)
- **Transition Curve:** EaseInOut
- **Look At Target:** Boss GameObject
- **Hold Duration:** 1.5
- **Position:** Place camera for wide shot showing full boss

#### CinematicPose_2 (Medium Shot - Boss Face)
- **Field Of View:** 50
- **Transition Duration:** 1.5 (slow zoom)
- **Transition Curve:** EaseInOut
- **Look At Target:** Boss GameObject (or boss head bone)
- **Hold Duration:** 1.5
- **Position:** Place camera for medium shot of boss upper body/face

#### CinematicPose_3 (Player Reaction Shot)
- **Field Of View:** 60
- **Transition Duration:** 1.0
- **Transition Curve:** EaseInOut
- **Look At Target:** Player GameObject
- **Hold Duration:** 1.0
- **Position:** Place camera behind boss looking at player

**Important:** Position and rotate each pose GameObject to frame the shot you want!

---

## 📋 Part 9: Enemy Death Integration (10 minutes)

### Step 9.1: Modify Enemy Death Handler

You need to call GameManager when enemies die. Find your enemy death script and add this:

**Option A: If using Invector AI**

Find the script that handles AI death (usually in `vControlAI` or custom script) and add:

```csharp
// In your enemy death method
void OnDeath()
{
    // Your existing death logic...
    
    // Add this line:
    if (GameManager.Instance != null)
    {
        GameManager.Instance.OnEnemyDefeated(gameObject);
    }
}
```

**Option B: Create a Simple Death Notifier Component**

Create a new script `EnemyDeathNotifier.cs`:

```csharp
using UnityEngine;
using Invector.vCharacterController;

public class EnemyDeathNotifier : MonoBehaviour
{
    private vCharacter character;
    private bool hasNotified = false;

    void Start()
    {
        character = GetComponent<vCharacter>();
    }

    void Update()
    {
        if (!hasNotified && character != null && character.isDead)
        {
            hasNotified = true;
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnEnemyDefeated(gameObject);
            }
        }
    }
}
```

Add this component to your enemy prefabs.

---

## 📋 Part 10: Boss Death Integration (5 minutes)

### Step 10.1: Modify Boss Death Handler

In your boss death script (or BossAIController), add:

```csharp
// In boss death method
void OnBossDeath()
{
    // Your existing death logic...
    
    // Add this line:
    if (GameManager.Instance != null)
    {
        GameManager.Instance.OnBossDefeated();
    }
}
```

**Option B: Use the same EnemyDeathNotifier**

Add the `EnemyDeathNotifier` component to your Boss prefab.

---

## 📋 Part 11: Player Death Integration (5 minutes)

### Step 11.1: Modify Player Death Handler

Find your player death script and add:

```csharp
// In player death method
void OnPlayerDeath()
{
    // Your existing death logic...
    
    // Add this line:
    if (GameManager.Instance != null)
    {
        GameManager.Instance.OnPlayerDeath();
    }
}
```

---

## 📋 Part 12: Loot Collection Integration (5 minutes)

### Step 12.1: Create Loot Pickup Script

Create `LootPickup.cs`:

```csharp
using UnityEngine;

[RequireComponent(typeof(Collider))]
public class LootPickup : MonoBehaviour
{
    [SerializeField] private bool autoPickup = true;

    void Start()
    {
        // Ensure trigger
        var col = GetComponent<Collider>();
        if (col != null) col.isTrigger = true;
    }

    void OnTriggerEnter(Collider other)
    {
        if (!autoPickup) return;
        if (!other.CompareTag("Player")) return;

        CollectLoot();
    }

    public void CollectLoot()
    {
        // Notify GameManager
        if (GameManager.Instance != null)
        {
            GameManager.Instance.OnLootCollected(gameObject);
        }

        // Your loot collection logic (add to inventory, etc.)
        Debug.Log($"Collected loot: {gameObject.name}");

        // Destroy or disable
        gameObject.SetActive(false);
    }
}
```

Add this component to your loot item prefabs.

---

## 📋 Part 13: Testing Phase by Phase (30 minutes)

### Test Phase 1
1. Set **Starting Phase** to Phase1
2. Play scene
3. ✓ Check: Eerie music plays
4. ✓ Check: Walk to Trigger_Phase1_to_Phase2
5. ✓ Check: Music changes to combat
6. ✓ Check: Phase 2 enemies spawn
7. ✓ Check: Phase 2 barrier appears

### Test Phase 2
1. Kill all Phase 2 enemies
2. ✓ Check: Console shows enemy defeat messages
3. ✓ Check: Walk to Trigger_Phase2_to_Phase3
4. ✓ Check: Barrier should be disabled (walk through)
5. ✓ Check: Music changes to rest music
6. ✓ Check: Healing item spawns

### Test Phase 3
1. Walk to Trigger_Phase3_to_Phase4
2. ✓ Check: Music changes to intense combat
3. ✓ Check: Phase 4 enemies spawn (5 enemies)
4. ✓ Check: Phase 4 barrier appears

### Test Phase 4
1. Kill all Phase 4 enemies
2. ✓ Check: Console shows defeat messages
3. ✓ Check: Walk to Trigger_Phase4_to_Boss
4. ✓ Check: Music changes to boss music

### Test Boss Cinematic
1. Walk to BossCinematicTrigger
2. ✓ Check: Player input disabled
3. ✓ Check: Camera switches to cinematic
4. ✓ Check: Camera moves through 3 poses
5. ✓ Check: Boss roars at ~1.5 seconds
6. ✓ Check: After 5 seconds, control returns
7. ✓ Check: Boss is activated and attacks

### Test Boss Fight
1. Defeat boss
2. ✓ Check: Victory music plays
3. ✓ Check: 3 loot items spawn around boss
4. ✓ Check: Collect loot items
5. ✓ Check: Console shows "OnGameComplete" event

### Test Debug Mode
1. Enable Debug Mode in GameManager
2. Play scene
3. ✓ Check: Debug GUI appears top-left
4. ✓ Check: Click phase buttons to jump phases
5. ✓ Check: Click "Kill All Phase X Enemies" buttons

---

## 📋 Part 14: Common Issues & Fixes

### Issue: Triggers Not Working

**Symptoms:** Walking through trigger does nothing

**Fixes:**
1. ✓ Check trigger has **PhaseTransitionTrigger** component
2. ✓ Check BoxCollider **Is Trigger** is checked
3. ✓ Check player has "Player" tag
4. ✓ Check **Trigger Layers** includes player layer
5. ✓ Check GameManager exists in scene
6. ✓ Check trigger is positioned where player walks

### Issue: Enemies Not Spawning

**Symptoms:** Phase starts but no enemies appear

**Fixes:**
1. ✓ Check NPCSpawner is assigned in GameManager
2. ✓ Check NPC Prefabs array has prefabs
3. ✓ Check Spawn Points array has transforms
4. ✓ Check "Spawn On Start" is UNCHECKED
5. ✓ Check spawn points are positioned in scene
6. ✓ Check enemy count matches or is less than spawn points

### Issue: Barriers Don't Open

**Symptoms:** Killed all enemies but barrier still blocks

**Fixes:**
1. ✓ Check enemies have death notification (EnemyDeathNotifier)
2. ✓ Check console for "Enemy defeated" messages
3. ✓ Check enemy count in GameManager matches spawned count
4. ✓ Use Debug GUI to manually mark enemies defeated
5. ✓ Check barrier GameObject is assigned in GameManager

### Issue: Cinematic Doesn't Play

**Symptoms:** Walk through trigger but cinematic doesn't start

**Fixes:**
1. ✓ Check BossCinematicTrigger has **BossCinemachinePoseTrigger** component
2. ✓ Check all references are assigned (utility, camera, poses, boss)
3. ✓ Check BossCinemachineCamera is in scene and assigned
4. ✓ Check poses have **CinematicPose** component
5. ✓ Check Main Camera has **CinemachineBrain** component
6. ✓ Check player has "Player" tag

### Issue: Camera Doesn't Move During Cinematic

**Symptoms:** Cinematic starts but camera stays still

**Fixes:**
1. ✓ Check poses are positioned in scene (not at 0,0,0)
2. ✓ Check poses array is filled in both utility and trigger
3. ✓ Check BossCinemachineCamera priority is higher than player camera
4. ✓ Check pose transition durations are > 0
5. ✓ Check Look At Target is assigned

### Issue: Music Not Playing

**Symptoms:** No audio during phases

**Fixes:**
1. ✓ Check AudioManager exists and is assigned
2. ✓ Check AudioClips are assigned in GameManager
3. ✓ Check AudioListener exists in scene (usually on Main Camera)
4. ✓ Check volume settings in AudioManager
5. ✓ Check audio clips are not corrupted

---

## 📋 Part 15: Final Checklist

Before declaring complete, verify:

- [ ] GameManager exists with all references assigned
- [ ] AudioManager exists and configured
- [ ] 6 phase checkpoints positioned and assigned
- [ ] 4 phase transition triggers created and positioned
- [ ] 2 barriers created and assigned
- [ ] 2 NPC spawners configured with spawn points
- [ ] Boss cinematic system fully setup (trigger, utility, camera, 3 poses)
- [ ] Enemy death calls GameManager.OnEnemyDefeated()
- [ ] Boss death calls GameManager.OnBossDefeated()
- [ ] Player death calls GameManager.OnPlayerDeath()
- [ ] Loot items have LootPickup component
- [ ] Player has "Player" tag
- [ ] All AudioClips assigned
- [ ] Tested each phase individually
- [ ] Tested full playthrough Phase 1 → Victory

---

## 🎉 You're Done!

Your game should now have:
- ✅ Working phase system with automatic transitions
- ✅ Enemy spawning and tracking per phase
- ✅ Barriers that open when enemies defeated
- ✅ Cinematic boss introduction
- ✅ Audio management with phase-specific music
- ✅ Loot spawning and collection
- ✅ Player death and respawn system
- ✅ Debug tools for testing

**Next Steps:**
- Polish visual effects for barriers
- Add particle effects to phase transitions
- Create backend integration script for OnGameComplete/OnPlayerDied events
- Fine-tune audio volumes and crossfade timings
- Add more enemy variety
- Polish boss fight mechanics

---

For detailed API reference, see **GAME_MANAGER_GUIDE.md**
For quick reference, see **GAME_MANAGER_QUICK_REFERENCE.md**
