using System.Runtime.InteropServices;
using UnityEngine;

/// <summary>
/// Bridge between Unity and WebGL JavaScript
/// Handles communication for game completion and player death events
/// </summary>
public class WebGLBridge : MonoBehaviour
{
    public static WebGLBridge Instance { get; private set; }

    [Header("Debug")]
    [SerializeField] private bool enableDebugLogs = true;

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            DebugLog("WebGLBridge initialized");
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void Start()
    {
        // Subscribe to GameManager events
        if (GameManager.Instance != null)
        {
            GameManager.Instance.OnGameComplete.AddListener(OnGameComplete);
            GameManager.Instance.OnPlayerDied.AddListener(OnPlayerDeath);
            DebugLog("Subscribed to GameManager events");
        }
        else
        {
            Debug.LogWarning("WebGLBridge: GameManager not found! Events will not be sent.");
        }

        // Notify WebGL that Unity is ready
        NotifyUnityReady();
    }

    private void OnDestroy()
    {
        // Unsubscribe from events
        if (GameManager.Instance != null)
        {
            GameManager.Instance.OnGameComplete.RemoveListener(OnGameComplete);
            GameManager.Instance.OnPlayerDied.RemoveListener(OnPlayerDeath);
        }
    }

    /// <summary>
    /// Called when game is completed
    /// </summary>
    private void OnGameComplete(GameEndData gameData)
    {
        DebugLog("Game completed! Sending data to WebGL...");
        
        if (gameData != null)
        {
            string jsonData = gameData.ToJson();
            DebugLog($"Game completion data: {jsonData}");
            SendGameCompleteToWebGL(jsonData);
        }
        else
        {
            Debug.LogError("WebGLBridge: GameEndData is null!");
            SendGameCompleteToWebGL("{}");
        }
    }

    /// <summary>
    /// Called when player dies
    /// </summary>
    private void OnPlayerDeath(DeathData deathData)
    {
        DebugLog("Player died! Sending data to WebGL...");
        
        if (deathData != null)
        {
            string jsonData = deathData.ToJson();
            DebugLog($"Death data: {jsonData}");
            SendPlayerDeathToWebGL(jsonData);
        }
        else
        {
            Debug.LogError("WebGLBridge: DeathData is null!");
            SendPlayerDeathToWebGL("{}");
        }
    }

    /// <summary>
    /// Send game completion data to WebGL
    /// </summary>
    private void SendGameCompleteToWebGL(string jsonData)
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        try
        {
            NotifyGameComplete(jsonData);
            DebugLog("Successfully called WebGL notifyGameComplete()");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"WebGLBridge: Error calling notifyGameComplete: {e.Message}");
        }
#else
        DebugLog($"[EDITOR/NON-WEBGL] Would call notifyGameComplete with: {jsonData}");
#endif
    }

    /// <summary>
    /// Send player death data to WebGL
    /// </summary>
    private void SendPlayerDeathToWebGL(string jsonData)
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        try
        {
            NotifyPlayerDeath(jsonData);
            DebugLog("Successfully called WebGL notifyPlayerDeath()");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"WebGLBridge: Error calling notifyPlayerDeath: {e.Message}");
        }
#else
        DebugLog($"[EDITOR/NON-WEBGL] Would call notifyPlayerDeath with: {jsonData}");
#endif
    }

    /// <summary>
    /// Notify WebGL that Unity is ready
    /// </summary>
    private void NotifyUnityReady()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        try
        {
            NotifyReady();
            DebugLog("Successfully called WebGL notifyReady()");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"WebGLBridge: Error calling notifyReady: {e.Message}");
        }
#else
        DebugLog("[EDITOR/NON-WEBGL] Would call notifyReady()");
#endif
    }

    /// <summary>
    /// Manual exit function (optional, for testing or manual exits)
    /// </summary>
    public void ExitGame()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        try
        {
            NotifyExit();
            DebugLog("Successfully called WebGL notifyExit()");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"WebGLBridge: Error calling notifyExit: {e.Message}");
        }
#else
        DebugLog("[EDITOR/NON-WEBGL] Would call notifyExit()");
#endif
    }

    private void DebugLog(string message)
    {
        if (enableDebugLogs)
        {
            Debug.Log($"[WebGLBridge] {message}");
        }
    }

    // ===== External JavaScript Functions =====
    // These are defined in the WebGL template's index.html

#if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")]
    private static extern void notifyReady();

    [DllImport("__Internal")]
    private static extern void notifyGameComplete(string gameDataJson);

    [DllImport("__Internal")]
    private static extern void notifyPlayerDeath(string deathDataJson);

    [DllImport("__Internal")]
    private static extern void notifyExit();

    // Wrapper methods to handle the DllImport calls
    private static void NotifyReady() => notifyReady();
    private static void NotifyGameComplete(string json) => notifyGameComplete(json);
    private static void NotifyPlayerDeath(string json) => notifyPlayerDeath(json);
    private static void NotifyExit() => notifyExit();
#else
    // Stub methods for non-WebGL builds
    private static void NotifyReady() { }
    private static void NotifyGameComplete(string json) { }
    private static void NotifyPlayerDeath(string json) { }
    private static void NotifyExit() { }
#endif
}
