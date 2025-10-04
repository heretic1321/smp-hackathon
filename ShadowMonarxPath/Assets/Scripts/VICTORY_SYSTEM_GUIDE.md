# Victory System - Boss Defeat Flow

## ✅ What Happens When Boss is Defeated

### Immediate Actions (0 seconds):
1. **Boss Death Detected** → `GameManager.OnBossDefeated()` is called
2. **Loot Spawns Instantly** → All loot prefabs spawn at designated locations
3. **Victory Music Plays** → Audio crossfades to victory theme
4. **Timer Starts** → 20-second countdown begins

### During Countdown (0-20 seconds):
- Player can freely collect loot
- Console logs countdown every 5 seconds (and every second in final 5)
- Game remains playable

### After Countdown (20 seconds):
1. **Victory Phase Transition** → Game state changes to Victory
2. **Game End Event Fires** → `OnGameComplete` UnityEvent triggered
3. **Backend Integration** → External script receives game completion data

---

## 🎛️ Customizable Settings

### In GameManager Inspector:

**Victory/Loot Setup → Victory Delay Before Game End**
- **Type:** Slider (5 to 60 seconds)
- **Default:** 20 seconds
- **Purpose:** Time player has to collect loot before game ends

### Recommended Values:

- **10s:** Quick victory (speedrun mode)
- **20s:** Default (balanced) ✅
- **30s:** Extended collection time
- **45s:** Generous exploration time
- **60s:** Maximum time for screenshots/celebration

---

## 🎬 Complete Victory Sequence

```
Boss Health Reaches 0
    ↓
Boss AI sends death notification
    ↓
GameManager.OnBossDefeated() called
    ↓
[IMMEDIATE - 0 seconds]
    ✅ Loot spawns at all spawn points
    ✅ Victory music starts playing
    ✅ Console: "Boss defeated! Starting victory sequence..."
    ✅ Console: "Loot spawned. Player has 20 seconds to collect."
    ↓
[COUNTDOWN - 0 to 20 seconds]
    Player collects loot
    Console logs: "Game will end in X seconds..."
    ↓
[TIMER COMPLETE - 20 seconds]
    ✅ Console: "Victory countdown complete! Sending game end event..."
    ✅ Game transitions to Victory phase
    ✅ OnGameComplete event fires
    ✅ Backend receives completion data
```

---

## 📋 Setup Requirements

### GameManager Inspector:

#### Victory/Loot Setup:
- [ ] **Loot Prefabs:** Array of loot GameObjects to spawn
- [ ] **Loot Spawn Points:** Array of Transform positions (must match loot prefabs count)
- [ ] **Victory Delay Before Game End:** 20 seconds (or custom)

#### Audio Setup:
- [ ] **Victory Music:** AudioClip for victory theme

#### Events:
- [ ] **OnGameComplete:** UnityEvent listener connected to backend script

### Boss Setup:

#### Boss GameObject:
- [ ] Has Invector health component
- [ ] Health component's **OnDead** UnityEvent calls `GameManager.OnBossDefeated()`

---

## 🔌 How to Connect Boss Death

### Method 1: UnityEvent (Recommended)

1. Select **Boss GameObject** in hierarchy
2. Find **vHealthController** component (or similar)
3. Locate **OnDead** UnityEvent
4. Click **+** to add listener
5. Drag **GameManager** GameObject to object field
6. Select **GameManager → OnBossDefeated()**

### Method 2: Code Integration

If you have a custom boss death script:

```csharp
// In your boss death script
void OnBossDeath()
{
    // Your death logic...
    
    // Notify GameManager
    GameManager gameManager = FindObjectOfType<GameManager>();
    if (gameManager != null)
    {
        gameManager.OnBossDefeated();
    }
}
```

---

## 🎮 Testing

### Quick Test:

1. **Start Game** → Enter play mode
2. **Skip to Boss Phase** → Use GameManager debug menu: `Debug → Force Boss Phase`
3. **Kill Boss** → Reduce boss health to 0 (or use debug tool)
4. **Observe:**
   - Loot spawns immediately ✅
   - Victory music plays ✅
   - Console shows countdown ✅
   - After 20s, game end event fires ✅

### Expected Console Output:

