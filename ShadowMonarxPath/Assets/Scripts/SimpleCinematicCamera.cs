using System.Collections;
using UnityEngine;
using UnityEngine.Events;
using Invector.vCharacterController;
using Invector.vCamera;

/// <summary>
/// Simple cinematic camera system for boss introduction
/// No Cinemachine required - just moves a camera through poses
/// </summary>
public class SimpleCinematicCamera : MonoBehaviour
{
    [Header("Camera")]
    [Tooltip("The camera that will be used for cinematic (usually Main Camera)")]
    [SerializeField] private Camera cinematicCamera;

    [Header("Cinematic Poses")]
    [Tooltip("Ordered list of poses the camera will move through")]
    [SerializeField] private SimpleCinematicPose[] poses;

    [Header("Player Control")]
    [Tooltip("Player GameObject (auto-finds by tag if null)")]
    [SerializeField] private GameObject player;

    [Header("Events")]
    public UnityEvent onCinematicStart;
    public UnityEvent onCinematicEnd;

    // Player control components
    private vThirdPersonInput playerInput;
    private vThirdPersonCamera invectorCamera;
    private bool playerInputWasEnabled;
    private bool invectorCameraWasEnabled;

    // Camera state
    private Transform originalCameraParent;
    private Vector3 originalCameraPosition;
    private Quaternion originalCameraRotation;
    private bool isPlayingCinematic = false;

    public bool IsPlayingCinematic => isPlayingCinematic;

    private void Awake()
    {
        // Auto-find camera
        if (cinematicCamera == null)
            cinematicCamera = Camera.main;

        // Auto-find player
        if (player == null)
            player = GameObject.FindGameObjectWithTag("Player");

        if (player != null)
        {
            playerInput = player.GetComponent<vThirdPersonInput>();
            invectorCamera = FindObjectOfType<vThirdPersonCamera>();
        }
    }

    /// <summary>
    /// Play the cinematic sequence
    /// </summary>
    public void PlayCinematic()
    {
        if (isPlayingCinematic)
        {
            Debug.LogWarning("SimpleCinematicCamera: Already playing cinematic!");
            return;
        }

        StartCoroutine(PlayCinematicSequence());
    }

    private IEnumerator PlayCinematicSequence()
    {
        isPlayingCinematic = true;

        // Store original camera state
        originalCameraParent = cinematicCamera.transform.parent;
        originalCameraPosition = cinematicCamera.transform.position;
        originalCameraRotation = cinematicCamera.transform.rotation;

        // Disable player control
        DisablePlayerControl();

        // Fire start event
        onCinematicStart?.Invoke();

        Debug.Log("SimpleCinematicCamera: Starting cinematic sequence");

        // Play through each pose
        if (poses != null && poses.Length > 0)
        {
            for (int i = 0; i < poses.Length; i++)
            {
                var pose = poses[i];
                if (pose == null) continue;

                Debug.Log($"SimpleCinematicCamera: Moving to pose {i + 1}/{poses.Length}");

                // Move camera to pose
                yield return StartCoroutine(MoveToPose(pose));

                // Hold at pose
                if (pose.holdDuration > 0)
                {
                    yield return new WaitForSeconds(pose.holdDuration);
                }

                // Fire pose event
                pose.onPoseReached?.Invoke();
            }
        }
        else
        {
            Debug.LogWarning("SimpleCinematicCamera: No poses assigned!");
        }

        Debug.Log("SimpleCinematicCamera: Cinematic sequence complete");

        // Restore camera
        RestoreCamera();

        // Re-enable player control
        EnablePlayerControl();

        // Fire end event
        onCinematicEnd?.Invoke();

        isPlayingCinematic = false;
    }

    private IEnumerator MoveToPose(SimpleCinematicPose pose)
    {
        Vector3 startPosition = cinematicCamera.transform.position;
        Quaternion startRotation = cinematicCamera.transform.rotation;
        float startFOV = cinematicCamera.fieldOfView;

        Vector3 targetPosition = pose.transform.position;
        Quaternion targetRotation = pose.transform.rotation;
        float targetFOV = pose.fieldOfView;

        // If pose has a look-at target, calculate rotation to look at it
        if (pose.lookAtTarget != null)
        {
            Vector3 direction = pose.lookAtTarget.position - targetPosition;
            if (direction != Vector3.zero)
            {
                targetRotation = Quaternion.LookRotation(direction);
            }
        }

        float elapsed = 0f;
        float duration = pose.transitionDuration;

        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / duration;

            // Apply easing curve if available
            if (pose.easeCurve != null && pose.easeCurve.length > 0)
            {
                t = pose.easeCurve.Evaluate(t);
            }

            // Interpolate position, rotation, and FOV
            cinematicCamera.transform.position = Vector3.Lerp(startPosition, targetPosition, t);
            cinematicCamera.transform.rotation = Quaternion.Slerp(startRotation, targetRotation, t);
            cinematicCamera.fieldOfView = Mathf.Lerp(startFOV, targetFOV, t);

            yield return null;
        }

        // Ensure final values
        cinematicCamera.transform.position = targetPosition;
        cinematicCamera.transform.rotation = targetRotation;
        cinematicCamera.fieldOfView = targetFOV;
    }

    private void DisablePlayerControl()
    {
        if (playerInput != null)
        {
            playerInputWasEnabled = playerInput.enabled;
            playerInput.enabled = false;
            playerInput.SetLockBasicInput(true);
            Debug.Log("SimpleCinematicCamera: Disabled player input");
        }

        if (invectorCamera != null)
        {
            invectorCameraWasEnabled = invectorCamera.enabled;
            invectorCamera.enabled = false;
            Debug.Log("SimpleCinematicCamera: Disabled Invector camera");
        }
    }

    private void EnablePlayerControl()
    {
        if (playerInput != null)
        {
            playerInput.enabled = playerInputWasEnabled;
            playerInput.SetLockBasicInput(false);
            Debug.Log("SimpleCinematicCamera: Enabled player input");
        }

        if (invectorCamera != null)
        {
            invectorCamera.enabled = invectorCameraWasEnabled;
            Debug.Log("SimpleCinematicCamera: Enabled Invector camera");
        }
    }

    private void RestoreCamera()
    {
        // Restore camera to original state
        cinematicCamera.transform.SetParent(originalCameraParent);
        cinematicCamera.transform.position = originalCameraPosition;
        cinematicCamera.transform.rotation = originalCameraRotation;
    }

    /// <summary>
    /// Stop cinematic immediately
    /// </summary>
    public void StopCinematic()
    {
        StopAllCoroutines();
        RestoreCamera();
        EnablePlayerControl();
        isPlayingCinematic = false;
        onCinematicEnd?.Invoke();
    }

    [ContextMenu("Test Play Cinematic")]
    private void TestPlayCinematic()
    {
        if (!Application.isPlaying)
        {
            Debug.LogWarning("Must be in play mode to test cinematic");
            return;
        }
        PlayCinematic();
    }
}
