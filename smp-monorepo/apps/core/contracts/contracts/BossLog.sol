// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BossLog
 * @notice Records boss kill events on-chain for verifiable game history
 */
contract BossLog is Ownable {
    // Event emitted when a boss is defeated
    event BossKilled(
        string indexed gateId,
        string gateRank,
        string indexed bossId,
        address[] participants,
        uint256[] contributions,
        uint256 timestamp,
        bytes32 runId
    );

    // Mapping to track if a runId has already been recorded (idempotency)
    mapping(bytes32 => bool) public recordedRuns;

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Emit a boss killed event
     * @param gateId The gate where the boss was fought
     * @param gateRank The rank of the gate (E, D, C, B, A, S)
     * @param bossId The boss identifier
     * @param participants Array of participant addresses
     * @param contributions Array of damage contributions
     */
    function emitBossKilled(
        string memory gateId,
        string memory gateRank,
        string memory bossId,
        address[] memory participants,
        uint256[] memory contributions
    ) external onlyOwner returns (bytes32) {
        require(participants.length > 0, "Must have at least one participant");
        require(participants.length == contributions.length, "Participants and contributions length mismatch");

        // Generate a unique run ID
        bytes32 runId = keccak256(abi.encodePacked(
            gateId,
            bossId,
            participants,
            block.timestamp,
            block.number
        ));

        // Ensure this run hasn't been recorded already
        require(!recordedRuns[runId], "Run already recorded");
        recordedRuns[runId] = true;

        emit BossKilled(
            gateId,
            gateRank,
            bossId,
            participants,
            contributions,
            block.timestamp,
            runId
        );

        return runId;
    }

    /**
     * @notice Check if a run has been recorded
     */
    function isRunRecorded(bytes32 runId) external view returns (bool) {
        return recordedRuns[runId];
    }
}
