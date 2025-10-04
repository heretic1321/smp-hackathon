using UnityEngine;
using Invector.vCharacterController;

/// <summary>
/// Simple component that notifies GameManager when this enemy dies
/// Add this to all enemy prefabs that should be tracked by the phase system
/// </summary>
public class EnemyDeathNotifier : MonoBehaviour
{
    [Header("Settings")]
    [Tooltip("Notify GameManager when this enemy dies")]
    [SerializeField] private bool notifyOnDeath = true;

    [Tooltip("Is this the boss enemy? (Will call OnBossDefeated instead of OnEnemyDefeated)")]
    [SerializeField] private bool isBoss = false;

    [Tooltip("Delay before notifying (useful if death animation needs to play)")]
    [SerializeField] private float notificationDelay = 0f;

    private vCharacter character;
    private bool hasNotified = false;
    private bool deathDetected = false;
    private float deathTime;

    void Start()
    {
        character = GetComponent<vCharacter>();
        if (character == null)
        {
            Debug.LogWarning($"EnemyDeathNotifier: No vCharacter component found on {gameObject.name}");
        }
    }

    void Update()
    {
        if (!notifyOnDeath || hasNotified) return;

        // Check if character is dead
        if (character != null && character.isDead)
        {
            if (!deathDetected)
            {
                deathDetected = true;
                deathTime = Time.time;
                Debug.Log($"EnemyDeathNotifier: Death detected for {gameObject.name}");
            }

            // Wait for delay
            if (Time.time >= deathTime + notificationDelay)
            {
                NotifyGameManager();
            }
        }
    }

    private void NotifyGameManager()
    {
        hasNotified = true;

        if (GameManager.Instance != null)
        {
            if (isBoss)
            {
                // This is the boss - call boss defeated method
                GameManager.Instance.OnBossDefeated();
                Debug.Log($"EnemyDeathNotifier: Notified GameManager of BOSS {gameObject.name} death");
            }
            else
            {
                // Regular enemy
                GameManager.Instance.OnEnemyDefeated(gameObject);
                Debug.Log($"EnemyDeathNotifier: Notified GameManager of {gameObject.name} death");
            }
        }
        else
        {
            Debug.LogWarning("EnemyDeathNotifier: GameManager instance not found!");
        }
    }

    /// <summary>
    /// Manually trigger notification (call from death event if needed)
    /// </summary>
    public void ManualNotify()
    {
        if (!hasNotified)
        {
            NotifyGameManager();
        }
    }

    /// <summary>
    /// Reset notification state (for testing/reuse)
    /// </summary>
    [ContextMenu("Reset Notifier")]
    public void ResetNotifier()
    {
        hasNotified = false;
        deathDetected = false;
        Debug.Log($"EnemyDeathNotifier: Reset on {gameObject.name}");
    }
}
