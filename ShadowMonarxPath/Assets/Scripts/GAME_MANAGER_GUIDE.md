# Game Manager System - Complete Setup Guide

## Overview

The Game Manager system is the master orchestrator for the entire game, managing all phases, tracking state, coordinating audio, spawning NPCs, and handling player/boss death events.

## System Components

### 1. GameManager.cs
The central controller that manages all game phases and state.

### 2. AudioManager.cs
Handles all audio playback with dynamic AudioSource creation.

### 3. PhaseTransitionTrigger.cs
Trigger zones placed in the scene to transition between phases.

### 4. Data Classes
- `GameEndData.cs` - Victory statistics
- `DeathData.cs` - Player death statistics

---

## Game Phases

### Phase 1: Initial Exploration
- **Music:** Eerie ambient + background music
- **Enemies:** None
- **Objective:** Explore and reach Phase 2 trigger

### Phase 2: First Combat
- **Music:** Fast-paced combat music
- **Enemies:** Basic skeletons (configurable count)
- **Barrier:** Active until all enemies defeated
- **Objective:** Defeat all enemies to proceed

### Phase 3: Rest Phase
- **Music:** Calm/rest music
- **Enemies:** None
- **Items:** Healing item spawns
- **Objective:** Heal and prepare for Phase 4

### Phase 4: Final Combat
- **Music:** Intense combat music
- **Enemies:** More skeletons (configurable count)
- **Barrier:** Active until all enemies defeated
- **Objective:** Defeat all enemies to reach boss

### Phase 5: Boss Fight
- **Music:** Epic boss music
- **Enemies:** Boss
- **Cinematic:** Automatic boss intro cinematic
- **Objective:** Defeat the boss

### Phase 6: Victory
- **Music:** Victory music
- **Loot:** Spawns at designated locations
- **Event:** Fires `OnGameComplete` event for backend

---

## Scene Setup

### Step 1: Create GameManager GameObject

1. Create empty GameObject named "GameManager"
2. Add `GameManager` component
3. Configure in inspector:

#### Audio System
- **Audio Manager:** Assign or leave empty (auto-finds)

#### Phase Music & Ambient
- Assign AudioClips for each phase:
  - Phase 1 Music
  - Phase 1 Ambient
  - Phase 2 Combat Music
  - Phase 3 Rest Music
  - Phase 4 Combat Music
  - Boss Fight Music
  - Victory Music

#### Phase 2 Setup
- **Phase 2 Spawner:** Assign NPCSpawner for Phase 2
- **Phase 2 Enemy Count:** Number of enemies to spawn
- **Phase 2 Barrier:** GameObject with collider to block player

#### Phase 3 Setup
- **Healing Item Prefab:** Prefab of healing item
- **Healing Item Spawn Point:** Transform where it spawns

#### Phase 4 Setup
- **Phase 4 Spawner:** Assign NPCSpawner for Phase 4
- **Phase 4 Enemy Count:** Number of enemies to spawn
- **Phase 4 Barrier:** GameObject with collider to block player

#### Boss Fight Setup
- **Boss Controller:** Assign BossAIController
- **Boss Cinematic Trigger:** (Optional reference)

#### Victory/Loot Setup
- **Loot Prefabs:** Array of loot item prefabs
- **Loot Spawn Points:** Array of transforms (matched by index)

#### Player Reference
- **Player:** Auto-finds by "Player" tag
- **Phase Checkpoints:** Array of transforms (one per phase)

#### Debug/Testing
- **Starting Phase:** Which phase to start from (for testing)
- **Enable Debug Mode:** Show extra logging
- **Show Debug GUI:** On-screen debug panel

### Step 2: Create AudioManager GameObject

1. Create empty GameObject named "AudioManager"
2. Add `AudioManager` component
3. Configure volume settings:
   - **Music Volume:** 0-1
   - **Ambient Volume:** 0-1
   - **SFX Volume:** 0-1
   - **Crossfade Duration:** Default transition time

### Step 3: Setup Phase Checkpoints

1. Create empty GameObjects at key positions:
   - Checkpoint_Phase1 (starting position)
   - Checkpoint_Phase2 (after Phase 1 trigger)
   - Checkpoint_Phase3 (rest area)
   - Checkpoint_Phase4 (before final combat)
   - Checkpoint_BossFight (boss arena entrance)
   - Checkpoint_Victory (not needed)

2. Assign to GameManager → Phase Checkpoints array (in order)

### Step 4: Create Phase Transition Triggers

For each phase transition:

