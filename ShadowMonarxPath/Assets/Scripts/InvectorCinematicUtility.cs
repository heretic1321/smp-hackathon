using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Invector.vCharacterController;
using Invector.vCamera;

/// <summary>
/// Cinematic camera utility for Invector character controller system
/// Uses Cinemachine 3.x virtual cameras for cinematic sequences
/// Handles disabling/enabling Invector player input and camera during cinematics
/// Compatible with Unity 6 and Cinemachine 3.1.4+
/// </summary>
public class InvectorCinematicUtility : MonoBehaviour
{
    public static InvectorCinematicUtility Instance { get; private set; }

    [Header("Player References")]
    [Tooltip("Player GameObject (will auto-find if null)")]
    [SerializeField] private GameObject player;

    [Header("Cameras")]
    [Tooltip("Main gameplay Camera (controlled by Invector vThirdPersonCamera)")]
    [SerializeField] private Camera mainCamera;

    [Tooltip("Dedicated cinematic Camera (enabled only during boss cinematic)")]
    [SerializeField] private Camera cinematicCamera;

    private bool isInCinematic = false;
    
    // Stored component states for restoration
    private vThirdPersonInput playerInput;
    private vThirdPersonCamera tpCamera;
    private bool playerInputWasEnabled;
    private bool tpCameraWasEnabled;

    public bool IsInCinematic => isInCinematic;

    private void Awake()
    {
        // Singleton pattern
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;

        // Auto-find player if not assigned
        if (player == null)
        {
            player = GameObject.FindGameObjectWithTag("Player");
        }

        if (player != null)
        {
            playerInput = player.GetComponent<vThirdPersonInput>();
            if (playerInput == null)
            {
                Debug.LogWarning("InvectorCinematicUtility: vThirdPersonInput not found on player");
            }
        }

        // Find the third person camera
        tpCamera = FindObjectOfType<vThirdPersonCamera>();
        if (tpCamera == null)
        {
            Debug.LogWarning("InvectorCinematicUtility: vThirdPersonCamera not found in scene");
        }
    }

    /// <summary>
    /// Start a cinematic sequence
    /// </summary>
    public void BeginCinematic()
    {
        if (isInCinematic)
        {
            Debug.LogWarning("InvectorCinematicUtility: Already in cinematic!");
            return;
        }

        isInCinematic = true;

        // Disable player input
        if (playerInput != null)
        {
            playerInputWasEnabled = playerInput.enabled;
            playerInput.enabled = false;
            playerInput.SetLockBasicInput(true);
            Debug.Log("InvectorCinematicUtility: Disabled player input");
        }

        // Disable Invector camera
        if (tpCamera != null)
        {
            tpCameraWasEnabled = tpCamera.enabled;
            tpCamera.enabled = false;
            Debug.Log("InvectorCinematicUtility: Disabled Invector camera");
        }

        // Switch cameras: disable main, enable cinematic
        if (mainCamera != null && cinematicCamera != null)
        {
            mainCamera.enabled = false;
            cinematicCamera.enabled = true;
            Debug.Log("InvectorCinematicUtility: Enabled cinematic Camera, disabled main Camera");
        }
    }

    /// <summary>
    /// End the cinematic sequence and restore player control
    /// </summary>
    public void EndCinematic()
    {
        if (!isInCinematic)
        {
            Debug.LogWarning("InvectorCinematicUtility: Not in cinematic!");
            return;
        }

        isInCinematic = false;

        // Restore player input
        if (playerInput != null)
        {
            playerInput.enabled = playerInputWasEnabled;
            playerInput.SetLockBasicInput(false);
            Debug.Log("InvectorCinematicUtility: Restored player input");
        }

        // Restore Invector camera
        if (tpCamera != null)
        {
            tpCamera.enabled = tpCameraWasEnabled;
            Debug.Log("InvectorCinematicUtility: Restored Invector camera");
        }

        // Switch back: disable cinematic, enable main
        if (mainCamera != null && cinematicCamera != null)
        {
            cinematicCamera.enabled = false;
            mainCamera.enabled = true;
            Debug.Log("InvectorCinematicUtility: Restored main Camera, disabled cinematic Camera");
        }
    }

    /// <summary>
    /// Set Camera references at runtime
    /// </summary>
    public void SetCameraReferences(Camera mainCam, Camera cinematicCam)
    {
        mainCamera = mainCam;
        cinematicCamera = cinematicCam;
    }

    /// <summary>
    /// Play a cinematic for a specified duration
    /// </summary>
    public void PlayCinematic(float duration)
    {
        StartCoroutine(CinematicSequence(duration));
    }

    private IEnumerator CinematicSequence(float duration)
    {
        BeginCinematic();
        yield return new WaitForSeconds(duration);
        EndCinematic();
    }
}

