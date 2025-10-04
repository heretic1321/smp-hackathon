using System.Collections;
using UnityEngine;
using UnityEngine.Events;
using Unity.Cinemachine; // kept for projects that still use it elsewhere (not used here)

/// <summary>
/// Boss Cinematic Trigger - Triggers a cinematic sequence when player enters
/// Adapted for Invector character controller system
/// Compatible with Unity 6 and Cinemachine 3.1.4+
/// </summary>
[RequireComponent(typeof(Collider))]
public class BossCinematicTrigger : MonoBehaviour
{
    [Header("Activation")]
    [Tooltip("Only trigger once per play session")]
    [SerializeField] private bool oneShot = true;
    
    [Tooltip("Only colliders on these layers will activate the trigger")]
    [SerializeField] private LayerMask triggerLayers = ~0;

    [Header("Boss Reference")]
    [Tooltip("The boss GameObject that will be showcased")]
    [SerializeField] private GameObject bossGameObject;
    
    [Tooltip("BossAIController component (auto-found if null)")]
    [SerializeField] private BossAIController bossController;

    [Header("Cinematic Settings")]
    [Tooltip("Duration of the cinematic in seconds")]
    [SerializeField] private float cinematicDuration = 5f;

    [Tooltip("Delay before triggering boss roar animation (in seconds from cinematic start)")]
    [SerializeField] private float roarTriggerDelay = 1.5f;

    [Header("Cameras (Simple Toggle)")]
    [Tooltip("Main gameplay Camera controlled by Invector")]
    [SerializeField] private Camera mainCamera;
    
    [Tooltip("Dedicated cinematic Camera enabled during the intro")]
    [SerializeField] private Camera cinematicCamera;

    [Header("Events")]
    [Tooltip("Called when cinematic starts")]
    public UnityEvent onCinematicStart;
    
    [Tooltip("Called when boss roar should trigger")]
    public UnityEvent onBossRoar;
    
    [Tooltip("Called when cinematic ends")]
    public UnityEvent onCinematicEnd;

    private bool hasFired = false;
    private InvectorCinematicUtility cinematicUtility;

    private void Start()
    {
        // Ensure collider is a trigger
        var col = GetComponent<Collider>();
        if (col != null && !col.isTrigger)
        {
            col.isTrigger = true;
            Debug.LogWarning("BossCinematicTrigger: Set collider to trigger on " + gameObject.name);
        }

        // Get or create cinematic utility
        cinematicUtility = FindObjectOfType<InvectorCinematicUtility>();
        if (cinematicUtility == null)
        {
            Debug.LogWarning("BossCinematicTrigger: InvectorCinematicUtility not found in scene. Creating one.");
            GameObject utilityObj = new GameObject("InvectorCinematicUtility");
            cinematicUtility = utilityObj.AddComponent<InvectorCinematicUtility>();
        }

        // Set camera references
        if (mainCamera != null && cinematicCamera != null)
        {
            cinematicUtility.SetCameraReferences(mainCamera, cinematicCamera);
        }

        // Auto-find boss controller if not assigned
        if (bossController == null && bossGameObject != null)
        {
            bossController = bossGameObject.GetComponent<BossAIController>();
        }

        // Ensure cinematic camera is disabled at start
        if (cinematicCamera != null)
        {
            cinematicCamera.enabled = false;
        }
    }

    private void OnTriggerEnter(Collider other)
    {
        // Check layer mask
        if (((1 << other.gameObject.layer) & triggerLayers) == 0)
            return;

        // Check if already fired
        if (oneShot && hasFired)
            return;

        // Check if it's the player
        if (!other.CompareTag("Player"))
            return;

        hasFired = true;
        Debug.Log("BossCinematicTrigger: Player entered, starting boss cinematic");

        // Start the cinematic sequence
        StartCoroutine(BossCinematicSequence());
    }

    private IEnumerator BossCinematicSequence()
    {
        // Start cinematic
        if (cinematicUtility != null)
        {
            cinematicUtility.BeginCinematic();
        }

        // Switch boss to roar animator
        if (bossController != null)
        {
            bossController.StartCinematic();
        }

        // Fire start event
        onCinematicStart?.Invoke();

        // Wait for roar trigger timing
        if (roarTriggerDelay > 0)
        {
            yield return new WaitForSeconds(roarTriggerDelay);
        }

        // Trigger boss roar
        if (bossController != null)
        {
            bossController.TriggerRoarAnimation();
        }
        onBossRoar?.Invoke();

        Debug.Log("BossCinematicTrigger: Boss roar triggered");

        // Wait for remaining cinematic duration
        float remainingTime = cinematicDuration - roarTriggerDelay;
        if (remainingTime > 0)
        {
            yield return new WaitForSeconds(remainingTime);
        }

        // Switch boss back to main animator
        if (bossController != null)
        {
            bossController.EndCinematic();
        }

        // End cinematic
        if (cinematicUtility != null)
        {
            cinematicUtility.EndCinematic();
        }

        // Activate the boss
        if (bossController != null)
        {
            bossController.ActivateBoss();
        }

        // Fire end event
        onCinematicEnd?.Invoke();

        Debug.Log("BossCinematicTrigger: Cinematic complete, boss activated");
    }

    /// <summary>
    /// Manually reset the trigger (for testing)
    /// </summary>
    [ContextMenu("Reset Trigger")]
    public void ResetTrigger()
    {
        hasFired = false;
        Debug.Log("BossCinematicTrigger: Trigger reset");
    }

    /// <summary>
    /// Manually trigger the cinematic (for testing)
    /// </summary>
    [ContextMenu("Test Trigger Cinematic")]
    public void TestTrigger()
    {
        if (!Application.isPlaying)
        {
            Debug.LogWarning("BossCinematicTrigger: Can only test in play mode");
            return;
        }
        hasFired = false;
        StartCoroutine(BossCinematicSequence());
    }

    private void OnDrawGizmos()
    {
        // Draw trigger area
        Gizmos.color = hasFired ? Color.gray : Color.yellow;
        var col = GetComponent<Collider>();
        if (col != null)
        {
            Gizmos.matrix = transform.localToWorldMatrix;
            if (col is BoxCollider box)
            {
                Gizmos.DrawWireCube(box.center, box.size);
            }
            else if (col is SphereCollider sphere)
            {
                Gizmos.DrawWireSphere(sphere.center, sphere.radius);
            }
        }

        // Draw line to boss
        if (bossGameObject != null)
        {
            Gizmos.color = Color.red;
            Gizmos.DrawLine(transform.position, bossGameObject.transform.position);
        }
    }
}

