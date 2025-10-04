// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Relic721
 * @notice ERC-721 NFT contract for in-game relics with dynamic attributes
 */
contract Relic721 is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _nextTokenId;

    // Relic metadata
    struct RelicMetadata {
        string relicType;
        uint256[] affixInts;
        string ipfsCid;
        uint256 mintedAt;
    }

    // Mapping from token ID to metadata
    mapping(uint256 => RelicMetadata) public relics;

    // Base URI for token metadata
    string private _baseTokenURI;

    // Events
    event RelicMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string relicType,
        uint256[] affixInts,
        string ipfsCid
    );

    constructor(string memory baseURI) ERC721("Shadow Monarch Relic", "RELIC") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }

    /**
     * @notice Mint a new relic NFT
     * @param to Address to mint the relic to
     * @param relicType Type of relic (e.g., "sword", "shield")
     * @param affixInts Array of affix values encoded as uint256
     * @param ipfsCid IPFS CID for relic metadata
     * @return tokenId The ID of the newly minted relic
     */
    function mint(
        address to,
        string memory relicType,
        uint256[] memory affixInts,
        string memory ipfsCid
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;

        _safeMint(to, tokenId);

        relics[tokenId] = RelicMetadata({
            relicType: relicType,
            affixInts: affixInts,
            ipfsCid: ipfsCid,
            mintedAt: block.timestamp
        });

        emit RelicMinted(tokenId, to, relicType, affixInts, ipfsCid);

        return tokenId;
    }

    /**
     * @notice Get relic metadata
     */
    function getRelicMetadata(uint256 tokenId) external view returns (RelicMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "Relic does not exist");
        return relics[tokenId];
    }

    /**
     * @notice Set base URI for token metadata
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @notice Get token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Relic does not exist");
        
        RelicMetadata memory relic = relics[tokenId];
        
        // Return IPFS URI
        return string(abi.encodePacked("ipfs://", relic.ipfsCid));
    }

    /**
     * @notice Get total supply of relics
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }
}
