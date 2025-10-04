using UnityEngine;
using UnityEditor;
using Invector.vCharacterController.AI;
using Invector.vCharacterController.AI.FSMBehaviour;
using System.Collections.Generic;

/// <summary>
/// Editor utility to create a simple Boss FSM Behaviour with complete actions and transitions
/// This FSM handles: Idle → Activate → Roar → Menacing Walk → Switch to Combat Behaviour
/// </summary>
public class SimpleBossFSMCreator : EditorWindow
{
    [MenuItem("Tools/Boss System/Create Simple Boss FSM")]
    public static void CreateSimpleBossFSM()
    {
        string path = "Assets/Prefabs/FSMBehaviour/SimpleBossBehaviour.asset";
        
        // Check if file already exists
        if (System.IO.File.Exists(path))
        {
            bool overwrite = EditorUtility.DisplayDialog(
                "File Exists",
                "SimpleBossBehaviour.asset already exists. Do you want to overwrite it?",
                "Yes", "No");
            
            if (!overwrite)
            {
                Debug.Log("Simple Boss FSM creation cancelled.");
                return;
            }
        }

        // Create the main FSM Behaviour
        vFSMBehaviour bossBehaviour = ScriptableObject.CreateInstance<vFSMBehaviour>();
        bossBehaviour.name = "SimpleBossBehaviour";

        // Create decisions
        var bossActivatedDecision = CreateBossActivatedDecision(bossBehaviour);
        var playerCloseDecision = CreatePlayerCloseDecision(bossBehaviour);

        // Create actions
        var setTargetAction = CreateSetTargetAction(bossBehaviour);
        var triggerRoarAction = CreateTriggerRoarAction(bossBehaviour);
        var chaseAction = CreateChaseAction(bossBehaviour);
        var lookAtTargetAction = CreateLookAtTargetAction(bossBehaviour);
        var setBossSpeedAction = CreateSetBossSpeedAction(bossBehaviour);

        // Create states
        var entryState = CreateEntryState(bossBehaviour);
        var anyState = CreateAnyState(bossBehaviour);
        var waitingState = CreateWaitingState(bossBehaviour);
        var roarState = CreateRoarState(bossBehaviour, setTargetAction, triggerRoarAction);
        var menacingApproachState = CreateMenacingApproachState(bossBehaviour, chaseAction, lookAtTargetAction, setBossSpeedAction);

        // Add states to behaviour
        bossBehaviour.states = new List<vFSMState>
        {
            entryState,
            anyState,
            waitingState,
            roarState,
            menacingApproachState
        };

        // Set up transitions
        SetupTransitions(bossBehaviour, entryState, waitingState, roarState, menacingApproachState, bossActivatedDecision, playerCloseDecision);

        // Create the asset
        AssetDatabase.CreateAsset(bossBehaviour, path);
        
        // Add sub-assets
        if (bossActivatedDecision) AssetDatabase.AddObjectToAsset(bossActivatedDecision, path);
        if (playerCloseDecision) AssetDatabase.AddObjectToAsset(playerCloseDecision, path);
        if (setTargetAction) AssetDatabase.AddObjectToAsset(setTargetAction, path);
        if (triggerRoarAction) AssetDatabase.AddObjectToAsset(triggerRoarAction, path);
        if (chaseAction) AssetDatabase.AddObjectToAsset(chaseAction, path);
        if (lookAtTargetAction) AssetDatabase.AddObjectToAsset(lookAtTargetAction, path);
        if (setBossSpeedAction) AssetDatabase.AddObjectToAsset(setBossSpeedAction, path);
        if (entryState) AssetDatabase.AddObjectToAsset(entryState, path);
        if (anyState) AssetDatabase.AddObjectToAsset(anyState, path);
        if (waitingState) AssetDatabase.AddObjectToAsset(waitingState, path);
        if (roarState) AssetDatabase.AddObjectToAsset(roarState, path);
        if (menacingApproachState) AssetDatabase.AddObjectToAsset(menacingApproachState, path);

        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
        
        EditorUtility.FocusProjectWindow();
        Selection.activeObject = bossBehaviour;
        
        Debug.Log("Simple Boss FSM created successfully at: " + path);
        EditorUtility.DisplayDialog("Success", 
            "SimpleBossBehaviour.asset created!\n\n" +
            "States:\n" +
            "1. Entry → Waiting For Activation (idle)\n" +
            "2. Waiting → Roar (when boss activated by cinematic)\n" +
            "3. Roar → Menacing Approach (automatic after 2s)\n" +
            "4. Menacing Approach → Switches to Combat Behaviour when player gets close\n\n" +
            "Assign this to your boss's vFSMBehaviourController.", 
            "OK");
    }

