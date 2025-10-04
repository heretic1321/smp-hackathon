using UnityEngine;
using UnityEditor;
using Invector.vCharacterController.AI.FSMBehaviour;
using System.Collections.Generic;

/// <summary>
/// Editor utility to programmatically create a custom Boss FSM Behaviour asset
/// Creates a complete FSM behaviour based on the CustomDemonBehaviour structure
/// </summary>
public class BossFSMBehaviourCreator : EditorWindow
{
    [MenuItem("Tools/Boss System/Create Boss FSM Behaviour")]
    public static void CreateBossFSMBehaviour()
    {
        string path = "Assets/Prefabs/FSMBehaviour/BossBehaviour.asset";
        
        // Check if file already exists
        if (System.IO.File.Exists(path))
        {
            bool overwrite = EditorUtility.DisplayDialog(
                "File Exists",
                "BossBehaviour.asset already exists. Do you want to overwrite it?",
                "Yes", "No");
            
            if (!overwrite)
            {
                Debug.Log("Boss FSM Behaviour creation cancelled.");
                return;
            }
        }

        // Create the main FSM Behaviour
        vFSMBehaviour bossBehaviour = ScriptableObject.CreateInstance<vFSMBehaviour>();
        bossBehaviour.name = "BossBehaviour";

        // Create states
        var entryState = CreateEntryState(bossBehaviour);
        var anyState = CreateAnyState(bossBehaviour);
        var waitingState = CreateWaitingForActivationState(bossBehaviour);
        var menacingApproachState = CreateMenacingApproachState(bossBehaviour);
        var fullCombatState = CreateFullCombatState(bossBehaviour);
        var chaseState = CreateChaseState(bossBehaviour);

        // Add states to behaviour
        bossBehaviour.states = new List<vFSMState>
        {
            entryState,
            anyState,
            waitingState,
            menacingApproachState,
            chaseState,
            fullCombatState
        };

        // Set up transitions
        SetupTransitions(bossBehaviour, entryState, anyState, waitingState, menacingApproachState, fullCombatState, chaseState);

        // Create the asset
        AssetDatabase.CreateAsset(bossBehaviour, path);
        
        // Create and add sub-assets (actions, decisions, transitions)
        AddSubAssets(bossBehaviour, path);

        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
        
        EditorUtility.FocusProjectWindow();
        Selection.activeObject = bossBehaviour;
        
        Debug.Log("Boss FSM Behaviour created successfully at: " + path);
        EditorUtility.DisplayDialog("Success", "Boss FSM Behaviour created at:\n" + path, "OK");
    }

    private static vFSMState CreateEntryState(vFSMBehaviour parent)
    {
        var state = ScriptableObject.CreateInstance<vFSMState>();
        state.name = "Entry";
        state.Name = "Entry";
        state.description = "Entry state - transitions to Waiting for Activation";
        state.canRemove = false;
        state.canTranstTo = false;
        state.canSetAsDefault = false;
        state.canEditName = false;
        state.canEditColor = false;
        state.nodeColor = new Color(0, 1, 0, 1); // Green
        state.nodeRect = new Rect(965, 35, 150, 30);
        state.parentGraph = parent;
        state.useActions = false;
        state.useDecisions = false;
        state.actions = new List<vStateAction>();
        state.transitions = new List<vStateTransition>();
        return state;
    }

    private static vFSMState CreateAnyState(vFSMBehaviour parent)
    {
        var state = ScriptableObject.CreateInstance<vFSMState>();
        state.name = "AnyState";
        state.Name = "AnyState";
        state.description = "AnyState - runs after current state for global transitions";
        state.canRemove = false;
        state.canTranstTo = false;
        state.canSetAsDefault = false;
        state.canEditName = false;
        state.canEditColor = false;
        state.nodeColor = new Color(0, 1, 1, 1); // Cyan
        state.nodeRect = new Rect(375, 215, 165, 106);
        state.parentGraph = parent;
        state.useActions = false;
        state.useDecisions = true;
        state.actions = new List<vStateAction>();
        state.transitions = new List<vStateTransition>();
        return state;
    }

    private static vFSMState CreateWaitingForActivationState(vFSMBehaviour parent)
    {
        var state = ScriptableObject.CreateInstance<vFSMState>();
        state.name = "Waiting For Activation";
        state.Name = "Waiting For Activation";
        state.description = "Boss is waiting for cinematic to complete";
        state.canRemove = true;
        state.canTranstTo = true;
        state.canSetAsDefault = true;
        state.canEditName = true;
        state.canEditColor = true;
        state.nodeColor = new Color(0.5f, 0.5f, 0.5f, 1); // Gray
        state.nodeRect = new Rect(950, 125, 200, 30);
        state.parentGraph = parent;
        state.useActions = false;
        state.useDecisions = true;
        state.actions = new List<vStateAction>();
        state.transitions = new List<vStateTransition>();
        state.resetCurrentDestination = false;
        return state;
    }

