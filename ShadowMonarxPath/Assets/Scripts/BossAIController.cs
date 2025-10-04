using UnityEngine;
using Invector.vCharacterController.AI;
using UnityEngine.Events;
using System.Collections;

/// <summary>
/// Boss AI Controller - Standalone script that manages boss-specific behavior
/// Works alongside Invector's vControlAIMelee and vFSMBehaviourController
/// </summary>
public class BossAIController : MonoBehaviour
{
    [Header("Boss State")]
    [Tooltip("Is the boss activated (cinematic completed)?")]
    [SerializeField] private bool isActivated = false;
    
    [Tooltip("Has the boss reached the player once (transitions from walk to run)?")]
    [SerializeField] private bool hasReachedPlayerOnce = false;

    [Header("Animator Setup")]
    [Tooltip("The main animator component (will be auto-detected if not assigned)")]
    [SerializeField] private Animator animator;

    [Tooltip("Main animator controller for combat (complex animations)")]
    [SerializeField] private RuntimeAnimatorController mainAnimatorController;

    [Tooltip("Roar animator controller for cinematic (simple roar animation)")]
    [SerializeField] private RuntimeAnimatorController roarAnimatorController;

    [Tooltip("Roar animation trigger name")]
    [SerializeField] private string roarTriggerName = "Roar";

    // Store original controller to restore later
    private RuntimeAnimatorController originalController;

    [Header("FSM Behaviour")]
    [Tooltip("Simple FSM behaviour for initial approach (menacing walk)")]
    [SerializeField] private Invector.vCharacterController.AI.FSMBehaviour.vFSMBehaviour simpleBehaviour;

    [Tooltip("Complex FSM behaviour for full combat")]
    [SerializeField] private Invector.vCharacterController.AI.FSMBehaviour.vFSMBehaviour complexBehaviour;

    [Header("Behavior Transition")]
    [Tooltip("Distance to player to switch from simple to complex behaviour")]
    [SerializeField] private float combatActivationDistance = 5f;

    [Header("Movement Speed Settings")]
    [Tooltip("Slow menacing walk speed")]
    [SerializeField] private float menacingWalkSpeed = 1.5f;

    [Tooltip("Animation speed multiplier for menacing walk (slower = more menacing)")]
    [SerializeField] [Range(0.1f, 1f)] private float menacingAnimationSpeed = 0.5f;

    [Tooltip("Normal walk speed for combat")]
    [SerializeField] private float normalWalkSpeed = 2.5f;

    [Tooltip("Running speed for full combat")]
    [SerializeField] private float runSpeed = 4.5f;

    [Tooltip("Sprint speed for full combat")]
    [SerializeField] private float sprintSpeed = 6f;

    // Component references
    private vControlAIMelee aiMelee;
    private vIControlAI aiController;
    private Invector.vCharacterController.AI.FSMBehaviour.vFSMBehaviourController fsmController;
    private Transform playerTransform;

    // Public properties for FSM decisions to check
    public bool IsActivated => isActivated;
    public bool HasReachedPlayerOnce => hasReachedPlayerOnce;

    // Behaviour tracking
    private bool isInComplexBehaviour = false;

    private void Awake()
    {
        // Get component references
        aiMelee = GetComponent<vControlAIMelee>();
        aiController = GetComponent<vIControlAI>();
        fsmController = GetComponent<Invector.vCharacterController.AI.FSMBehaviour.vFSMBehaviourController>();

        if (aiMelee == null)
        {
            Debug.LogError("BossAIController: vControlAIMelee component not found on " + gameObject.name);
        }

        if (fsmController == null)
        {
            Debug.LogError("BossAIController: vFSMBehaviourController component not found on " + gameObject.name);
        }

        // Auto-assign animator if not set
        if (animator == null)
        {
            animator = GetComponent<Animator>();
        }

        if (animator == null)
        {
            Debug.LogError("BossAIController: Animator component not found on " + gameObject.name);
        }
        else
        {
            // Store the original controller
            originalController = animator.runtimeAnimatorController;
            
            // If main controller not assigned, use the current one
            if (mainAnimatorController == null)
            {
                mainAnimatorController = originalController;
                Debug.Log("BossAIController: Using current animator controller as main controller");
            }
        }

        if (roarAnimatorController == null)
        {
            Debug.LogWarning("BossAIController: Roar animator controller not assigned on " + gameObject.name);
        }
    }

    #region Public Methods (Called from UnityEvents and Cinematic System)

    /// <summary>
    /// Start cinematic - switch to roar animator controller
    /// </summary>
    public void StartCinematic()
    {
        if (animator != null && roarAnimatorController != null)
        {
            // Switch to roar animator controller
            animator.runtimeAnimatorController = roarAnimatorController;
            
            // Reset animator state
            animator.Rebind();
            animator.Update(0f);

            Debug.Log("BossAIController: Switched to roar animator controller on " + gameObject.name);
        }
        else
        {
            Debug.LogWarning("BossAIController: Cannot start cinematic - animator or roar controller not assigned!");
        }
    }

