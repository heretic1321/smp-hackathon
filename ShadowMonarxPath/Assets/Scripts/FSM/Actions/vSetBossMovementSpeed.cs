using UnityEngine;

namespace Invector.vCharacterController.AI.FSMBehaviour
{
    public class vSetBossMovementSpeed : vStateAction
    {
        public override string categoryName
        {
            get { return "Boss/"; }
        }

        public override string defaultName
        {
            get { return "Set Boss Movement Speed"; }
        }

        [Tooltip("Movement speed to set (0=Idle, 1=Walk, 2=Run, 3=Sprint)")]
        public vAIMovementSpeed movementSpeed = vAIMovementSpeed.Walking;

        [Tooltip("Call the BossAIController method to set appropriate speeds")]
        public bool useMenacingWalk = false;

        public override void DoAction(vIFSMBehaviourController fsmBehaviour, vFSMComponentExecutionType executionType = vFSMComponentExecutionType.OnStateUpdate)
        {
            if (fsmBehaviour == null || fsmBehaviour.aiController == null)
                return;

            var bossController = fsmBehaviour.aiController.transform.GetComponent<BossAIController>();

            if (executionType == vFSMComponentExecutionType.OnStateEnter)
            {
                if (useMenacingWalk && bossController != null)
                {
                    bossController.SetMenacingWalkSpeed();
                    var ctrl = fsmBehaviour.aiController as vControlAI;
                    if (ctrl != null) ctrl.SetSpeed(vAIMovementSpeed.Walking);
                }
                else if (!useMenacingWalk && bossController != null)
                {
                    bossController.SetFullCombatSpeed();
                    var ctrl = fsmBehaviour.aiController as vControlAI;
                    if (ctrl != null) ctrl.SetSpeed(movementSpeed);
                }
            }
        }
    }
}