```
GameManager: Boss defeated! Starting victory sequence...
GameManager: Loot spawned. Player has 20 seconds to collect.
AudioManager: Crossfading music to victory theme
GameManager: Victory countdown started - 20 seconds until game end

[5 seconds later]
GameManager: Game will end in 15 seconds...

[5 seconds later]
GameManager: Game will end in 10 seconds...

[5 seconds later]
GameManager: Game will end in 5 seconds...
GameManager: Game will end in 4 seconds...
GameManager: Game will end in 3 seconds...
GameManager: Game will end in 2 seconds...
GameManager: Game will end in 1 seconds...

[Timer complete]
GameManager: Victory countdown complete! Sending game end event...
GameManager: Transitioning from BossFight to Victory
GameManager: Phase 6 - Victory! (This phase is now handled by OnBossDefeated)
GameManager: Sending game completion event
```

---

## 🎯 Loot Collection Tracking

### Loot Pickup Script:

Each loot prefab should have a **LootPickup** component:

```csharp
public class LootPickup : MonoBehaviour
{
    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            // Notify GameManager
            GameManager gm = FindObjectOfType<GameManager>();
            if (gm != null)
            {
                gm.OnLootCollected(gameObject);
            }
            
            // Destroy or hide loot
            Destroy(gameObject);
        }
    }
}
```

### Loot Spawn Points:

- Create empty GameObjects at desired loot locations
- Name them: `LootSpawn_1`, `LootSpawn_2`, etc.
- Assign to **Loot Spawn Points** array in GameManager
- **Important:** Array count must match Loot Prefabs count

---

## 🔍 Troubleshooting

### Loot Not Spawning

**Check:**
- [ ] Loot Prefabs array is not empty
- [ ] Loot Spawn Points array is not empty
- [ ] Both arrays have same count
- [ ] Spawn points have valid positions (not at 0,0,0)

**Console Error:**
```
GameManager: Cannot spawn loot - prefabs or spawn points mismatch
```

### Game End Event Not Firing

**Check:**
- [ ] OnGameComplete event has listeners
- [ ] Backend script is in scene
- [ ] Backend script is listening to event

**Console:**
```
GameManager: Victory countdown complete! Sending game end event...
GameManager: Sending game completion event
```

### Boss Death Not Triggering Victory

**Check:**
- [ ] Boss health component has OnDead event
- [ ] OnDead event calls `GameManager.OnBossDefeated()`
- [ ] GameManager reference is valid

**Test:**
```csharp
// Add debug log in boss death
Debug.Log("Boss died - calling GameManager.OnBossDefeated()");
```

### Countdown Too Fast/Slow

**Adjust:**
- GameManager → Victory/Loot Setup → **Victory Delay Before Game End**
- Increase for more time, decrease for less

---

## 💡 Advanced Customization

### Different Countdown Intervals

Edit `VictoryCountdownCoroutine()` in GameManager.cs:

```csharp
// Current: Log every 5 seconds
if (timeRemaining % 5 == 0 || timeRemaining <= 5)

// Every 10 seconds:
if (timeRemaining % 10 == 0 || timeRemaining <= 5)

// Every second:
if (true)  // Always log
```

### Victory UI Countdown

Add a UI text element:

```csharp
[SerializeField] private Text victoryCountdownText;

// In VictoryCountdownCoroutine():
if (victoryCountdownText != null)
{
    victoryCountdownText.text = $"Game ending in: {timeRemaining}s";
}
```

### Cancel Countdown

Add a public method:

```csharp
public void CancelVictoryCountdown()
{
    StopAllCoroutines();
    Debug.Log("Victory countdown cancelled");
}
```

---

## 📊 Victory Flow Diagram

```
┌─────────────────────┐
│   Boss Defeated     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Spawn Loot (0s)    │ ◄── Immediate
│  Play Victory Music │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Start 20s Timer    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Player Collects    │ ◄── 0-20 seconds
│  Loot (Optional)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Timer Complete     │ ◄── 20 seconds
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Fire Game End      │
│  Event              │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Backend Receives   │
│  Completion Data    │
└─────────────────────┘
```

---

## ✅ Final Checklist

### Before Testing:

- [ ] Loot prefabs created and assigned
- [ ] Loot spawn points positioned in scene
- [ ] Victory music assigned
- [ ] Boss OnDead event connected to GameManager.OnBossDefeated()
- [ ] OnGameComplete event has backend listener
- [ ] Victory delay set to desired time (default 20s)

### During Test:

- [ ] Boss death triggers immediate loot spawn
- [ ] Victory music plays
- [ ] Console shows countdown
- [ ] Loot is collectible
- [ ] After timer, game end event fires
- [ ] Backend receives data

---

**Status:** ✅ Implemented
**Default Timer:** 20 seconds (customizable 5-60s)
**Loot Spawn:** Immediate on boss death
**Game End:** After timer completes

Victory sequence is now complete and ready to test! 🎉