    #region Create Decisions

    private static vBossActivated CreateBossActivatedDecision(vFSMBehaviour parent)
    {
        var decision = ScriptableObject.CreateInstance<vBossActivated>();
        decision.name = "Boss Activated?";
        decision.parentFSM = parent;
        return decision;
    }

    private static vBossPlayerCloseFirstTime CreatePlayerCloseDecision(vFSMBehaviour parent)
    {
        var decision = ScriptableObject.CreateInstance<vBossPlayerCloseFirstTime>();
        decision.name = "Player Close (First Time)?";
        decision.parentFSM = parent;
        return decision;
    }

    #endregion

    #region Create Actions

    private static vSetPlayerAsTarget CreateSetTargetAction(vFSMBehaviour parent)
    {
        var action = ScriptableObject.CreateInstance<vSetPlayerAsTarget>();
        action.name = "Set Player As Target";
        action.parentFSM = parent;
        return action;
    }

    private static vTriggerBossRoar CreateTriggerRoarAction(vFSMBehaviour parent)
    {
        var action = ScriptableObject.CreateInstance<vTriggerBossRoar>();
        action.name = "Trigger Roar Animation";
        action.parentFSM = parent;
        return action;
    }

    private static vGoToTarget CreateChaseAction(vFSMBehaviour parent)
    {
        var action = ScriptableObject.CreateInstance<vGoToTarget>();
        action.name = "Go To Target (Walk)";
        action.parentFSM = parent;
        action.speed = vAIMovementSpeed.Walking;
        return action;
    }

    private static vLookToTargetAction CreateLookAtTargetAction(vFSMBehaviour parent)
    {
        var action = ScriptableObject.CreateInstance<vLookToTargetAction>();
        action.name = "Look To Target";
        action.parentFSM = parent;
        return action;
    }

    private static vSetBossMovementSpeed CreateSetBossSpeedAction(vFSMBehaviour parent)
    {
        var action = ScriptableObject.CreateInstance<vSetBossMovementSpeed>();
        action.name = "Set Menacing Walk Speed";
        action.parentFSM = parent;
        return action;
    }

    #endregion

    #region Create States

    private static vFSMState CreateEntryState(vFSMBehaviour parent)
    {
        var state = ScriptableObject.CreateInstance<vFSMState>();
        state.name = "Entry";
        state.Name = "Entry";
        state.description = "Entry state - immediately transitions to Waiting";
        state.canRemove = false;
        state.canTranstTo = false;
        state.canSetAsDefault = false;
        state.canEditName = false;
        state.canEditColor = false;
        state.nodeColor = new Color(0, 1, 0, 1); // Green
        state.nodeRect = new Rect(300, 50, 150, 30);
        state.parentGraph = parent;
        state.useActions = true; // Changed to true
        state.useDecisions = true; // Changed to true
        state.actions = new List<vStateAction>(); // Properly initialize
        state.transitions = new List<vStateTransition>();
        state.resetCurrentDestination = false;
        return state;
    }

    private static vFSMState CreateAnyState(vFSMBehaviour parent)
    {
        var state = ScriptableObject.CreateInstance<vFSMState>();
        state.name = "AnyState";
        state.Name = "AnyState";
        state.description = "AnyState - global transitions (currently unused)";
        state.canRemove = false;
        state.canTranstTo = false;
        state.canSetAsDefault = false;
        state.canEditName = false;
        state.canEditColor = false;
        state.nodeColor = new Color(0, 1, 1, 1); // Cyan
        state.nodeRect = new Rect(50, 150, 165, 80);
        state.parentGraph = parent;
        state.useActions = true; // Changed to true
        state.useDecisions = true; // Changed to true
        state.actions = new List<vStateAction>(); // Properly initialize
        state.transitions = new List<vStateTransition>();
        state.resetCurrentDestination = false;
        return state;
    }