    /// <summary>
    /// Trigger the roar animation - called by cinematic when camera reaches boss
    /// </summary>
    public void TriggerRoarAnimation()
    {
        if (animator != null && animator.runtimeAnimatorController == roarAnimatorController)
        {
            animator.SetTrigger(roarTriggerName);
            Debug.Log("BossAIController: Triggering roar animation on " + gameObject.name);
        }
        else
        {
            Debug.LogWarning("BossAIController: Cannot trigger roar - roar controller not active!");
        }
    }

    /// <summary>
    /// End cinematic - switch back to main animator controller
    /// </summary>
    public void EndCinematic()
    {
        if (animator != null && mainAnimatorController != null)
        {
            // Switch back to main animator controller
            animator.runtimeAnimatorController = mainAnimatorController;
            
            // Reset animator state
            animator.Rebind();
            animator.Update(0f);

            Debug.Log("BossAIController: Switched back to main animator controller on " + gameObject.name);
        }
        else
        {
            Debug.LogWarning("BossAIController: Cannot end cinematic - animator or main controller not assigned!");
        }
    }

    /// <summary>
    /// Activate the boss - called when cinematic ends
    /// </summary>
    public void ActivateBoss()
    {
        isActivated = true;
        
        // Find and set player as target
        SetPlayerAsTarget();

        // Start with simple behaviour
        SwitchToSimpleBehaviour();

        // Set menacing walk speed
        SetMenacingWalkSpeed();

        // Set menacing animation speed
        SetMenacingAnimationSpeed();
        
        Debug.Log("BossAIController: Boss activated with simple behaviour - " + gameObject.name);
    }

    private void Update()
    {
        if (!isActivated || isInComplexBehaviour) return;

        // Check distance to player for behaviour transition
        if (playerTransform != null)
        {
            float distanceToPlayer = Vector3.Distance(transform.position, playerTransform.position);
            
            if (distanceToPlayer <= combatActivationDistance)
            {
                // Switch to complex behaviour
                SwitchToComplexBehaviour();
            }
        }
    }

    /// <summary>
    /// Find player and set as current target
    /// </summary>
    private void SetPlayerAsTarget()
    {
        if (aiController != null)
        {
            // Find player by tag
            GameObject player = GameObject.FindGameObjectWithTag("Player");
            if (player != null)
            {
                playerTransform = player.transform;
                aiController.SetCurrentTarget(playerTransform);
                Debug.Log("BossAIController: Set player as target");
            }
            else
            {
                Debug.LogWarning("BossAIController: Could not find player GameObject with 'Player' tag");
            }
        }
    }

    /// <summary>
    /// Set slow menacing walk speed - called when boss enters menacing approach state
    /// </summary>
    public void SetMenacingWalkSpeed()
    {
        if (aiController == null) return;

        // Set slower movement speeds for menacing approach
        if (aiMelee != null)
        {
            // Access the AI motor speeds
            var motor = aiMelee as vAIMotor;
            if (motor != null)
            {
                // Set free locomotion speeds
                motor.freeSpeed.walkSpeed = menacingWalkSpeed;
                motor.freeSpeed.runningSpeed = menacingWalkSpeed; // keep run same as walk to avoid running
                motor.freeSpeed.sprintSpeed = menacingWalkSpeed;  // keep sprint same as walk to avoid sprinting

                // Mirror for strafe speeds
                motor.strafeSpeed.walkSpeed = menacingWalkSpeed;
                motor.strafeSpeed.runningSpeed = menacingWalkSpeed;
                motor.strafeSpeed.sprintSpeed = menacingWalkSpeed;

                // Ensure AI is using walking state
                aiMelee.SetSpeed(vAIMovementSpeed.Walking);

                Debug.Log("BossAIController: Set menacing walk speed (" + menacingWalkSpeed + ")");
            }
        }
    }

    /// <summary>
    /// Set menacing animation speed - makes walk animation slower and more menacing
    /// </summary>
    private void SetMenacingAnimationSpeed()
    {
        if (animator != null)
        {
            animator.speed = menacingAnimationSpeed;
            Debug.Log($"BossAIController: Set menacing animation speed to {menacingAnimationSpeed}x");
        }
    }

    /// <summary>
    /// Restore normal animation speed - called when switching to complex behaviour
    /// </summary>
    private void RestoreNormalAnimationSpeed()
    {
        if (animator != null)
        {
            animator.speed = 1f;
            Debug.Log("BossAIController: Restored normal animation speed (1.0x)");
        }
    }

