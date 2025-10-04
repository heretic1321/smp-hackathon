using UnityEngine;

namespace Invector.vCharacterController.AI.FSMBehaviour
{
#if UNITY_EDITOR
    [vFSMHelpbox("Check if player is in close range for the FIRST TIME ONLY. Used to transition boss from menacing walk to full combat.", UnityEditor.MessageType.Info)]
#endif
    public class vBossPlayerCloseFirstTime : vStateDecision
    {
        [Tooltip("Distance at which the boss considers the player close")]
        public float closeDistance = 5f;

        public override string categoryName
        {
            get { return "Boss/"; }
        }

        public override string defaultName
        {
            get { return "Player Close (First Time)?"; }
        }

        public override bool Decide(vIFSMBehaviourController fsmBehaviour)
        {
            if (fsmBehaviour == null || fsmBehaviour.aiController == null)
                return false;

            // Get the BossAIController component
            var bossController = fsmBehaviour.aiController.transform.GetComponent<BossAIController>();
            
            if (bossController == null)
            {
                Debug.LogWarning("vBossPlayerCloseFirstTime: BossAIController not found on " + fsmBehaviour.aiController.transform.name);
                return false;
            }

            // If already reached player once, never return true again
            if (bossController.HasReachedPlayerOnce)
                return false;

            // Check distance to current target
            if (fsmBehaviour.aiController.currentTarget != null && fsmBehaviour.aiController.currentTarget.transform != null)
            {
                float distanceToTarget = Vector3.Distance(
                    fsmBehaviour.aiController.transform.position,
                    fsmBehaviour.aiController.currentTarget.transform.position
                );

                if (distanceToTarget <= closeDistance)
                {
                    // Mark that player has been reached
                    bossController.MarkPlayerReached();
                    return true;
                }
            }

            return false;
        }
    }
}

