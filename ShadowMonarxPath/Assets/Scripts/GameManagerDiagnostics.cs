using UnityEngine;
using UnityEngine.SceneManagement;

/// <summary>
/// Diagnostic tool to verify GameManager setup and troubleshoot issues
/// Add to a GameObject in your scene and check the console for detailed reports
/// </summary>
public class GameManagerDiagnostics : MonoBehaviour
{
    [Header("Run Diagnostics")]
    [SerializeField] private bool runOnStart = true;
    [SerializeField] private KeyCode diagnosticKey = KeyCode.F1;

    void Start()
    {
        if (runOnStart)
        {
            Invoke(nameof(RunFullDiagnostics), 1f); // Delay to let scene initialize
        }
    }

    void Update()
    {
        if (Input.GetKeyDown(diagnosticKey))
        {
            RunFullDiagnostics();
        }
    }

    [ContextMenu("Run Full Diagnostics")]
    public void RunFullDiagnostics()
    {
        Debug.Log("========================================");
        Debug.Log("GAME MANAGER DIAGNOSTICS");
        Debug.Log("========================================");

        CheckGameManager();
        CheckAudioManager();
        CheckPlayer();
        CheckPhaseCheckpoints();
        CheckPhaseTriggers();
        CheckBarriers();
        CheckSpawners();
        CheckBossCinematic();
        CheckEnemies();

        Debug.Log("========================================");
        Debug.Log("DIAGNOSTICS COMPLETE");
        Debug.Log("========================================");
    }

    void CheckGameManager()
    {
        Debug.Log("\n--- GAME MANAGER ---");
        
        if (GameManager.Instance == null)
        {
            Debug.LogError("❌ GameManager.Instance is NULL! GameManager not found in scene.");
            return;
        }

        Debug.Log("✓ GameManager found");

        var gm = GameManager.Instance;
        Debug.Log($"Current Phase: {gm.GetCurrentPhase()}");
        Debug.Log($"Total Enemies Defeated: {gm.GetTotalEnemiesDefeated()}");
    }

    void CheckAudioManager()
    {
        Debug.Log("\n--- AUDIO MANAGER ---");

        if (AudioManager.Instance == null)
        {
            Debug.LogError("❌ AudioManager.Instance is NULL! AudioManager not found in scene.");
            return;
        }

        Debug.Log("✓ AudioManager found");
    }

    void CheckPlayer()
    {
        Debug.Log("\n--- PLAYER ---");

        GameObject player = GameObject.FindGameObjectWithTag("Player");
        if (player == null)
        {
            Debug.LogError("❌ Player not found! Make sure player GameObject has 'Player' tag.");
            return;
        }

        Debug.Log($"✓ Player found: {player.name}");
        Debug.Log($"  Position: {player.transform.position}");
        Debug.Log($"  Tag: {player.tag}");
        Debug.Log($"  Layer: {LayerMask.LayerToName(player.layer)}");

        var playerInput = player.GetComponent<Invector.vCharacterController.vThirdPersonInput>();
        if (playerInput == null)
        {
            Debug.LogWarning("⚠ vThirdPersonInput not found on player");
        }
        else
        {
            Debug.Log($"  Input enabled: {playerInput.enabled}");
        }
    }

    void CheckPhaseCheckpoints()
    {
        Debug.Log("\n--- PHASE CHECKPOINTS ---");

        // Can't access private fields directly, so just check if they exist in scene
        var checkpoints = GameObject.Find("_PhaseSystem");
        if (checkpoints == null)
        {
            Debug.LogWarning("⚠ _PhaseSystem parent object not found");
        }
        else
        {
            Debug.Log($"✓ _PhaseSystem found with {checkpoints.transform.childCount} children");
        }
    }

    void CheckPhaseTriggers()
    {
        Debug.Log("\n--- PHASE TRIGGERS ---");

        var triggers = FindObjectsOfType<PhaseTransitionTrigger>();
        Debug.Log($"Found {triggers.Length} PhaseTransitionTrigger(s)");

        foreach (var trigger in triggers)
        {
            var col = trigger.GetComponent<Collider>();
            if (col == null)
            {
                Debug.LogError($"❌ {trigger.gameObject.name}: Missing Collider!");
            }
            else if (!col.isTrigger)
            {
                Debug.LogError($"❌ {trigger.gameObject.name}: Collider is not a trigger!");
            }
            else
            {
                Debug.Log($"✓ {trigger.gameObject.name}: Properly configured");
            }
        }

        if (triggers.Length == 0)
        {
            Debug.LogWarning("⚠ No PhaseTransitionTriggers found in scene!");
        }
    }