1. Create GameObject with BoxCollider (or SphereCollider)
2. Set as trigger
3. Add `PhaseTransitionTrigger` component
4. Configure:
   - **Target Phase:** Phase to transition to
   - **One Shot:** True (recommended)
   - **Trigger Layers:** Default (includes Player)
5. Position at transition point
6. Name descriptively (e.g., "Trigger_Phase2", "Trigger_Phase3")

**Recommended Trigger Positions:**
- Between Phase 1 → Phase 2: At entrance to combat area
- Between Phase 2 → Phase 3: After Phase 2 barrier (auto-opens when enemies dead)
- Between Phase 3 → Phase 4: At exit of rest area
- Between Phase 4 → Boss: After Phase 4 barrier (auto-opens when enemies dead)

### Step 5: Setup Barriers

1. **Phase 2 Barrier:**
   - GameObject with collider (non-trigger)
   - Position to block player progress after Phase 2 trigger
   - Initially disabled (GameManager enables it)

2. **Phase 4 Barrier:**
   - GameObject with collider (non-trigger)
   - Position to block player progress after Phase 4 trigger
   - Initially disabled (GameManager enables it)

### Step 6: Setup NPC Spawners

Create two NPCSpawner GameObjects:

**Phase 2 Spawner:**
- Add `NPCSpawner` component
- Configure NPC prefabs (basic skeletons)
- Configure spawn points (Transform references)
- Set spawn count to match Phase 2 Enemy Count
- Don't enable "Spawn On Start"

**Phase 4 Spawner:**
- Add `NPCSpawner` component
- Configure NPC prefabs (more/stronger skeletons)
- Configure spawn points (Transform references)
- Set spawn count to match Phase 4 Enemy Count
- Don't enable "Spawn On Start"

### Step 7: Setup Loot Spawns

1. Create empty GameObjects for loot spawn positions
2. Name them descriptively (e.g., "LootSpawn_1", "LootSpawn_2")
3. Position around boss arena
4. Assign to GameManager → Loot Spawn Points array

---

## Integration with Existing Systems

### Enemy Death Integration

Add this to your enemy death handler (Invector health system or custom):

```csharp
// When enemy dies
if (GameManager.Instance != null)
{
    GameManager.Instance.OnEnemyDefeated(gameObject);
}
```

### Boss Death Integration

Add to BossAIController or boss health component:

```csharp
// When boss dies
if (GameManager.Instance != null)
{
    GameManager.Instance.OnBossDefeated();
}
```

### Player Death Integration

Add to player health component:

```csharp
// When player dies
if (GameManager.Instance != null)
{
    GameManager.Instance.OnPlayerDeath();
}
```

### Loot Collection Integration

Add to loot pickup script:

```csharp
// When player collects loot
if (GameManager.Instance != null)
{
    GameManager.Instance.OnLootCollected(gameObject);
}
```

---

## Audio Manager Usage

The AudioManager is automatically called by GameManager, but you can also use it directly:

### Play Music
```csharp
AudioManager.Instance.PlayMusic(musicClip, loop: true);
```

### Crossfade Music
```csharp
AudioManager.Instance.CrossfadeMusic(newMusicClip, duration: 2f);
```

### Play Ambient Sound
```csharp
AudioManager.Instance.PlayAmbient(ambientClip);
```

### Play Sound Effect
```csharp
AudioManager.Instance.PlaySFX(sfxClip);
```

### Play Looping Sound Effect
```csharp
AudioSource source = AudioManager.Instance.PlayLooping(loopClip);
// Later: source.Stop();
```

### Stop All Audio
```csharp
AudioManager.Instance.StopAll();
```

---

## Backend Integration

### Game Complete Event

Subscribe to the completion event:

```csharp
public class BackendIntegration : MonoBehaviour
{
    void Start()
    {
        if (GameManager.Instance != null)
        {
            GameManager.Instance.OnGameComplete.AddListener(HandleGameComplete);
        }
    }

    void HandleGameComplete(GameEndData data)
    {
        Debug.Log("Game completed!");
        data.PrintSummary();
        
        // Send to backend API
        string json = data.ToJson();
        // StartCoroutine(SendToBackend(json));
    }
}
```

### Player Death Event

Subscribe to the death event:

```csharp
void Start()
{
    if (GameManager.Instance != null)
    {
        GameManager.Instance.OnPlayerDied.AddListener(HandlePlayerDeath);
    }
}

void HandlePlayerDeath(DeathData data)
{
    Debug.Log("Player died!");
    data.PrintSummary();
    
    // Send to backend API
    string json = data.ToJson();
    // StartCoroutine(SendToBackend(json));
}
```

---

## Testing & Debugging

### Debug Mode

