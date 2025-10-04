# Game Manager Quick Reference

## Quick Setup Checklist

### 1. Scene Setup (5 minutes)
- [ ] Create "GameManager" GameObject with GameManager component
- [ ] Create "AudioManager" GameObject with AudioManager component
- [ ] Assign all AudioClips in GameManager inspector
- [ ] Create 6 checkpoint Transforms (one per phase)
- [ ] Assign checkpoints to GameManager array

### 2. Phase Transitions (10 minutes)
- [ ] Create PhaseTransitionTrigger at each transition point
- [ ] Set target phase for each trigger
- [ ] Ensure colliders are triggers
- [ ] Verify "Player" tag on player

### 3. Combat Phases (15 minutes)
- [ ] Create/assign Phase 2 NPCSpawner + spawn points
- [ ] Create/assign Phase 4 NPCSpawner + spawn points
- [ ] Create Phase 2 barrier (collider GameObject)
- [ ] Create Phase 4 barrier (collider GameObject)
- [ ] Set enemy counts in GameManager

### 4. Boss & Loot (10 minutes)
- [ ] Assign BossAIController to GameManager
- [ ] Create loot spawn point Transforms
- [ ] Create loot prefabs array
- [ ] Match loot prefabs to spawn points (by index)

### 5. Integration (5 minutes)
- [ ] Add `GameManager.Instance.OnEnemyDefeated(gameObject)` to enemy death
- [ ] Add `GameManager.Instance.OnBossDefeated()` to boss death
- [ ] Add `GameManager.Instance.OnPlayerDeath()` to player death
- [ ] Add `GameManager.Instance.OnLootCollected(gameObject)` to loot pickup

---

## Essential Code Snippets

### Enemy Death Handler
```csharp
void OnDeath()
{
    // Your existing death logic...
    
    // Add this line:
    GameManager.Instance?.OnEnemyDefeated(gameObject);
}
```

### Boss Death Handler
```csharp
void OnBossDeath()
{
    // Your existing death logic...
    
    // Add this line:
    GameManager.Instance?.OnBossDefeated();
}
```

### Player Death Handler
```csharp
void OnPlayerDeath()
{
    // Your existing death logic...
    
    // Add this line:
    GameManager.Instance?.OnPlayerDeath();
}
```

### Loot Pickup Handler
```csharp
void OnTriggerEnter(Collider other)
{
    if (other.CompareTag("Player"))
    {
        // Your pickup logic...
        
        // Add this line:
        GameManager.Instance?.OnLootCollected(gameObject);
        
        // Destroy or disable loot
        gameObject.SetActive(false);
    }
}
```

### Backend Integration
```csharp
void Start()
{
    // Subscribe to game complete event
    GameManager.Instance.OnGameComplete.AddListener(OnGameComplete);
    GameManager.Instance.OnPlayerDied.AddListener(OnPlayerDied);
}

void OnGameComplete(GameEndData data)
{
    string json = data.ToJson();
    Debug.Log("Send to backend: " + json);
    // Your API call here
}

void OnPlayerDied(DeathData data)
{
    string json = data.ToJson();
    Debug.Log("Send to backend: " + json);
    // Your API call here
}
```

---

## Phase Flow Diagram

```
Phase 1 (Exploration)
    ↓ [Player enters trigger]
Phase 2 (Combat)
    ↓ [Kill all enemies → barrier opens]
    ↓ [Player enters trigger]
Phase 3 (Rest)
    ↓ [Player enters trigger]
Phase 4 (Combat)
    ↓ [Kill all enemies → barrier opens]
    ↓ [Player enters trigger]
Phase 5 (Boss Fight)
    ↓ [Boss defeated]
Phase 6 (Victory)
    → [Send backend event]
```

---

## Audio Manager Quick Commands