    void CheckBarriers()
    {
        Debug.Log("\n--- BARRIERS ---");

        var barriersParent = GameObject.Find("_PhaseBarriers");
        if (barriersParent == null)
        {
            Debug.LogWarning("⚠ _PhaseBarriers parent object not found");
            return;
        }

        for (int i = 0; i < barriersParent.transform.childCount; i++)
        {
            var barrier = barriersParent.transform.GetChild(i);
            var col = barrier.GetComponent<Collider>();
            
            if (col == null)
            {
                Debug.LogError($"❌ {barrier.name}: Missing Collider!");
            }
            else if (col.isTrigger)
            {
                Debug.LogError($"❌ {barrier.name}: Collider should NOT be a trigger!");
            }
            else
            {
                Debug.Log($"✓ {barrier.name}: Active={barrier.gameObject.activeSelf}");
            }
        }
    }

    void CheckSpawners()
    {
        Debug.Log("\n--- NPC SPAWNERS ---");

        var spawners = FindObjectsOfType<NPCSpawner>();
        Debug.Log($"Found {spawners.Length} NPCSpawner(s)");

        foreach (var spawner in spawners)
        {
            Debug.Log($"  {spawner.gameObject.name}:");
            Debug.Log($"    Spawned NPCs: {spawner.GetSpawnedNPCCount()}");
        }

        if (spawners.Length == 0)
        {
            Debug.LogWarning("⚠ No NPCSpawners found in scene!");
        }
    }

    void CheckBossCinematic()
    {
        Debug.Log("\n--- BOSS CINEMATIC ---");

        var cinematicCamera = FindObjectOfType<SimpleCinematicCamera>();
        if (cinematicCamera == null)
        {
            Debug.LogWarning("⚠ SimpleCinematicCamera not found");
        }
        else
        {
            Debug.Log($"✓ SimpleCinematicCamera found: {cinematicCamera.gameObject.name}");
        }

        var cinematicPoses = FindObjectsOfType<SimpleCinematicPose>();
        Debug.Log($"Found {cinematicPoses.Length} SimpleCinematicPose(s)");

        if (cinematicPoses.Length < 3)
        {
            Debug.LogWarning("⚠ Less than 3 cinematic poses found (recommended: 3+)");
        }

        var bossController = FindObjectOfType<BossAIController>();
        if (bossController == null)
        {
            Debug.LogWarning("⚠ BossAIController not found");
        }
        else
        {
            Debug.Log($"✓ BossAIController found: {bossController.gameObject.name}");
        }
    }

    void CheckEnemies()
    {
        Debug.Log("\n--- ENEMIES ---");

        var notifiers = FindObjectsOfType<EnemyDeathNotifier>();
        Debug.Log($"Found {notifiers.Length} EnemyDeathNotifier(s) in scene");

        if (notifiers.Length == 0)
        {
            Debug.LogWarning("⚠ No EnemyDeathNotifiers found! Enemies won't notify GameManager on death.");
            Debug.LogWarning("  Add EnemyDeathNotifier component to enemy prefabs.");
        }
    }

    [ContextMenu("List All GameObjects with Colliders")]
    public void ListCollidersInScene()
    {
        Debug.Log("\n--- ALL COLLIDERS IN SCENE ---");
        
        var allColliders = FindObjectsOfType<Collider>();
        Debug.Log($"Total colliders: {allColliders.Length}");

        foreach (var col in allColliders)
        {
            string type = col.isTrigger ? "TRIGGER" : "SOLID";
            Debug.Log($"  [{type}] {col.gameObject.name} ({col.GetType().Name})");
        }
    }

    [ContextMenu("Test Phase Transition")]
    public void TestPhaseTransition()
    {
        if (GameManager.Instance == null)
        {
            Debug.LogError("GameManager not found!");
            return;
        }

        var currentPhase = GameManager.Instance.GetCurrentPhase();
        var nextPhase = (GamePhase)(((int)currentPhase + 1) % 6);
        
        Debug.Log($"Testing transition: {currentPhase} → {nextPhase}");
        GameManager.Instance.TransitionToPhase(nextPhase);
    }
}