Enable in GameManager inspector:
- **Enable Debug Mode:** Extra logging
- **Show Debug GUI:** On-screen controls

### Context Menu Commands

Right-click GameManager component:
- **Debug: Transition to Phase X** - Jump to any phase
- **Debug: Print Game State** - Show current statistics
- **Debug: Kill All Phase X Enemies** - Mark enemies as defeated

### On-Screen Debug GUI

When enabled, shows:
- Current phase
- Enemy counts
- Boss status
- Loot count
- Death count
- Time elapsed
- Quick phase transition buttons

### Starting Phase Selection

Set **Starting Phase** in GameManager to test individual phases:
- Automatically teleports player to checkpoint
- Marks previous phases as completed
- Sets up phase state correctly

### Testing Individual Phases

**Test Phase 2:**
1. Set Starting Phase to Phase2
2. Play scene
3. Player spawns at Phase 2 checkpoint
4. Enemies auto-spawn
5. Defeat all to test barrier removal

**Test Boss Fight:**
1. Set Starting Phase to BossFight
2. Play scene
3. Player spawns at boss entrance
4. Walk to cinematic trigger to test boss intro

---

## Common Issues & Solutions

### Issue: Enemies not triggering GameManager
**Solution:** Add `GameManager.Instance.OnEnemyDefeated(gameObject)` to enemy death handlers

### Issue: Barriers not opening
**Solution:** Check that enemy count matches spawned enemies, and OnEnemyDefeated is being called

### Issue: Music not playing
**Solution:** Verify AudioManager reference is set, and AudioClips are assigned in inspector

### Issue: Phase transitions not working
**Solution:** Check PhaseTransitionTrigger has correct collider (is trigger), and player has "Player" tag

### Issue: Loot not spawning
**Solution:** Verify loot prefabs and spawn point arrays have matching counts

---

## API Reference

### GameManager Public Methods

```csharp
// Phase Management
void TransitionToPhase(GamePhase phase)
GamePhase GetCurrentPhase()

// Enemy Tracking
void OnEnemyDefeated(GameObject enemy)
bool AreAllEnemiesDefeatedInCurrentPhase()
int GetTotalEnemiesDefeated()

// Boss Tracking
void OnBossDefeated()
bool IsBossDefeated()

// Loot System
void OnLootCollected(GameObject loot)
int GetCollectedLootCount()

// Player Death
void OnPlayerDeath()
```

### AudioManager Public Methods

```csharp
// Music
void PlayMusic(AudioClip clip, bool loop = true)
void CrossfadeMusic(AudioClip newClip, float duration = -1f)
void StopMusic(bool fade = false, float fadeDuration = 1f)
void SetMusicVolume(float volume)

// Ambient
AudioSource PlayAmbient(AudioClip clip, float volume = -1f)
void StopAmbient(AudioClip clip)
void StopAllAmbient()
void SetAmbientVolume(float volume)

// SFX
void PlaySFX(AudioClip clip, float volume = -1f)
void PlaySFXAtPosition(AudioClip clip, Vector3 position, float volume = -1f)
AudioSource PlayLooping(AudioClip clip, float volume = -1f)
void SetSFXVolume(float volume)

// Global
void StopAll()
void PauseAll()
void ResumeAll()
void SetMasterVolume(float volume)
```

---

## Example Workflow

1. **Scene Start:** GameManager initializes to Phase 1
2. **Phase 1:** Player explores, eerie music plays
3. **Trigger Phase 2:** Player walks through transition trigger
4. **Phase 2:** Combat music starts, enemies spawn, barrier activates
5. **Clear Phase 2:** Player defeats all enemies
6. **Transition Phase 3:** Player walks through trigger, barrier opens
7. **Phase 3:** Rest music plays, healing item spawns
8. **Trigger Phase 4:** Player walks through transition trigger
9. **Phase 4:** Intense combat music, more enemies spawn, barrier activates
10. **Clear Phase 4:** Player defeats all enemies
11. **Trigger Boss:** Player walks through trigger, barrier opens
12. **Boss Fight:** Boss music plays, cinematic triggers automatically
13. **Boss Defeated:** GameManager called, transitions to Victory
14. **Victory:** Victory music, loot spawns, OnGameComplete event fires
15. **Backend:** Backend script receives event and sends data to API

---

## Notes

- All systems use Singleton pattern for easy global access
- Extensive debugging tools for testing each phase independently
- Fully integrated with existing Invector and Boss systems
- Events use UnityEvents for flexible backend integration
- All state is tracked and available for analytics

---

For questions or issues, check the debug logs or enable Debug Mode for detailed information.

