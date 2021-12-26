// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IERC721Mintable.sol";

/**
    The only contract that can mint IDOAccessERC721 NFT.
    In order to mint an NFT a user should provide a correct secret which hash output exists in hashPuzzles map.
 */
contract Minter is Ownable {

    mapping( bytes32 => bool) public hashPuzzles;
    address public immutable erc721;

    /**
        @param _erc721 address of IDOAccessERC721 contract
     */
    constructor(address _erc721) {
        erc721 = _erc721;
    }

    /**
        @notice checks if can mint NFT using the provided secret
        @param secret secret
     */
    function canMint(bytes calldata secret) external view returns (bool) {

        bytes32 hash = keccak256(secret);
        return hashPuzzles[hash];
    }

    /**
        @notice mints NFT if the provided secret is correct reverts otherwise
        @param secret secret
     */
    function mint(bytes calldata secret) external {

        bytes32 hash = keccak256(secret);
        require(hashPuzzles[hash], 'Minter: Wrong secret');
        hashPuzzles[hash] = false;
        IERC721Mintable( erc721 ).mint(msg.sender);
    }

    /**
        @notice puts new answers or updates existing ones
        @param answers array of answers
        @param isActive isActive
     */
    function pushAnswers(bytes32[] calldata answers, bool isActive) external onlyOwner {

        for (uint i = 0; i < answers.length; i++) {
            hashPuzzles[answers[i]] = isActive;
        }
    }

}
