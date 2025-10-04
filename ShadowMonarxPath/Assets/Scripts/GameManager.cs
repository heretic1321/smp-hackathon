using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;
using Invector.vCharacterController;

/// <summary>
/// Master game orchestrator - manages all phases, state tracking, and system coordination
/// </summary>
public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    #region Serialized Fields

    [Header("Audio System")]
    [SerializeField] private AudioManager audioManager;

    [Header("Ambient Sounds")]
    [Tooltip("Dungeon ambient sound - plays throughout entire game at low volume")]
    [SerializeField] private AudioClip dungeonAmbient;
    [SerializeField] [Range(0f, 1f)] private float dungeonAmbientVolume = 0.2f;

    [Header("Phase Music")]
    [Tooltip("Phase 1 - Exploration music (eerie, atmospheric)")]
    [SerializeField] private AudioClip phase1Music;
    
    [Tooltip("Phase 2 - Combat music (fast-paced, intense) - Also used for Phase 3 combat")]
    [SerializeField] private AudioClip combatMusic;
    
    [Tooltip("Phase 4 - Pre-boss music (tension building, anticipation)")]
    [SerializeField] private AudioClip preBossMusic;
    
    [Tooltip("Boss Fight - Epic boss battle music")]
    [SerializeField] private AudioClip bossFightMusic;
    
    [Tooltip("Victory - Triumphant victory music")]
    [SerializeField] private AudioClip victoryMusic;

    [Header("Phase 2 Setup")]
    [SerializeField] private NPCSpawner phase2Spawner;
    [SerializeField] private int phase2EnemyCount = 3;
    [SerializeField] private GameObject phase2Barrier;

    [Header("Phase 3 Setup (Second Combat)")]
    [SerializeField] private NPCSpawner phase3Spawner;
    [SerializeField] private int phase3EnemyCount = 5;
    [SerializeField] private GameObject phase3Barrier;

    [Header("Phase 4 Setup (Rest Phase)")]
    [SerializeField] private GameObject healingItemPrefab;
    [SerializeField] private Transform healingItemSpawnPoint;

    [Header("Boss Fight Setup")]
    [SerializeField] private BossAIController bossController;
    [SerializeField] private SimpleCinematicCamera bossCinematicCamera;
    [SerializeField] private AudioClip bossRoarSFX;
    [SerializeField] [Range(0f, 5f)] [Tooltip("Delay in seconds before boss roars during cinematic")]
    private float bossRoarDelay = 1.5f;

    [Header("Victory/Loot Setup")]
    [SerializeField] private GameObject[] lootPrefabs;
    [SerializeField] private Transform[] lootSpawnPoints;
    [SerializeField] [Range(5f, 60f)] [Tooltip("Time in seconds to wait after boss defeat before sending game end event")]
    private float victoryDelayBeforeGameEnd = 20f;

    [Header("Player Reference")]
    [SerializeField] private GameObject player;
    [SerializeField] private Transform[] phaseCheckpoints; // Spawn points for each phase

    [Header("UI References")]
    [Tooltip("Reference to the fadeText UI element (Canvas/HUD/fadeText)")]
    [SerializeField] private UnityEngine.UI.Text fadeText;
    [SerializeField] private float fadeTextDisplayDuration = 3f;

    [Header("Debug/Testing")]
    [SerializeField] private GamePhase startingPhase = GamePhase.Phase1;
    [SerializeField] private bool enableDebugMode = false;
    [SerializeField] private bool showDebugGUI = true;

    [Header("Events")]
    public UnityEvent<GameEndData> OnGameComplete;
    public UnityEvent<DeathData> OnPlayerDied;
    public UnityEvent<GamePhase> OnPhaseChanged;

    #endregion

    #region Private State

    private GamePhase currentPhase = GamePhase.Phase1;
    private float gameStartTime;
    private float phaseStartTime;

    // Enemy tracking
    private int enemiesDefeatedPhase2 = 0;
    private int enemiesDefeatedPhase3 = 0;
    private int totalEnemiesDefeated = 0;

    // Phase completion tracking
    private bool phase1Completed = false;
    private bool phase2Completed = false;
    private bool phase3Completed = false;
    private bool phase4Completed = false;
    private bool bossFightCompleted = false;

    // Boss tracking
    private bool isBossDefeated = false;

    // Loot tracking
    private List<GameObject> spawnedLoot = new List<GameObject>();
    private List<GameObject> collectedLoot = new List<GameObject>();

    // Player tracking
    private int playerDeathCount = 0;
    private vThirdPersonController playerController;

    // Spawned items
    private GameObject spawnedHealingItem;

    #endregion

    #region Initialization

    private void Awake()
    {
        // Singleton pattern
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;

        // Auto-find audio manager if not assigned
        if (audioManager == null)
        {
            audioManager = FindObjectOfType<AudioManager>();
            if (audioManager == null)
            {
                Debug.LogWarning("GameManager: AudioManager not found, creating one");
                GameObject audioObj = new GameObject("AudioManager");
                audioManager = audioObj.AddComponent<AudioManager>();
            }
        }

        // Auto-find player if not assigned
        if (player == null)
        {
            player = GameObject.FindGameObjectWithTag("Player");
        }

        if (player != null)
        {
            playerController = player.GetComponent<vThirdPersonController>();
        }
    }

    private void Start()
    {
        gameStartTime = Time.time;
        
        // Initialize to starting phase
        InitializePhase(startingPhase);

        Debug.Log($"GameManager: Initialized at phase {startingPhase}");
    }

    /// <summary>
    /// Initialize game to a specific phase (used for testing and game start)
    /// </summary>
    private void InitializePhase(GamePhase phase)
    {
        currentPhase = phase;
        phaseStartTime = Time.time;

        // Mark previous phases as completed if starting mid-game
        if (phase > GamePhase.Phase1) phase1Completed = true;
        if (phase > GamePhase.Phase2) phase2Completed = true;
        if (phase > GamePhase.Phase3) phase3Completed = true;
        if (phase > GamePhase.Phase4) phase4Completed = true;

        // Teleport player to checkpoint if available
        if (phaseCheckpoints != null && (int)phase < phaseCheckpoints.Length)
        {
            Transform checkpoint = phaseCheckpoints[(int)phase];
            if (checkpoint != null && player != null)
            {
                player.transform.position = checkpoint.position;
                player.transform.rotation = checkpoint.rotation;
                Debug.Log($"GameManager: Teleported player to checkpoint {(int)phase}");
            }
        }

        // Setup phase
        SetupPhaseState(phase);

        // Fire event
        OnPhaseChanged?.Invoke(phase);
    }

    #endregion

    #region Phase Management

    /// <summary>
    /// Transition to a new phase
    /// </summary>
    public void TransitionToPhase(GamePhase newPhase)
    {
        if (currentPhase == newPhase)
        {
            Debug.LogWarning($"GameManager: Already in phase {newPhase}");
            return;
        }

        Debug.Log($"GameManager: Transitioning from {currentPhase} to {newPhase}");

        // Mark current phase as completed
        MarkPhaseCompleted(currentPhase);

        // Update phase
        currentPhase = newPhase;
        phaseStartTime = Time.time;

        // Setup new phase
        SetupPhaseState(newPhase);

        // Fire event
        OnPhaseChanged?.Invoke(newPhase);
    }

    /// <summary>
    /// Setup all state for a specific phase
    /// </summary>
    private void SetupPhaseState(GamePhase phase)
    {
        Debug.Log($"GameManager: Setting up phase {phase}");

        switch (phase)
        {
            case GamePhase.Phase1:
                SetupPhase1();
                break;
            case GamePhase.Phase2:
                SetupPhase2();
                break;
            case GamePhase.Phase3:
                SetupPhase3();
                break;
            case GamePhase.Phase4:
                SetupPhase4();
                break;
            case GamePhase.BossFight:
                SetupBossFight();
                break;
            case GamePhase.Victory:
                SetupVictory();
                break;
        }
    }

    private void SetupPhase1()
    {
        Debug.Log("GameManager: Phase 1 - Initial Exploration");

        // Start dungeon ambient (plays throughout entire game)
        if (dungeonAmbient != null && audioManager != null)
        {
            audioManager.PlayAmbient(dungeonAmbient, dungeonAmbientVolume);
            Debug.Log($"GameManager: Started dungeon ambient at {dungeonAmbientVolume * 100}% volume");
        }

        // Play exploration music
        if (phase1Music != null && audioManager != null)
        {
            audioManager.PlayMusic(phase1Music, true);
            Debug.Log("GameManager: Playing Phase 1 exploration music");
        }

        // Ensure barriers are disabled
        if (phase2Barrier != null) phase2Barrier.SetActive(false);
        if (phase3Barrier != null) phase3Barrier.SetActive(false);
    }

    private void SetupPhase2()
    {
        Debug.Log("GameManager: Phase 2 - First Combat");

        // Change music to combat (dungeon ambient continues in background)
        if (combatMusic != null && audioManager != null)
        {
            audioManager.CrossfadeMusic(combatMusic);
            Debug.Log("GameManager: Crossfading to combat music");
        }

        // Enable barrier (blocks player until enemies defeated)
        if (phase2Barrier != null)
        {
            phase2Barrier.SetActive(true);
            Debug.Log("GameManager: Phase 2 barrier ENABLED - will open when all enemies defeated");
        }

        // Spawn enemies
        if (phase2Spawner != null)
        {
            phase2Spawner.SpawnNPCs(phase2EnemyCount);
            Debug.Log($"GameManager: Spawned {phase2EnemyCount} enemies for Phase 2");
        }
    }

    private void SetupPhase3()
    {
        Debug.Log("GameManager: Phase 3 - Second Combat");

        // Keep combat music (reuse from Phase 2)
        if (combatMusic != null && audioManager != null)
        {
            // If already playing combat music, no need to crossfade
            // Otherwise, crossfade to it
            audioManager.CrossfadeMusic(combatMusic);
            Debug.Log("GameManager: Combat music continues for Phase 3");
        }

        // Phase 2 barrier should already be disabled by enemy defeat check
        // But ensure it's off just in case
        if (phase2Barrier != null && phase2Barrier.activeSelf)
        {
            phase2Barrier.SetActive(false);
            Debug.Log("GameManager: Phase 2 barrier disabled (backup check)");
        }

        // Enable Phase 3 barrier (blocks player until enemies defeated)
        if (phase3Barrier != null)
        {
            phase3Barrier.SetActive(true);
            Debug.Log("GameManager: Phase 3 barrier ENABLED - will open when all enemies defeated");
        }

        // Spawn enemies
        if (phase3Spawner != null)
        {
            phase3Spawner.SpawnNPCs(phase3EnemyCount);
            Debug.Log($"GameManager: Spawned {phase3EnemyCount} enemies for Phase 3");
        }
    }

    private void SetupPhase4()
    {
        Debug.Log("GameManager: Phase 4 - Rest Phase (Pre-Boss)");

        // Change to pre-boss tension music
        if (preBossMusic != null && audioManager != null)
        {
            audioManager.CrossfadeMusic(preBossMusic);
            Debug.Log("GameManager: Crossfading to pre-boss tension music");
        }

        // Phase 3 barrier should already be disabled by enemy defeat check
        // But ensure it's off just in case
        if (phase3Barrier != null && phase3Barrier.activeSelf)
        {
            phase3Barrier.SetActive(false);
            Debug.Log("GameManager: Phase 3 barrier disabled (backup check)");
        }

        // Spawn healing item
        if (healingItemPrefab != null && healingItemSpawnPoint != null)
        {
            spawnedHealingItem = Instantiate(healingItemPrefab, healingItemSpawnPoint.position, healingItemSpawnPoint.rotation);
            Debug.Log("GameManager: Spawned healing item - prepare for boss fight!");
        }
    }

    private void SetupBossFight()
    {
        Debug.Log("GameManager: Phase 5 - Boss Fight");

        // Change to epic boss music (will play after cinematic)
        if (bossFightMusic != null && audioManager != null)
        {
            audioManager.CrossfadeMusic(bossFightMusic);
            Debug.Log("GameManager: Crossfading to epic boss fight music");
        }

        // Play boss cinematic
        StartCoroutine(PlayBossCinematic());
    }

    private IEnumerator PlayBossCinematic()
    {
        Debug.Log("GameManager: Starting boss cinematic");

        // Prepare boss for cinematic
        if (bossController != null)
        {
            bossController.StartCinematic();
        }

        // Play cinematic camera sequence
        if (bossCinematicCamera != null)
        {
            bossCinematicCamera.PlayCinematic();
        }

        // Wait for roar delay, then trigger roar
        Debug.Log($"GameManager: Waiting {bossRoarDelay}s before boss roar...");
        yield return new WaitForSeconds(bossRoarDelay);

        // Play roar SFX
        if (bossRoarSFX != null && audioManager != null)
        {
            audioManager.PlaySFX(bossRoarSFX);
            Debug.Log("GameManager: Boss roar SFX played");
        }

        // Trigger boss roar animation
        if (bossController != null)
        {
            bossController.TriggerRoarAnimation();
            Debug.Log("GameManager: Boss roar animation triggered");
        }

        // Wait for cinematic camera to finish
        if (bossCinematicCamera != null)
        {
            while (bossCinematicCamera.IsPlayingCinematic)
            {
                yield return null;
            }
        }
        else
        {
            // If no camera, wait a bit for roar animation to play
            yield return new WaitForSeconds(2f);
        }

        // End cinematic and activate boss
        if (bossController != null)
        {
            bossController.EndCinematic();
            bossController.ActivateBoss();
        }

        Debug.Log("GameManager: Boss cinematic complete, boss activated");
    }

    private void SetupVictory()
    {
        Debug.Log("GameManager: Phase 6 - Victory! (This phase is now handled by OnBossDefeated)");
        // Victory logic now happens in OnBossDefeated() for immediate loot spawning
    }

    /// <summary>
    /// Coroutine that counts down after boss defeat before sending game end event
    /// </summary>
    private IEnumerator VictoryCountdownCoroutine()
    {
        float timeRemaining = victoryDelayBeforeGameEnd;
        
        Debug.Log($"GameManager: Victory countdown started - {timeRemaining} seconds until game end");

        // Count down every 5 seconds
        while (timeRemaining > 0)
        {
            if (timeRemaining % 5 == 0 || timeRemaining <= 5)
            {
                Debug.Log($"GameManager: Game will end in {timeRemaining} seconds...");
            }

            yield return new WaitForSeconds(1f);
            timeRemaining--;
        }

        Debug.Log("GameManager: Victory countdown complete! Sending game end event...");

        // Transition to victory phase (for state tracking)
        TransitionToPhase(GamePhase.Victory);

        // Send game completion event
        SendGameCompleteEvent();
    }

    private void MarkPhaseCompleted(GamePhase phase)
    {
        switch (phase)
        {
            case GamePhase.Phase1: phase1Completed = true; break;
            case GamePhase.Phase2: phase2Completed = true; break;
            case GamePhase.Phase3: phase3Completed = true; break;
            case GamePhase.Phase4: phase4Completed = true; break;
            case GamePhase.BossFight: bossFightCompleted = true; break;
        }
    }

    #endregion

    #region Enemy Tracking

    /// <summary>
    /// Called when an enemy is defeated (call this from enemy health/death events)
    /// </summary>
    public void OnEnemyDefeated(GameObject enemy)
    {
        totalEnemiesDefeated++;
        Debug.Log($"GameManager: Enemy defeated. Total: {totalEnemiesDefeated}");

        // Track by phase
        switch (currentPhase)
        {
            case GamePhase.Phase2:
                enemiesDefeatedPhase2++;
                Debug.Log($"GameManager: Phase 2 enemies defeated: {enemiesDefeatedPhase2}/{phase2EnemyCount}");
                
                // Check if all enemies defeated
                if (enemiesDefeatedPhase2 >= phase2EnemyCount)
                {
                    Debug.Log("GameManager: Phase 2 COMPLETE - All enemies defeated!");
                    
                    // Open barrier
                    if (phase2Barrier != null && phase2Barrier.activeSelf)
                    {
                        phase2Barrier.SetActive(false);
                        Debug.Log("GameManager: Phase 2 barrier OPENED - player can proceed!");
                    }
                }
                break;

            case GamePhase.Phase3:
                enemiesDefeatedPhase3++;
                Debug.Log($"GameManager: Phase 3 enemies defeated: {enemiesDefeatedPhase3}/{phase3EnemyCount}");
                
                // Check if all enemies defeated
                if (enemiesDefeatedPhase3 >= phase3EnemyCount)
                {
                    Debug.Log("GameManager: Phase 3 COMPLETE - All enemies defeated!");
                    
                    // Open barrier
                    if (phase3Barrier != null && phase3Barrier.activeSelf)
                    {
                        phase3Barrier.SetActive(false);
                        Debug.Log("GameManager: Phase 3 barrier OPENED - player can proceed!");
                    }
                }
                break;
        }
    }

    /// <summary>
    /// Check if all enemies in current phase are defeated
    /// </summary>
    public bool AreAllEnemiesDefeatedInCurrentPhase()
    {
        switch (currentPhase)
        {
            case GamePhase.Phase2:
                return enemiesDefeatedPhase2 >= phase2EnemyCount;
            case GamePhase.Phase3:
                return enemiesDefeatedPhase3 >= phase3EnemyCount;
            default:
                return true;
        }
    }

    #endregion

    #region Boss Tracking

    /// <summary>
    /// Called when boss is defeated (call this from boss health/death events)
    /// </summary>
    public void OnBossDefeated()
    {
        if (isBossDefeated) return;

        isBossDefeated = true;
        totalEnemiesDefeated++; // Count boss as enemy
        Debug.Log("GameManager: Boss defeated! Starting victory sequence...");

        // Show "Boss Defeated" message
        ShowFadeText("Boss Defeated!");

        // Immediately spawn loot
        SpawnLoot();
        Debug.Log($"GameManager: Loot spawned. Player has {victoryDelayBeforeGameEnd} seconds to collect.");

        // Play victory music
        if (victoryMusic != null && audioManager != null)
        {
            audioManager.CrossfadeMusic(victoryMusic);
        }

        // Start timer before sending game end event
        StartCoroutine(VictoryCountdownCoroutine());
    }

    /// <summary>
    /// Check if boss is defeated
    /// </summary>
    public bool IsBossDefeated()
    {
        return isBossDefeated;
    }

    #endregion

    #region Loot System

    /// <summary>
    /// Spawn loot at designated locations
    /// </summary>
    private void SpawnLoot()
    {
        if (lootPrefabs == null || lootPrefabs.Length == 0 || lootSpawnPoints == null || lootSpawnPoints.Length == 0)
        {
            Debug.LogWarning("GameManager: No loot prefabs or spawn points assigned");
            return;
        }

        spawnedLoot.Clear();

        int spawnCount = Mathf.Min(lootPrefabs.Length, lootSpawnPoints.Length);
        for (int i = 0; i < spawnCount; i++)
        {
            if (lootPrefabs[i] != null && lootSpawnPoints[i] != null)
            {
                GameObject loot = Instantiate(lootPrefabs[i], lootSpawnPoints[i].position, lootSpawnPoints[i].rotation);
                spawnedLoot.Add(loot);
                Debug.Log($"GameManager: Spawned loot '{lootPrefabs[i].name}' at {lootSpawnPoints[i].name}");
            }
        }
    }

    /// <summary>
    /// Called when player collects a loot item (call this from loot pickup script)
    /// </summary>
    public void OnLootCollected(GameObject loot, string itemName = "Item")
    {
        if (!collectedLoot.Contains(loot))
        {
            collectedLoot.Add(loot);
            Debug.Log($"GameManager: Loot collected '{itemName}'. Total: {collectedLoot.Count}/{spawnedLoot.Count}");
            
            // Show loot collected message
            ShowFadeText($"{itemName} added to inventory");
        }
    }

    /// <summary>
    /// Get count of collected loot items
    /// </summary>
    public int GetCollectedLootCount()
    {
        return collectedLoot.Count;
    }

    #endregion

    #region Player Death Handling

    /// <summary>
    /// Called when player dies (call this from player health component)
    /// </summary>
    public void OnPlayerDeath()
    {
        playerDeathCount++;
        Debug.Log($"GameManager: Player died! Death count: {playerDeathCount}");

        // Create death data
        DeathData deathData = CreateDeathData();

        // Fire event
        OnPlayerDied?.Invoke(deathData);

        // Print summary
        if (enableDebugMode)
            deathData.PrintSummary();

        // Respawn player at last checkpoint
        StartCoroutine(RespawnPlayerDelayed(3f));
    }

    private DeathData CreateDeathData()
    {
        DeathData data = new DeathData
        {
            playerDied = true,
            survivalTime = Time.time - gameStartTime,
            deathPhase = currentPhase.ToString(),
            checkpointsReached = GetCheckpointsReached(),
            phase1Completed = phase1Completed,
            phase2Completed = phase2Completed,
            phase3Completed = phase3Completed,
            phase4Completed = phase4Completed,
            reachedBossFight = currentPhase >= GamePhase.BossFight,
            totalEnemiesDefeated = totalEnemiesDefeated,
            enemiesDefeatedPhase2 = enemiesDefeatedPhase2,
            enemiesDefeatedPhase4 = enemiesDefeatedPhase3,
            deathCount = playerDeathCount,
            deathPosition = player != null ? player.transform.position : Vector3.zero,
            lastHealthPercentage = GetPlayerHealthPercentage()
        };

        return data;
    }

    private IEnumerator RespawnPlayerDelayed(float delay)
    {
        yield return new WaitForSeconds(delay);

        // Respawn at current phase checkpoint
        if (player != null && phaseCheckpoints != null && (int)currentPhase < phaseCheckpoints.Length)
        {
            Transform checkpoint = phaseCheckpoints[(int)currentPhase];
            if (checkpoint != null)
            {
                player.transform.position = checkpoint.position;
                player.transform.rotation = checkpoint.rotation;
                Debug.Log($"GameManager: Player respawned at checkpoint {(int)currentPhase}");

                // Reset player health (if using Invector health system)
                // This would need to be implemented based on your health system
            }
        }
    }

    #endregion

    #region Backend Integration

    /// <summary>
    /// Send game completion event immediately
    /// </summary>
    private void SendGameCompleteEvent()
    {
        // Create game end data
        GameEndData gameData = CreateGameEndData();

        // Fire event
        OnGameComplete?.Invoke(gameData);

        // Print summary
        if (enableDebugMode)
            gameData.PrintSummary();

        Debug.Log("GameManager: Game completion event sent");
    }

    /// <summary>
    /// Send game completion event after a delay (legacy method)
    /// </summary>
    private IEnumerator SendGameCompleteEventDelayed(float delay)
    {
        yield return new WaitForSeconds(delay);
        SendGameCompleteEvent();
    }

    private GameEndData CreateGameEndData()
    {
        GameEndData data = new GameEndData
        {
            gameCompleted = true,
            completionTime = Time.time - gameStartTime,
            totalEnemiesDefeated = totalEnemiesDefeated,
            enemiesDefeatedPhase2 = enemiesDefeatedPhase2,
            enemiesDefeatedPhase4 = enemiesDefeatedPhase3,
            bossDefeated = isBossDefeated,
            phase1Completed = phase1Completed,
            phase2Completed = phase2Completed,
            phase3Completed = phase3Completed,
            phase4Completed = phase4Completed,
            bossFightCompleted = bossFightCompleted,
            lootItemsCollected = collectedLoot.Count,
            finalHealthPercentage = GetPlayerHealthPercentage(),
            deathCount = playerDeathCount
        };

        // Add collected loot names
        foreach (var loot in collectedLoot)
        {
            if (loot != null)
                data.collectedLootNames.Add(loot.name);
        }

        return data;
    }

    #endregion

    #region Helper Methods

    private int GetCheckpointsReached()
    {
        int count = 0;
        if (phase1Completed) count++;
        if (phase2Completed) count++;
        if (phase3Completed) count++;
        if (phase4Completed) count++;
        if (bossFightCompleted) count++;
        return count;
    }

    private float GetPlayerHealthPercentage()
    {
        if (player != null)
        {
            // Access Invector health system through vCharacter base class
            var character = player.GetComponent<Invector.vCharacterController.vCharacter>();
            if (character != null)
            {
                return (float)character.currentHealth / character.maxHealth;
            }
        }
        return 0f;
    }

    public GamePhase GetCurrentPhase()
    {
        return currentPhase;
    }

    public int GetTotalEnemiesDefeated()
    {
        return totalEnemiesDefeated;
    }

    #endregion

    #region Debug Methods

    [ContextMenu("Debug: Transition to Phase 1")]
    private void DebugPhase1() => TransitionToPhase(GamePhase.Phase1);

    [ContextMenu("Debug: Transition to Phase 2")]
    private void DebugPhase2() => TransitionToPhase(GamePhase.Phase2);

    [ContextMenu("Debug: Transition to Phase 3")]
    private void DebugPhase3() => TransitionToPhase(GamePhase.Phase3);

    [ContextMenu("Debug: Transition to Phase 4")]
    private void DebugPhase4() => TransitionToPhase(GamePhase.Phase4);

    [ContextMenu("Debug: Transition to Boss Fight")]
    private void DebugBossFight() => TransitionToPhase(GamePhase.BossFight);

    [ContextMenu("Debug: Transition to Victory")]
    private void DebugVictory() => TransitionToPhase(GamePhase.Victory);

    [ContextMenu("Debug: Print Game State")]
    private void DebugPrintState()
    {
        Debug.Log("=== GameManager State ===");
        Debug.Log($"Current Phase: {currentPhase}");
        Debug.Log($"Total Enemies Defeated: {totalEnemiesDefeated}");
        Debug.Log($"Phase 2 Enemies: {enemiesDefeatedPhase2}/{phase2EnemyCount}");
        Debug.Log($"Phase 3 Enemies: {enemiesDefeatedPhase3}/{phase3EnemyCount}");
        Debug.Log($"Boss Defeated: {isBossDefeated}");
        Debug.Log($"Loot Collected: {collectedLoot.Count}/{spawnedLoot.Count}");
        Debug.Log($"Player Deaths: {playerDeathCount}");
        Debug.Log($"Game Time: {Time.time - gameStartTime:F2}s");
        Debug.Log("========================");
    }

    [ContextMenu("Debug: Kill All Phase 2 Enemies")]
    private void DebugKillPhase2Enemies()
    {
        enemiesDefeatedPhase2 = phase2EnemyCount;
        Debug.Log("Debug: All Phase 2 enemies marked as defeated");
    }

    [ContextMenu("Debug: Kill All Phase 3 Enemies")]
    private void DebugKillPhase3Enemies()
    {
        enemiesDefeatedPhase3 = phase3EnemyCount;
        Debug.Log("Debug: All Phase 3 enemies marked as defeated");
    }

    #endregion

    #region Debug GUI

    private void OnGUI()
    {
        if (!enableDebugMode || !showDebugGUI) return;

        GUILayout.BeginArea(new Rect(10, 10, 300, 400));
        GUILayout.Box("=== Game Manager Debug ===");
        
        GUILayout.Label($"Phase: {currentPhase}");
        GUILayout.Label($"Enemies: {totalEnemiesDefeated}");
        GUILayout.Label($"Phase 2: {enemiesDefeatedPhase2}/{phase2EnemyCount}");
        GUILayout.Label($"Phase 3: {enemiesDefeatedPhase3}/{phase3EnemyCount}");
        GUILayout.Label($"Boss: {(isBossDefeated ? "Defeated" : "Alive")}");
        GUILayout.Label($"Loot: {collectedLoot.Count}");
        GUILayout.Label($"Deaths: {playerDeathCount}");
        GUILayout.Label($"Time: {(Time.time - gameStartTime):F1}s");

        GUILayout.Space(10);

        if (GUILayout.Button("Phase 1")) TransitionToPhase(GamePhase.Phase1);
        if (GUILayout.Button("Phase 2")) TransitionToPhase(GamePhase.Phase2);
        if (GUILayout.Button("Phase 3")) TransitionToPhase(GamePhase.Phase3);
        if (GUILayout.Button("Phase 4")) TransitionToPhase(GamePhase.Phase4);
        if (GUILayout.Button("Boss Fight")) TransitionToPhase(GamePhase.BossFight);
        if (GUILayout.Button("Victory")) TransitionToPhase(GamePhase.Victory);

        GUILayout.EndArea();
    }

    #endregion

    #region UI Methods

    /// <summary>
    /// Show a message on the fadeText UI element with fade effect
    /// </summary>
    public void ShowFadeText(string message)
    {
        if (fadeText != null)
        {
            StopAllCoroutines(); // Stop any existing fade coroutines
            StartCoroutine(FadeTextCoroutine(message));
        }
        else
        {
            Debug.LogWarning("GameManager: fadeText UI element not assigned!");
        }
    }

    /// <summary>
    /// Coroutine to display and fade text
    /// </summary>
    private IEnumerator FadeTextCoroutine(string message)
    {
        // Set text and make fully visible
        fadeText.text = message;
        Color color = fadeText.color;
        color.a = 1f;
        fadeText.color = color;

        // Wait for display duration
        yield return new WaitForSeconds(fadeTextDisplayDuration);

        // Fade out over 1 second
        float fadeOutDuration = 1f;
        float elapsed = 0f;

        while (elapsed < fadeOutDuration)
        {
            elapsed += Time.deltaTime;
            color.a = Mathf.Lerp(1f, 0f, elapsed / fadeOutDuration);
            fadeText.color = color;
            yield return null;
        }

        // Ensure fully transparent
        color.a = 0f;
        fadeText.color = color;
        fadeText.text = "";
    }

    #endregion
}

/// <summary>
/// Game phase enumeration
/// </summary>
public enum GamePhase
{
    Phase1 = 0,      // Initial exploration
    Phase2 = 1,      // First combat
    Phase3 = 2,      // Rest phase
    Phase4 = 3,      // Final combat
    BossFight = 4,   // Boss encounter
    Victory = 5      // Game complete
}

