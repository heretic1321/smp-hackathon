using System;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Data class containing all statistics when player completes the game
/// Used for backend API calls on victory
/// </summary>
[Serializable]
public class GameEndData
{
    [Header("Completion Data")]
    public bool gameCompleted = true;
    public float completionTime; // Total time in seconds
    public DateTime completionTimestamp;

    [Header("Combat Statistics")]
    public int totalEnemiesDefeated;
    public int enemiesDefeatedPhase2;
    public int enemiesDefeatedPhase4;
    public bool bossDefeated;

    [Header("Phase Completion")]
    public bool phase1Completed;
    public bool phase2Completed;
    public bool phase3Completed;
    public bool phase4Completed;
    public bool bossFightCompleted;

    [Header("Loot Collection")]
    public int lootItemsCollected;
    public List<string> collectedLootNames = new List<string>();

    [Header("Player Stats")]
    public float finalHealthPercentage;
    public int deathCount;

    public GameEndData()
    {
        completionTimestamp = DateTime.Now;
    }

    /// <summary>
    /// Convert to JSON string for backend API
    /// </summary>
    public string ToJson()
    {
        return JsonUtility.ToJson(this, true);
    }

    /// <summary>
    /// Print summary to console
    /// </summary>
    public void PrintSummary()
    {
        Debug.Log("=== Game Completion Data ===");
        Debug.Log($"Completion Time: {completionTime:F2}s");
        Debug.Log($"Total Enemies Defeated: {totalEnemiesDefeated}");
        Debug.Log($"Boss Defeated: {bossDefeated}");
        Debug.Log($"Loot Collected: {lootItemsCollected}");
        Debug.Log($"Death Count: {deathCount}");
        Debug.Log("===========================");
    }
}