    /// <summary>
    /// Set full combat speed - called when boss enters full combat state
    /// </summary>
    public void SetFullCombatSpeed()
    {
        if (aiController == null) return;

        // Restore normal/faster movement speeds for combat
        if (aiMelee != null)
        {
            var motor = aiMelee as vAIMotor;
            if (motor != null)
            {
                // Set free locomotion speeds
                motor.freeSpeed.walkSpeed = normalWalkSpeed;
                motor.freeSpeed.runningSpeed = runSpeed;
                motor.freeSpeed.sprintSpeed = sprintSpeed;

                // Mirror for strafe speeds
                motor.strafeSpeed.walkSpeed = normalWalkSpeed;
                motor.strafeSpeed.runningSpeed = runSpeed;
                motor.strafeSpeed.sprintSpeed = sprintSpeed;

                // Allow AI to use running later
                aiMelee.SetSpeed(vAIMovementSpeed.Running);

                Debug.Log("BossAIController: Set full combat speed (run: " + runSpeed + ", sprint: " + sprintSpeed + ")");
            }
        }
    }

    /// <summary>
    /// Mark that the player has been reached once - called by FSM decision
    /// </summary>
    public void MarkPlayerReached()
    {
        if (!hasReachedPlayerOnce)
        {
            hasReachedPlayerOnce = true;
            Debug.Log("BossAIController: Player reached for first time - transitioning to full combat");
            
            // Automatically set full combat speed when player is reached
            SetFullCombatSpeed();
            
            // Switch to complex combat FSM behaviour
            SwitchToComplexBehaviour();
        }
    }

    /// <summary>
    /// Switch to simple behaviour (menacing walk towards player)
    /// </summary>
    public void SwitchToSimpleBehaviour()
    {
        if (fsmController != null && simpleBehaviour != null)
        {
            fsmController.ChangeBehaviour(simpleBehaviour);
            isInComplexBehaviour = false;
            SetMenacingWalkSpeed();
            SetMenacingAnimationSpeed();
            Debug.Log("BossAIController: Switched to simple behaviour - " + simpleBehaviour.name);
        }
        else
        {
            Debug.LogWarning("BossAIController: Cannot switch to simple behaviour - FSM controller or behaviour not assigned!");
        }
    }

    /// <summary>
    /// Switch to complex behaviour (full combat)
    /// </summary>
    public void SwitchToComplexBehaviour()
    {
        if (isInComplexBehaviour) return; // Already in complex mode

        if (fsmController != null && complexBehaviour != null)
        {
            fsmController.ChangeBehaviour(complexBehaviour);
            isInComplexBehaviour = true;
            SetFullCombatSpeed();
            RestoreNormalAnimationSpeed();
            Debug.Log("BossAIController: Switched to complex behaviour - " + complexBehaviour.name);
        }
        else
        {
            Debug.LogWarning("BossAIController: Cannot switch to complex behaviour - FSM controller or behaviour not assigned!");
        }
    }

    #endregion

    #region Debug Methods

    /// <summary>
    /// Reset boss state for testing
    /// </summary>
    [ContextMenu("Reset Boss State")]
    public void ResetBossState()
    {
        isActivated = false;
        hasReachedPlayerOnce = false;
        isInComplexBehaviour = false;
        Debug.Log("BossAIController: Boss state reset");
    }

    /// <summary>
    /// Manually switch to complex behaviour (for testing)
    /// </summary>
    [ContextMenu("Force Switch to Complex Behaviour")]
    public void ForceComplexBehaviour()
    {
        SwitchToComplexBehaviour();
    }

    /// <summary>
    /// Manually switch to simple behaviour (for testing)
    /// </summary>
    [ContextMenu("Force Switch to Simple Behaviour")]
    public void ForceSimpleBehaviour()
    {
        SwitchToSimpleBehaviour();
    }

    /// <summary>
    /// Test the full cinematic sequence (start → roar → end)
    /// </summary>
    [ContextMenu("Test Cinematic Sequence")]
    public void TestCinematicSequence()
    {
        StartCoroutine(TestCinematicCoroutine());
    }

    private IEnumerator TestCinematicCoroutine()
    {
        Debug.Log("Testing cinematic sequence...");

        // Start cinematic (switch to roar animator)
        StartCinematic();

        // Wait a bit
        yield return new WaitForSeconds(0.5f);

        // Trigger roar
        TriggerRoarAnimation();

        // Wait for animation to finish (adjust timing as needed)
        yield return new WaitForSeconds(2.0f);

        // End cinematic (switch back to main animator)
        EndCinematic();

        Debug.Log("Cinematic sequence test complete");
    }

    /// <summary>
    /// Test just the roar animation (assumes cinematic already started)
    /// </summary>
    [ContextMenu("Test Roar Animation Only")]
    public void TestRoarAnimation()
    {
        TriggerRoarAnimation();
    }

    #endregion

    #region Gizmos

    private void OnDrawGizmosSelected()
    {
        // Draw activation status
        if (Application.isPlaying)
        {
            Gizmos.color = isActivated ? Color.red : Color.gray;
            Gizmos.DrawWireSphere(transform.position + Vector3.up * 3f, 0.5f);
        }
    }

    #endregion
}

