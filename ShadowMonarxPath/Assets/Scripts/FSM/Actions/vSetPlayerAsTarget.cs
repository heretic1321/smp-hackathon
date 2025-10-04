using UnityEngine;

namespace Invector.vCharacterController.AI.FSMBehaviour
{
#if UNITY_EDITOR
    [vFSMHelpbox("Set the player GameObject (with 'Player' tag) as the AI's current target", UnityEditor.MessageType.Info)]
#endif
    public class vSetPlayerAsTarget : vStateAction
    {
        public override string categoryName
        {
            get { return "Boss/"; }
        }

        public override string defaultName
        {
            get { return "Set Player As Target"; }
        }

        public vSetPlayerAsTarget()
        {
            executionType = vFSMComponentExecutionType.OnStateEnter;
        }

        public override void DoAction(vIFSMBehaviourController fsmBehaviour, vFSMComponentExecutionType executionType = vFSMComponentExecutionType.OnStateUpdate)
        {
            if (fsmBehaviour == null || fsmBehaviour.aiController == null)
                return;

            // Find player by tag
            GameObject player = GameObject.FindGameObjectWithTag("Player");
            if (player != null)
            {
                fsmBehaviour.aiController.SetCurrentTarget(player.transform);
                Debug.Log("vSetPlayerAsTarget: Set player as target for " + fsmBehaviour.aiController.transform.name);
            }
            else
            {
                Debug.LogWarning("vSetPlayerAsTarget: Could not find GameObject with 'Player' tag");
            }
        }
    }
}

