using System;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Data class containing statistics when player dies
/// Used for backend API calls on player death
/// </summary>
[Serializable]
public class DeathData
{
    [Header("Death Information")]
    public bool playerDied = true;
    public float survivalTime; // Time survived in seconds
    public DateTime deathTimestamp;
    public string deathPhase; // Which phase player died in

    [Header("Progress Data")]
    public int checkpointsReached;
    public bool phase1Completed;
    public bool phase2Completed;
    public bool phase3Completed;
    public bool phase4Completed;
    public bool reachedBossFight;

    [Header("Combat Statistics")]
    public int totalEnemiesDefeated;
    public int enemiesDefeatedPhase2;
    public int enemiesDefeatedPhase4;
    public int deathCount; // How many times player has died total

    [Header("Last Known Stats")]
    public float lastHealthPercentage;
    public Vector3 deathPosition;

    public DeathData()
    {
        deathTimestamp = DateTime.Now;
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
        Debug.Log("=== Player Death Data ===");
        Debug.Log($"Death Phase: {deathPhase}");
        Debug.Log($"Survival Time: {survivalTime:F2}s");
        Debug.Log($"Checkpoints Reached: {checkpointsReached}");
        Debug.Log($"Total Enemies Defeated: {totalEnemiesDefeated}");
        Debug.Log($"Death Count: {deathCount}");
        Debug.Log("========================");
    }
}

