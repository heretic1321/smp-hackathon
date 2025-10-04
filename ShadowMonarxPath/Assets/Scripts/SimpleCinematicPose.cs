using UnityEngine;
using UnityEngine.Events;

/// <summary>
/// Simple cinematic pose - just a transform with camera settings
/// Position this GameObject where you want the camera to be
/// </summary>
public class SimpleCinematicPose : MonoBehaviour
{
    [Header("Camera Settings")]
    [Tooltip("Field of view for this pose")]
    [Range(10f, 120f)]
    public float fieldOfView = 60f;

    [Header("Transition")]
    [Tooltip("Time to transition from previous pose to this pose")]
    public float transitionDuration = 1.5f;

    [Tooltip("Easing curve for transition (optional)")]
    public AnimationCurve easeCurve = AnimationCurve.EaseInOut(0, 0, 1, 1);

    [Header("Hold")]
    [Tooltip("How long to hold at this pose before moving to next")]
    public float holdDuration = 2f;

    [Header("Look At (Optional)")]
    [Tooltip("If set, camera will look at this target instead of using pose rotation")]
    public Transform lookAtTarget;

    [Header("Events")]
    public UnityEvent onPoseReached;

    private void OnDrawGizmos()
    {
        // Draw camera frustum
        Gizmos.color = Color.cyan;
        Gizmos.matrix = transform.localToWorldMatrix;

        // Draw camera direction
        Gizmos.DrawRay(Vector3.zero, Vector3.forward * 3f);
        Gizmos.DrawWireCube(Vector3.forward * 3f, Vector3.one * 0.3f);

        // Draw FOV cone
        float halfFOV = fieldOfView * 0.5f * Mathf.Deg2Rad;
        float coneHeight = 5f;
        float coneRadius = Mathf.Tan(halfFOV) * coneHeight;

        Vector3 forward = Vector3.forward * coneHeight;
        Vector3 right = Vector3.right * coneRadius;
        Vector3 up = Vector3.up * coneRadius;

        Gizmos.DrawLine(Vector3.zero, forward + right + up);
        Gizmos.DrawLine(Vector3.zero, forward + right - up);
        Gizmos.DrawLine(Vector3.zero, forward - right + up);
        Gizmos.DrawLine(Vector3.zero, forward - right - up);

        // Draw look-at line
        if (lookAtTarget != null)
        {
            Gizmos.color = Color.yellow;
            Gizmos.DrawLine(transform.position, lookAtTarget.position);
        }
    }

    private void OnDrawGizmosSelected()
    {
        // Draw label
        #if UNITY_EDITOR
        UnityEditor.Handles.Label(transform.position + Vector3.up * 0.5f, 
            $"Pose\nFOV: {fieldOfView:F0}°\nTransition: {transitionDuration:F1}s\nHold: {holdDuration:F1}s");
        #endif
    }
}
