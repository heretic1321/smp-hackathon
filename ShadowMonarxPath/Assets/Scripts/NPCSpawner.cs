using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Invector.vCharacterController.AI;

public class NPCSpawner : MonoBehaviour
{
    [Header("NPC Prefabs")]
    [SerializeField]
    private List<GameObject> npcPrefabs = new List<GameObject>();

    [Header("Spawn Points")]
    [SerializeField]
    private List<Transform> spawnPoints = new List<Transform>();

    [Header("Spawn Settings")]
    [SerializeField]
    [Tooltip("Number of NPCs to spawn")]
    private int numberOfNPCsToSpawn = 5;

    [SerializeField]
    [Tooltip("Whether to allow spawning multiple NPCs at the same spawn point")]
    private bool allowMultipleAtSamePoint = false;

    [Header("AI Waypoint Settings")]
    [SerializeField]
    [Tooltip("Waypoint area that spawned NPCs will use for navigation")]
    private vWaypointArea waypointArea;

    private List<GameObject> spawnedNPCs = new List<GameObject>();

    /// <summary>
    /// Spawns the specified number of NPCs using the assigned prefabs and spawn points
    /// </summary>
    public void SpawnNPCs()
    {
        if (npcPrefabs.Count == 0)
        {
            Debug.LogWarning("No NPC prefabs assigned to the spawner!");
            return;
        }

        if (spawnPoints.Count == 0)
        {
            Debug.LogWarning("No spawn points assigned to the spawner!");
            return;
        }

        // Clear previously spawned NPCs if any
        ClearSpawnedNPCs();

        // Create a list of available spawn points
        List<Transform> availableSpawnPoints = new List<Transform>(spawnPoints);

        for (int i = 0; i < numberOfNPCsToSpawn; i++)
        {
            // Select a random prefab
            GameObject selectedPrefab = npcPrefabs[Random.Range(0, npcPrefabs.Count)];

            // Select a spawn point
            Transform selectedSpawnPoint = null;

            if (availableSpawnPoints.Count > 0)
            {
                selectedSpawnPoint = availableSpawnPoints[Random.Range(0, availableSpawnPoints.Count)];

                if (!allowMultipleAtSamePoint)
                {
                    availableSpawnPoints.Remove(selectedSpawnPoint);
                }
            }
            else if (allowMultipleAtSamePoint)
            {
                // If no available points but multiple allowed, pick any random point
                selectedSpawnPoint = spawnPoints[Random.Range(0, spawnPoints.Count)];
            }
            else
            {
                Debug.LogWarning("Not enough spawn points available for the number of NPCs to spawn!");
                break;
            }

            // Spawn the NPC
            GameObject spawnedNPC = Instantiate(selectedPrefab, selectedSpawnPoint.position, selectedSpawnPoint.rotation);
            spawnedNPCs.Add(spawnedNPC);

            // Assign waypoint area to AI controller if available
            AssignWaypointAreaToAI(spawnedNPC);

            Debug.Log($"Spawned {selectedPrefab.name} at {selectedSpawnPoint.name}");
        }
    }

    /// <summary>
    /// Spawns a specific number of NPCs
    /// </summary>
    /// <param name="count">Number of NPCs to spawn</param>
    public void SpawnNPCs(int count)
    {
        numberOfNPCsToSpawn = count;
        SpawnNPCs();
    }

    /// <summary>
    /// Spawns NPCs at specific spawn points
    /// </summary>
    /// <param name="prefab">The prefab to spawn</param>
    /// <param name="spawnPoint">The spawn point to use</param>
    /// <param name="count">Number of NPCs to spawn</param>
    public void SpawnNPCsAtPoints(GameObject prefab, Transform spawnPoint, int count = 1)
    {
        for (int i = 0; i < count; i++)
        {
            GameObject spawnedNPC = Instantiate(prefab, spawnPoint.position, spawnPoint.rotation);
            spawnedNPCs.Add(spawnedNPC);

            // Assign waypoint area to AI controller if available
            AssignWaypointAreaToAI(spawnedNPC);

            Debug.Log($"Spawned {prefab.name} at {spawnPoint.name}");
        }
    }

    /// <summary>
    /// Clears all spawned NPCs
    /// </summary>
    public void ClearSpawnedNPCs()
    {
        foreach (GameObject npc in spawnedNPCs)
        {
            if (npc != null)
            {
                Destroy(npc);
            }
        }
        spawnedNPCs.Clear();
        Debug.Log("Cleared all spawned NPCs");
    }

    /// <summary>
    /// Gets the list of currently spawned NPCs
    /// </summary>
    /// <returns>List of spawned NPC GameObjects</returns>
    public List<GameObject> GetSpawnedNPCs()
    {
        // Clean up any null references
        spawnedNPCs.RemoveAll(npc => npc == null);
        return spawnedNPCs;
    }

    /// <summary>
    /// Gets the count of currently spawned NPCs
    /// </summary>
    /// <returns>Number of spawned NPCs</returns>
    public int GetSpawnedNPCCount()
    {
        // Clean up any null references
        spawnedNPCs.RemoveAll(npc => npc == null);
        return spawnedNPCs.Count;
    }

    /// <summary>
    /// Assigns the waypoint area to the AI controller of a spawned NPC
    /// </summary>
    /// <param name="npc">The spawned NPC GameObject</param>
    private void AssignWaypointAreaToAI(GameObject npc)
    {
        if (waypointArea == null) return;

        // Try to find vControlAIMelee first (most specific)
        vControlAIMelee meleeController = npc.GetComponent<vControlAIMelee>();
        if (meleeController != null)
        {
            meleeController.waypointArea = waypointArea;
            Debug.Log($"Assigned waypoint area to {npc.name} (vControlAIMelee)");
            return;
        }

        // Try to find vControlAICombat
        vControlAICombat combatController = npc.GetComponent<vControlAICombat>();
        if (combatController != null)
        {
            combatController.waypointArea = waypointArea;
            Debug.Log($"Assigned waypoint area to {npc.name} (vControlAICombat)");
            return;
        }

        // Try to find base vControlAI
        vControlAI baseController = npc.GetComponent<vControlAI>();
        if (baseController != null)
        {
            baseController.waypointArea = waypointArea;
            Debug.Log($"Assigned waypoint area to {npc.name} (vControlAI)");
            return;
        }

        Debug.LogWarning($"No AI controller found on {npc.name} to assign waypoint area");
    }

    // Optional: Auto-spawn on start
    [Header("Auto Spawn")]
    [SerializeField]
    private bool spawnOnStart = false;

    private void Start()
    {
        if (spawnOnStart)
        {
            SpawnNPCs();
        }
    }

    // Optional: Draw spawn point gizmos in editor
    private void OnDrawGizmos()
    {
        if (spawnPoints == null) return;

        Gizmos.color = Color.red;
        foreach (Transform spawnPoint in spawnPoints)
        {
            if (spawnPoint != null)
            {
                Gizmos.DrawSphere(spawnPoint.position, 0.5f);
                Gizmos.DrawRay(spawnPoint.position, spawnPoint.forward * 2f);
            }
        }
    }
}
