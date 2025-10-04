# Complete Audio Setup Guide

## 🎵 Audio System Overview

The game uses a layered audio approach:
- **Dungeon Ambient:** Continuous low-volume ambient sound throughout the entire game
- **Phase Music:** Changes based on game phase (exploration, combat, pre-boss, boss, victory)
- **SFX:** One-shot sounds (boss roar, etc.)

---

## 📋 Required Audio Clips

### 1. Ambient Sounds

#### Dungeon Ambient
- **Type:** Looping ambient sound
- **Duration:** Any (will loop)
- **Volume:** Low (default 20%)
- **Description:** Atmospheric dungeon sounds (wind, distant echoes, dripping water)
- **Plays:** Throughout entire game (Phase 1 → Victory)
- **Examples:** Cave ambience, dungeon atmosphere, eerie background

---

### 2. Phase Music

#### Phase 1 Music - Exploration
- **Type:** Looping music
- **Mood:** Eerie, atmospheric, mysterious
- **Tempo:** Slow to medium
- **Description:** Sets the mood for initial exploration
- **Plays:** Phase 1 only (until first combat)
- **Examples:** Dark ambient, exploration theme, mystery music

#### Combat Music - Phases 2 & 3
- **Type:** Looping music
- **Mood:** Fast-paced, intense, action-packed
- **Tempo:** Fast
- **Description:** High-energy combat music
- **Plays:** Phase 2 (first combat) AND Phase 3 (second combat)
- **Examples:** Battle theme, action music, intense combat

#### Pre-Boss Music - Phase 4
- **Type:** Looping music
- **Mood:** Tension building, anticipation, ominous
- **Tempo:** Medium, building
- **Description:** Creates tension before boss fight
- **Plays:** Phase 4 only (rest phase before boss)
- **Examples:** Boss approach, tension music, calm before storm

#### Boss Fight Music
- **Type:** Looping music
- **Mood:** Epic, dramatic, intense
- **Tempo:** Fast, powerful
- **Description:** Epic boss battle theme
- **Plays:** Boss fight phase only
- **Examples:** Boss battle, epic fight, final battle

#### Victory Music
- **Type:** Looping music
- **Mood:** Triumphant, celebratory, uplifting
- **Tempo:** Medium to fast
- **Description:** Victory celebration theme
- **Plays:** After boss defeat (during 20s countdown)
- **Examples:** Victory theme, triumph music, celebration

---

### 3. Sound Effects

#### Boss Roar SFX
- **Type:** One-shot sound effect
- **Duration:** 1-3 seconds
- **Description:** Boss roar sound during cinematic
- **Plays:** Once during boss cinematic (after 1.5s delay)
- **Examples:** Monster roar, demon scream, beast growl

---

## 🎛️ GameManager Inspector Setup

### In Unity:

1. **Select GameManager** GameObject in hierarchy
2. **Find the following sections** in Inspector:

### Ambient Sounds Section:

```
Ambient Sounds:
├─ Dungeon Ambient: [Drag your dungeon ambient AudioClip] ✅
└─ Dungeon Ambient Volume: 0.2 (20%) - Adjust as needed
```

### Phase Music Section:

```
Phase Music:
├─ Phase 1 Music: [Drag exploration music AudioClip] ✅
├─ Combat Music: [Drag combat music AudioClip] ✅ (Used for Phase 2 & 3)
├─ Pre Boss Music: [Drag pre-boss tension music AudioClip] ✅
├─ Boss Fight Music: [Drag epic boss music AudioClip] ✅
└─ Victory Music: [Drag victory celebration music AudioClip] ✅
```

### Boss Fight Setup Section:

```
Boss Fight Setup:
├─ Boss Controller: [Assign BossAIController]
├─ Boss Cinematic Camera: [Assign SimpleCinematicCamera]
├─ Boss Roar SFX: [Drag boss roar sound AudioClip] ✅
└─ Boss Roar Delay: 1.5s
```

---

## 🎬 Audio Flow Timeline

### Complete Game Audio Progression:

```
GAME START (Phase 1)
    ↓
🔊 Dungeon Ambient starts (20% volume, loops forever)
🎵 Phase 1 Music starts (exploration, eerie)
    ↓
PHASE 1 → PHASE 2 TRANSITION
    ↓
🔊 Dungeon Ambient continues
🎵 Crossfade to Combat Music (intense, fast-paced)
    ↓
PHASE 2 COMBAT
    ↓
[Player fights enemies]
    ↓
PHASE 2 → PHASE 3 TRANSITION
    ↓
🔊 Dungeon Ambient continues
🎵 Combat Music continues (same track, no change)
    ↓
PHASE 3 COMBAT
    ↓
[Player fights more enemies]
    ↓
PHASE 3 → PHASE 4 TRANSITION
    ↓
🔊 Dungeon Ambient continues
🎵 Crossfade to Pre-Boss Music (tension, anticipation)
    ↓
PHASE 4 REST
    ↓
[Player heals, prepares]
    ↓
PHASE 4 → BOSS FIGHT TRANSITION
    ↓
🔊 Dungeon Ambient continues
🎵 Crossfade to Boss Fight Music (epic, dramatic)
    ↓
BOSS CINEMATIC
    ↓
[After 1.5s] 💥 Boss Roar SFX plays
    ↓
BOSS FIGHT
    ↓
[Player fights boss]
    ↓
BOSS DEFEATED
    ↓
🔊 Dungeon Ambient continues
🎵 Crossfade to Victory Music (triumphant)
    ↓
VICTORY (20 second countdown)
    ↓
[Player collects loot]
    ↓
GAME END
```

---

## 🎯 Audio Characteristics by Phase

### Phase 1 - Exploration
- **Ambient:** Dungeon ambient (low)
- **Music:** Eerie, mysterious
- **Purpose:** Set atmospheric tone
- **Mood:** Cautious exploration

### Phase 2 - First Combat
- **Ambient:** Dungeon ambient (low)
- **Music:** Fast combat music
- **Purpose:** Energize player for combat
- **Mood:** Intense action

### Phase 3 - Second Combat
- **Ambient:** Dungeon ambient (low)
- **Music:** SAME combat music (continues)
- **Purpose:** Maintain combat intensity
- **Mood:** Sustained action

### Phase 4 - Rest/Pre-Boss
- **Ambient:** Dungeon ambient (low)
- **Music:** Tension building
- **Purpose:** Build anticipation
- **Mood:** Calm before storm

### Boss Fight
- **Ambient:** Dungeon ambient (low)
- **Music:** Epic boss theme
- **SFX:** Boss roar (during cinematic)
- **Purpose:** Create epic moment
- **Mood:** Dramatic confrontation

### Victory
- **Ambient:** Dungeon ambient (low)
- **Music:** Triumphant celebration
- **Purpose:** Reward player
- **Mood:** Celebration, achievement

---

## 🔊 Volume Recommendations

### Dungeon Ambient:
- **Default:** 20% (0.2)
- **Range:** 10-30%
- **Purpose:** Subtle background atmosphere
- **Should NOT overpower music**

### Music:
- **Controlled by AudioManager**
- **Default:** 70% (0.7)
- **Adjustable in AudioManager settings**

### SFX (Boss Roar):
- **Controlled by AudioManager**
- **Default:** 80% (0.8)
- **Should be prominent but not jarring**

---

## 🎵 Music Transition Types

### Crossfade (Smooth):
- Phase 1 → Phase 2 (exploration → combat)
- Phase 2 → Phase 3 (combat continues, but technically crossfades to same track)
- Phase 3 → Phase 4 (combat → pre-boss)
- Phase 4 → Boss Fight (pre-boss → epic boss)
- Boss Fight → Victory (boss → celebration)

### No Transition:
- Dungeon ambient (plays continuously, never stops)

---

## 📊 Audio Clip Specifications

### Recommended Format:
- **File Type:** .wav or .ogg
- **Sample Rate:** 44100 Hz
- **Bit Depth:** 16-bit
- **Channels:** Stereo (music), Mono or Stereo (ambient/SFX)

### Import Settings in Unity:

#### For Music:
```
Audio Clip Import Settings:
├─ Load Type: Streaming
├─ Compression Format: Vorbis
├─ Quality: 70-100%
└─ Preload Audio Data: ❌ (unchecked)
```

#### For Ambient:
```
Audio Clip Import Settings:
├─ Load Type: Compressed In Memory
├─ Compression Format: Vorbis
├─ Quality: 70%
└─ Preload Audio Data: ✅ (checked)
```

#### For SFX:
```
Audio Clip Import Settings:
├─ Load Type: Decompress On Load
├─ Compression Format: PCM
└─ Preload Audio Data: ✅ (checked)
```

