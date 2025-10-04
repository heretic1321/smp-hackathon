using UnityEngine;

/// <summary>
/// Trigger component that notifies GameManager when player enters a new phase
/// Place these at phase transition points throughout the level
/// </summary>
[RequireComponent(typeof(Collider))]
public class PhaseTransitionTrigger : MonoBehaviour
{
    [Header("Trigger Settings")]
    [Tooltip("The phase to transition to when player enters this trigger")]
    [SerializeField] private GamePhase targetPhase = GamePhase.Phase2;

    [Tooltip("Only trigger once (recommended for phase transitions)")]
    [SerializeField] private bool oneShot = true;

    [Tooltip("Only colliders on these layers will activate the trigger")]
    [SerializeField] private LayerMask triggerLayers = ~0;

    [Header("Visual Settings")]
    [Tooltip("Color of the gizmo in the editor")]
    [SerializeField] private Color gizmoColor = new Color(0f, 1f, 0f, 0.3f);

    private bool hasTriggered = false;

    private void Start()
    {
        // Ensure collider is a trigger
        var col = GetComponent<Collider>();
        if (col != null && !col.isTrigger)
        {
            col.isTrigger = true;
            Debug.LogWarning($"PhaseTransitionTrigger: Set collider to trigger on {gameObject.name}");
        }
    }

    private void OnTriggerEnter(Collider other)
    {
        // Check if already triggered
        if (oneShot && hasTriggered)
            return;

        // Check layer mask
        if (((1 << other.gameObject.layer) & triggerLayers) == 0)
            return;

        // Check if it's the player
        if (!other.CompareTag("Player"))
            return;

        // Trigger phase transition
        if (GameManager.Instance != null)
        {
            hasTriggered = true;
            Debug.Log($"PhaseTransitionTrigger: Player entered, transitioning to {targetPhase}");
            GameManager.Instance.TransitionToPhase(targetPhase);
        }
        else
        {
            Debug.LogError("PhaseTransitionTrigger: GameManager instance not found!");
        }
    }

    /// <summary>
    /// Reset trigger state (for testing)
    /// </summary>
    [ContextMenu("Reset Trigger")]
    public void ResetTrigger()
    {
        hasTriggered = false;
        Debug.Log($"PhaseTransitionTrigger: Trigger reset on {gameObject.name}");
    }

    private void OnDrawGizmos()
    {
        // Draw trigger area
        Gizmos.color = hasTriggered ? Color.gray : gizmoColor;
        var col = GetComponent<Collider>();
        if (col != null)
        {
            Gizmos.matrix = transform.localToWorldMatrix;
            if (col is BoxCollider box)
            {
                Gizmos.DrawCube(box.center, box.size);
                Gizmos.color = new Color(gizmoColor.r, gizmoColor.g, gizmoColor.b, 1f);
                Gizmos.DrawWireCube(box.center, box.size);
            }
            else if (col is SphereCollider sphere)
            {
                Gizmos.DrawSphere(sphere.center, sphere.radius);
                Gizmos.color = new Color(gizmoColor.r, gizmoColor.g, gizmoColor.b, 1f);
                Gizmos.DrawWireSphere(sphere.center, sphere.radius);
            }
        }

        // Draw label
        #if UNITY_EDITOR
        UnityEditor.Handles.Label(transform.position + Vector3.up * 2f, $"Phase Transition\n→ {targetPhase}");
        #endif
    }
}