    private static vFSMState CreateWaitingState(vFSMBehaviour parent)
    {
        var state = ScriptableObject.CreateInstance<vFSMState>();
        state.name = "Waiting For Activation";
        state.Name = "Waiting For Activation";
        state.description = "Boss idle, waiting for cinematic to complete";
        state.canRemove = true;
        state.canTranstTo = true;
        state.canSetAsDefault = true;
        state.canEditName = true;
        state.canEditColor = true;
        state.nodeColor = new Color(0.7f, 0.7f, 0.7f, 1); // Gray
        state.nodeRect = new Rect(300, 150, 200, 30);
        state.parentGraph = parent;
        state.useActions = true; // Changed to true to properly initialize actions
        state.useDecisions = true;
        state.actions = new List<vStateAction>(); // Initialize empty list properly
        state.transitions = new List<vStateTransition>();
        state.resetCurrentDestination = false;
        return state;
    }

    private static vFSMState CreateRoarState(vFSMBehaviour parent, vSetPlayerAsTarget setTarget, vTriggerBossRoar triggerRoar)
    {
        var state = ScriptableObject.CreateInstance<vFSMState>();
        state.name = "Roar At Player";
        state.Name = "Roar At Player";
        state.description = "Boss sets target and roars, then transitions to menacing approach";
        state.canRemove = true;
        state.canTranstTo = true;
        state.canSetAsDefault = true;
        state.canEditName = true;
        state.canEditColor = true;
        state.nodeColor = new Color(1, 0, 0, 1); // Red
        state.nodeRect = new Rect(300, 200, 200, 30);
        state.parentGraph = parent;
        state.useActions = true;
        state.useDecisions = false;
        state.actions = new List<vStateAction>();
        
        // Add actions in order
        if (setTarget) state.actions.Add(setTarget);
        if (triggerRoar) state.actions.Add(triggerRoar);
        
        state.transitions = new List<vStateTransition>();
        state.resetCurrentDestination = false;
        return state;
    }

    private static vFSMState CreateMenacingApproachState(vFSMBehaviour parent, 
        vGoToTarget chase, vLookToTargetAction look, vSetBossMovementSpeed speed)
    {
        var state = ScriptableObject.CreateInstance<vFSMState>();
        state.name = "Menacing Approach";
        state.Name = "Menacing Approach";
        state.description = "Boss walks slowly toward player, then switches to combat behaviour";
        state.canRemove = true;
        state.canTranstTo = true;
        state.canSetAsDefault = true;
        state.canEditName = true;
        state.canEditColor = true;
        state.nodeColor = new Color(1, 0.6f, 0, 1); // Orange
        state.nodeRect = new Rect(300, 250, 200, 30);
        state.parentGraph = parent;
        state.useActions = true;
        state.useDecisions = true;
        state.actions = new List<vStateAction>();
        
        // Add actions in order
        if (speed) state.actions.Add(speed);
        if (chase) state.actions.Add(chase);
        if (look) state.actions.Add(look);
        
        state.transitions = new List<vStateTransition>();
        state.resetCurrentDestination = true;
        return state;
    }

    #endregion

    #region Setup Transitions

    private static void SetupTransitions(vFSMBehaviour behaviour, vFSMState entry, vFSMState waiting, 
        vFSMState roar, vFSMState menacing, vBossActivated bossActivated, vBossPlayerCloseFirstTime playerClose)
    {
        // Entry -> Waiting (default transition)
        entry.defaultTransition = waiting;

        // Waiting -> Roar (when boss activated by cinematic)
        if (bossActivated != null)
        {
            var waitingTransition = new vStateTransition(bossActivated);
            waitingTransition.trueState = roar;
            waitingTransition.falseState = null;
            waitingTransition.muteTrue = false;
            waitingTransition.muteFalse = false;
            waitingTransition.transitionType = vTransitionOutputType.Default;
            waitingTransition.transitionDelay = 0f;
            waitingTransition.parentState = waiting;
            
            waiting.transitions.Add(waitingTransition);
        }

        // Roar -> Menacing Approach (automatic after 2 seconds to let roar animation play)
        roar.defaultTransition = menacing;

        // Menacing Approach -> (FSM switch handled by BossAIController when playerClose triggers)
        // We add the decision but no target state - the script will handle the FSM switch
        if (playerClose != null)
        {
            var menacingTransition = new vStateTransition(playerClose);
            menacingTransition.trueState = null; // No target - script handles it
            menacingTransition.falseState = null;
            menacingTransition.muteTrue = false;
            menacingTransition.muteFalse = false;
            menacingTransition.transitionType = vTransitionOutputType.Default;
            menacingTransition.transitionDelay = 0f;
            menacingTransition.parentState = menacing;
            
            menacing.transitions.Add(menacingTransition);
        }
    }

    #endregion
}