---

## 🔍 Testing Audio Setup

### Quick Test Checklist:

1. **Phase 1:**
   - [ ] Dungeon ambient plays (low volume)
   - [ ] Exploration music plays
   - [ ] Both audible but not competing

2. **Phase 2:**
   - [ ] Dungeon ambient continues
   - [ ] Music crossfades to combat theme
   - [ ] Combat music is energetic

3. **Phase 3:**
   - [ ] Dungeon ambient continues
   - [ ] Combat music continues (same track)
   - [ ] No jarring transition

4. **Phase 4:**
   - [ ] Dungeon ambient continues
   - [ ] Music crossfades to pre-boss tension
   - [ ] Mood shifts to anticipation

5. **Boss Fight:**
   - [ ] Dungeon ambient continues
   - [ ] Music crossfades to epic boss theme
   - [ ] Boss roar SFX plays during cinematic (after 1.5s)
   - [ ] Roar is clear and impactful

6. **Victory:**
   - [ ] Dungeon ambient continues
   - [ ] Music crossfades to victory theme
   - [ ] Celebratory mood

---

## 🚨 Troubleshooting

### No Audio Playing

**Check:**
- [ ] AudioManager exists in scene
- [ ] Audio clips are assigned in GameManager
- [ ] Audio Listener exists on Main Camera
- [ ] Master volume not muted

### Ambient Too Loud

**Fix:**
- Reduce "Dungeon Ambient Volume" slider (try 0.1 or 0.15)

### Music Not Crossfading

**Check:**
- [ ] AudioManager has crossfade duration set (default 2s)
- [ ] Music clips are assigned
- [ ] Console shows "Crossfading to..." messages

### Boss Roar Not Playing

**Check:**
- [ ] Boss Roar SFX clip assigned
- [ ] Boss Roar Delay is reasonable (1-2s)
- [ ] Console shows "Boss roar SFX played"
- [ ] AudioManager SFX volume not 0

### Music Cuts Out Between Phases

**Cause:** Crossfade duration too short or clips not assigned

**Fix:**
- Increase crossfade duration in AudioManager
- Verify all music clips assigned

---

## 💡 Creative Tips

### For Dungeon Ambient:
- Layer multiple subtle sounds (wind, drips, distant echoes)
- Keep it very low volume (10-20%)
- Should be felt more than heard

### For Phase 1 Music:
- Start quiet, build slowly
- Use minor keys for eeriness
- Sparse instrumentation

### For Combat Music:
- High energy, fast tempo
- Driving percussion
- Can be reused for both combat phases

### For Pre-Boss Music:
- Slower than combat, but tense
- Building intensity
- Orchestral swells work well

### For Boss Fight Music:
- Most epic track in game
- Full orchestration
- Memorable melody

### For Victory Music:
- Major key, uplifting
- Celebratory but not too long
- Should loop well (plays for 20s)

---

## 📝 Quick Setup Summary

1. **Prepare 6 audio files:**
   - Dungeon ambient (looping)
   - Phase 1 exploration music
   - Combat music (for Phase 2 & 3)
   - Pre-boss tension music
   - Boss fight music
   - Victory music
   - Boss roar SFX

2. **Import to Unity:**
   - Drag files into `Assets/Audio/` folder
   - Configure import settings (see above)

3. **Assign in GameManager:**
   - Select GameManager GameObject
   - Drag clips to appropriate fields
   - Adjust dungeon ambient volume (default 0.2)

4. **Test:**
   - Play through game
   - Verify all transitions
   - Adjust volumes as needed

---

## ✅ Final Checklist

- [ ] Dungeon ambient assigned and volume set
- [ ] Phase 1 music assigned
- [ ] Combat music assigned (used for Phase 2 & 3)
- [ ] Pre-boss music assigned
- [ ] Boss fight music assigned
- [ ] Victory music assigned
- [ ] Boss roar SFX assigned
- [ ] All clips imported with correct settings
- [ ] AudioManager exists in scene
- [ ] Tested all phase transitions
- [ ] Volume levels balanced

---

**Status:** ✅ Complete Audio System
**Total Clips Needed:** 7 (6 music + 1 ambient + 1 SFX)
**Layering:** Ambient + Music (plays simultaneously)

Your game now has a complete, professional audio system! 🎵🎮