```csharp
// Music
AudioManager.Instance.PlayMusic(clip);
AudioManager.Instance.CrossfadeMusic(newClip, 2f);
AudioManager.Instance.StopMusic();

// Ambient (multiple can play)
AudioManager.Instance.PlayAmbient(clip);
AudioManager.Instance.StopAmbient(clip);
AudioManager.Instance.StopAllAmbient();

// SFX
AudioManager.Instance.PlaySFX(clip);
AudioManager.Instance.PlaySFXAtPosition(clip, position);

// Looping SFX
AudioSource source = AudioManager.Instance.PlayLooping(clip);
source.Stop(); // When done

// Global
AudioManager.Instance.StopAll();
AudioManager.Instance.PauseAll();
AudioManager.Instance.ResumeAll();
```

---

## Testing Shortcuts

### Inspector Settings
- **Starting Phase:** Set to test specific phase
- **Enable Debug Mode:** Extra logging
- **Show Debug GUI:** On-screen controls

### Context Menu (Right-click GameManager)
- Debug: Transition to Phase X
- Debug: Print Game State
- Debug: Kill All Phase X Enemies

### Runtime Hotkeys (via Debug GUI)
When Debug GUI enabled, click buttons to jump phases

---

## Common Configuration

### Typical Enemy Counts
- Phase 2: 3-5 basic enemies
- Phase 4: 5-8 harder enemies

### Typical Music Settings
- Music Volume: 0.7
- Ambient Volume: 0.5
- SFX Volume: 1.0
- Crossfade Duration: 2.0s

### Phase Checkpoint Positions
1. **Phase 1:** Starting area
2. **Phase 2:** Just before combat area
3. **Phase 3:** Rest area entrance
4. **Phase 4:** Before final combat
5. **Boss Fight:** Boss arena entrance
6. **Victory:** (unused)

---

## Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Music not playing | Check AudioManager reference, assign clips |
| Enemies not counting | Add OnEnemyDefeated() call to death handler |
| Barrier won't open | Verify enemy count matches spawned enemies |
| Phase won't transition | Check trigger collider and Player tag |
| Loot not spawning | Match array sizes (prefabs = spawn points) |
| Boss death not detected | Add OnBossDefeated() call to boss death |
| Player respawn fails | Assign checkpoint transforms |

---

## Inspector Field Quick Reference

### GameManager Component
```
Audio Manager
Phase 1-Victory Music (7 AudioClips)
Phase 2 Spawner, Enemy Count, Barrier
Phase 3 Healing Prefab, Spawn Point
Phase 4 Spawner, Enemy Count, Barrier
Boss Controller
Loot Prefabs Array, Spawn Points Array
Player, Phase Checkpoints Array
Starting Phase, Debug Mode, Show GUI
```

### AudioManager Component
```
Music Volume (0-1)
Ambient Volume (0-1)
SFX Volume (0-1)
Crossfade Duration (seconds)
```

### PhaseTransitionTrigger Component
```
Target Phase (dropdown)
One Shot (checkbox)
Trigger Layers (layer mask)
```

---

## Data Structures

### GameEndData (Victory)
- completionTime
- totalEnemiesDefeated
- enemiesDefeatedPhase2/4
- bossDefeated
- phase1-4Completed, bossFightCompleted
- lootItemsCollected, collectedLootNames
- finalHealthPercentage
- deathCount

### DeathData (Player Death)
- survivalTime
- deathPhase
- checkpointsReached
- phase1-4Completed, reachedBossFight
- totalEnemiesDefeated
- enemiesDefeatedPhase2/4
- deathCount
- lastHealthPercentage
- deathPosition

---

## 5-Minute Integration Test

1. Play scene from Phase 1
2. Walk to Phase 2 trigger → music changes, enemies spawn
3. Open Debug GUI, click "Kill All Phase 2 Enemies"
4. Walk to Phase 3 trigger → healing item spawns
5. Check console for "GameManager: ..." logs
6. ✓ System working!

---

For full documentation, see **GAME_MANAGER_GUIDE.md**