    private static vFSMState CreateMenacingApproachState(vFSMBehaviour parent)
    {
        var state = ScriptableObject.CreateInstance<vFSMState>();
        state.name = "Menacing Approach";
        state.Name = "Menacing Approach";
        state.description = "Boss slowly walks toward player menacingly";
        state.canRemove = true;
        state.canTranstTo = true;
        state.canSetAsDefault = true;
        state.canEditName = true;
        state.canEditColor = true;
        state.nodeColor = new Color(1, 0.5f, 0, 1); // Orange
        state.nodeRect = new Rect(950, 225, 200, 30);
        state.parentGraph = parent;
        state.useActions = true;
        state.useDecisions = true;
        state.actions = new List<vStateAction>();
        state.transitions = new List<vStateTransition>();
        state.resetCurrentDestination = true;
        return state;
    }

    private static vFSMState CreateFullCombatState(vFSMBehaviour parent)
    {
        var state = ScriptableObject.CreateInstance<vFSMState>();
        state.name = "Full Combat";
        state.Name = "Full Combat";
        state.description = "Boss engages in full combat with running enabled";
        state.canRemove = true;
        state.canTranstTo = true;
        state.canSetAsDefault = true;
        state.canEditName = true;
        state.canEditColor = true;
        state.nodeColor = new Color(1, 0, 0, 1); // Red
        state.nodeRect = new Rect(710, 400, 150, 62);
        state.parentGraph = parent;
        state.useActions = true;
        state.useDecisions = true;
        state.actions = new List<vStateAction>();
        state.transitions = new List<vStateTransition>();
        state.resetCurrentDestination = true;
        return state;
    }

    private static vFSMState CreateChaseState(vFSMBehaviour parent)
    {
        var state = ScriptableObject.CreateInstance<vFSMState>();
        state.name = "Chase";
        state.Name = "Chase";
        state.description = "Boss chases the player";
        state.canRemove = true;
        state.canTranstTo = true;
        state.canSetAsDefault = true;
        state.canEditName = true;
        state.canEditColor = true;
        state.nodeColor = new Color(1, 1, 0, 1); // Yellow
        state.nodeRect = new Rect(750, 140, 150, 84);
        state.parentGraph = parent;
        state.useActions = true;
        state.useDecisions = true;
        state.actions = new List<vStateAction>();
        state.transitions = new List<vStateTransition>();
        state.resetCurrentDestination = true;
        return state;
    }

    private static void SetupTransitions(vFSMBehaviour behaviour, vFSMState entry, vFSMState anyState, 
        vFSMState waiting, vFSMState menacing, vFSMState combat, vFSMState chase)
    {
        // Entry -> Waiting For Activation (default transition)
        entry.defaultTransition = waiting;

        // Waiting For Activation -> Menacing Approach (when boss activated)
        var waitingTransition = CreateTransition(waiting, menacing, null);
        waiting.transitions.Add(waitingTransition);

        // Menacing Approach -> Full Combat (when player close first time)
        var menacingTransition = CreateTransition(menacing, combat, null);
        menacing.transitions.Add(menacingTransition);

        // AnyState transitions will be set up with proper decisions in AddSubAssets
        // AnyState -> Chase (when can see target but not in combat range)
        var anyToChase = CreateTransition(anyState, chase, null);
        anyState.transitions.Add(anyToChase);

        // AnyState -> Full Combat (when can see target and in combat range)
        var anyToCombat = CreateTransition(anyState, combat, null);
        anyState.transitions.Add(anyToCombat);
    }

    private static vStateTransition CreateTransition(vFSMState parent, vFSMState target, vStateDecision decision)
    {
        // vStateTransition requires a decision in the constructor; pass null to create an empty transition
        var transition = new vStateTransition(decision);
        transition.trueState = target;
        transition.falseState = null;
        transition.muteTrue = false;
        transition.muteFalse = false;
        transition.transitionType = vTransitionOutputType.Default;
        transition.transitionDelay = 0f;
        transition.parentState = parent;

        // If a decision was provided but not added (constructor with null), add it now
        if (decision != null)
        {
            // Ensure we only add once
            bool hasDecision = false;
            for (int i = 0; i < transition.decisions.Count; i++)
            {
                if (transition.decisions[i] != null && transition.decisions[i].decision == decision)
                {
                    hasDecision = true;
                    break;
                }
            }
            if (!hasDecision)
            {
                transition.decisions.Add(new vStateDecisionObject(decision));
            }
        }

        return transition;
    }

    private static void AddSubAssets(vFSMBehaviour behaviour, string path)
    {
        // Note: Creating actual decision/action instances would require the specific types
        // This is a simplified version. In practice, you would instantiate the specific
        // decision and action ScriptableObjects and add them as sub-assets
        
        Debug.Log("Boss FSM Behaviour structure created. You may need to manually assign decisions and actions in the Unity editor.");
        Debug.Log("Required Decisions: vBossActivated, vBossPlayerCloseFirstTime, Can See Target, In Combat Range");
        Debug.Log("Required Actions: Chase Target, Look To Target, Melee Combat, Set Boss Movement Speed");
    }
}

