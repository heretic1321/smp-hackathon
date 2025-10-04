using UnityEngine;

namespace Invector.vCharacterController.AI.FSMBehaviour
{
#if UNITY_EDITOR
    [vFSMHelpbox("Trigger the boss roar animation via BossAIController", UnityEditor.MessageType.Info)]
#endif
    public class vTriggerBossRoar : vStateAction
    {
        public override string categoryName
        {
            get { return "Boss/"; }
        }

    public override string defaultName
    {
        get { return "Trigger Boss Roar"; }
    }

    private bool hasTriggered = false;

    public override void DoAction(vIFSMBehaviourController fsmBehaviour, vFSMComponentExecutionType executionType = vFSMComponentExecutionType.OnStateUpdate)
    {
        if (hasTriggered) return;

        if (fsmBehaviour == null || fsmBehaviour.aiController == null)
            return;

        // Get the BossAIController component
        var bossController = fsmBehaviour.aiController.transform.GetComponent<BossAIController>();

        if (bossController != null)
        {
            bossController.TriggerRoarAnimation();
            hasTriggered = true;
            Debug.Log("vTriggerBossRoar: Triggered roar animation");
        }
        else
        {
            Debug.LogWarning("vTriggerBossRoar: BossAIController not found on " + fsmBehaviour.aiController.transform.name);
        }
    }
    }
}

