using UnityEngine;

namespace Invector.vCharacterController.AI.FSMBehaviour
{
#if UNITY_EDITOR
    [vFSMHelpbox("Check if the boss has been activated (cinematic completed)", UnityEditor.MessageType.Info)]
#endif
    public class vBossActivated : vStateDecision
    {
        public override string categoryName
        {
            get { return "Boss/"; }
        }

        public override string defaultName
        {
            get { return "Boss Activated?"; }
        }

        public override bool Decide(vIFSMBehaviourController fsmBehaviour)
        {
            if (fsmBehaviour == null || fsmBehaviour.aiController == null)
                return false;

            // Get the BossAIController component
            var bossController = fsmBehaviour.aiController.transform.GetComponent<BossAIController>();
            
            if (bossController == null)
            {
                Debug.LogWarning("vBossActivated: BossAIController not found on " + fsmBehaviour.aiController.transform.name);
                return false;
            }

            return bossController.IsActivated;
        }
    }
}

