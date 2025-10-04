// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PlayerCardSBT
 * @notice Soul-Bound Token (non-transferable) representing player identity and progress
 */
contract PlayerCardSBT is ERC721, Ownable {
    // Player progress data
    struct PlayerProgress {
        string rank; // E, D, C, B, A, S
        uint256 level;
        uint256 xp;
        uint256 lastUpdated;
        bool exists;
    }

    // Mapping from address to token ID (one SBT per address)
    mapping(address => uint256) public playerToTokenId;
    
    // Mapping from token ID to player progress
    mapping(uint256 => PlayerProgress) public playerProgress;

    // Next token ID
    uint256 private _nextTokenId;

    // Events
    event PlayerCardMinted(uint256 indexed tokenId, address indexed player);
    event ProgressUpdated(address indexed player, string rank, uint256 level, uint256 xp);

    constructor() ERC721("Shadow Monarch Player Card", "SMPC") Ownable(msg.sender) {}

    /**
     * @notice Mint a player card SBT (only callable by game backend)
     * @param player Address to mint the SBT to
     */
    function mintPlayerCard(address player) external onlyOwner returns (uint256) {
        require(playerToTokenId[player] == 0, "Player already has a card");

        uint256 tokenId = ++_nextTokenId;
        
        _safeMint(player, tokenId);
        playerToTokenId[player] = tokenId;

        // Initialize with starting stats
        playerProgress[tokenId] = PlayerProgress({
            rank: "E",
            level: 1,
            xp: 0,
            lastUpdated: block.timestamp,
            exists: true
        });

        emit PlayerCardMinted(tokenId, player);

        return tokenId;
    }

    /**
     * @notice Update player progress (only callable by game backend)
     * @param addr Player address
     * @param rank New rank
     * @param level New level
     * @param xp New XP
     */
    function updateProgress(
        address addr,
        string memory rank,
        uint256 level,
        uint256 xp
    ) external onlyOwner {
        uint256 tokenId = playerToTokenId[addr];
        
        // If player doesn't have a card yet, mint one
        if (tokenId == 0) {
            tokenId = this.mintPlayerCard(addr);
        }

        require(playerProgress[tokenId].exists, "Player card does not exist");

        playerProgress[tokenId].rank = rank;
        playerProgress[tokenId].level = level;
        playerProgress[tokenId].xp = xp;
        playerProgress[tokenId].lastUpdated = block.timestamp;

        emit ProgressUpdated(addr, rank, level, xp);
    }

    /**
     * @notice Get player progress by address
     */
    function getPlayerProgress(address player) external view returns (PlayerProgress memory) {
        uint256 tokenId = playerToTokenId[player];
        require(tokenId != 0, "Player does not have a card");
        return playerProgress[tokenId];
    }

    /**
     * @notice Override transfer functions to make it soul-bound (non-transferable)
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0))
        // Disallow transfers (from != address(0) && to != address(0))
        require(
            from == address(0) || to == address(0),
            "Soul-bound tokens cannot be transferred"
        );

        return super._update(to, tokenId, auth);
    }

    /**
     * @notice Get token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        PlayerProgress memory progress = playerProgress[tokenId];
        
        // Return a data URI with on-chain metadata
        return string(abi.encodePacked(
            "data:application/json,{",
            '"name":"Shadow Monarch Player Card #', Strings.toString(tokenId), '",',
            '"description":"Soul-bound player identity and progress",',
            '"attributes":[',
                '{"trait_type":"Rank","value":"', progress.rank, '"},',
                '{"trait_type":"Level","value":', Strings.toString(progress.level), '},',
                '{"trait_type":"XP","value":', Strings.toString(progress.xp), '}',
            ']',
            '}'
        ));
    }

    /**
     * @notice Total supply of player cards
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }
}
