using UnityEngine;
using UnityEngine.Events;

/// <summary>
/// Simple loot pickup component that notifies GameManager when collected
/// Add this to loot item prefabs
/// </summary>
[RequireComponent(typeof(Collider))]
public class LootPickup : MonoBehaviour
{
    [Header("Item Info")]
    [Tooltip("Display name of the item (shown in UI message)")]
    [SerializeField] private string itemName = "Double Swords";

    [Header("Pickup Settings")]
    [Tooltip("Automatically pickup when player touches")]
    [SerializeField] private bool autoPickup = true;

    [Tooltip("Require player to press a button to pickup")]
    [SerializeField] private bool requireInteraction = false;

    [Tooltip("Key to press for pickup (if requireInteraction is true)")]
    [SerializeField] private KeyCode interactionKey = KeyCode.E;

    [Header("Visual Feedback")]
    [Tooltip("Show pickup prompt UI")]
    [SerializeField] private bool showPrompt = false;

    [Tooltip("Prompt text (e.g., 'Press E to collect')")]
    [SerializeField] private string promptText = "Press E to collect";

    [Header("Effects")]
    [Tooltip("Particle effect to play on pickup")]
    [SerializeField] private GameObject pickupEffect;

    [Tooltip("Sound to play on pickup")]
    [SerializeField] private AudioClip pickupSound;

    [Header("Events")]
    public UnityEvent onPickup;

    private bool isPlayerNearby = false;
    private bool hasBeenCollected = false;

    void Start()
    {
        // Ensure collider is trigger
        var col = GetComponent<Collider>();
        if (col != null && !col.isTrigger)
        {
            col.isTrigger = true;
            Debug.LogWarning($"LootPickup: Set collider to trigger on {gameObject.name}");
        }
    }

    void Update()
    {
        if (hasBeenCollected) return;

        // Check for interaction input
        if (requireInteraction && isPlayerNearby && Input.GetKeyDown(interactionKey))
        {
            CollectLoot();
        }
    }

    void OnTriggerEnter(Collider other)
    {
        if (!other.CompareTag("Player")) return;

        isPlayerNearby = true;

        // Auto pickup
        if (autoPickup && !requireInteraction && !hasBeenCollected)
        {
            CollectLoot();
        }
    }

    void OnTriggerExit(Collider other)
    {
        if (!other.CompareTag("Player")) return;

        isPlayerNearby = false;
    }

    /// <summary>
    /// Collect this loot item
    /// </summary>
    public void CollectLoot()
    {
        if (hasBeenCollected) return;

        hasBeenCollected = true;

        // Notify GameManager
        if (GameManager.Instance != null)
        {
            GameManager.Instance.OnLootCollected(gameObject, itemName);
        }

        // Play effects
        if (pickupEffect != null)
        {
            Instantiate(pickupEffect, transform.position, Quaternion.identity);
        }

        if (pickupSound != null && AudioManager.Instance != null)
        {
            AudioManager.Instance.PlaySFXAtPosition(pickupSound, transform.position);
        }

        // Fire event
        onPickup?.Invoke();

        // Your custom loot logic here
        // e.g., add to inventory, show UI notification, etc.
        Debug.Log($"Collected loot: {gameObject.name}");

        // Destroy or disable
        Destroy(gameObject, 0.1f);
    }

    void OnGUI()
    {
        if (!showPrompt || !requireInteraction || !isPlayerNearby || hasBeenCollected) return;

        // Simple on-screen prompt (replace with your UI system)
        Vector3 screenPos = Camera.main.WorldToScreenPoint(transform.position);
        if (screenPos.z > 0)
        {
            GUI.Label(new Rect(screenPos.x - 100, Screen.height - screenPos.y - 50, 200, 30), promptText);
        }
    }

    void OnDrawGizmos()
    {
        // Draw pickup radius
        Gizmos.color = hasBeenCollected ? Color.gray : Color.yellow;
        Gizmos.DrawWireSphere(transform.position, 1f);
    }
}
