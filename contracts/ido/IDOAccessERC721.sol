// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
    The contract of NFT that grants access to QuasarDAO IDO
 */
contract QuasarIDOAccessERC721 is ERC721, Ownable {

    uint public totalMinted = 0;
    
    /**
        @notice initializes NFT
     */
    constructor() ERC721("Quasar IDO Access", "QACCESS") { }

    /**
        @notice mints NFT to recierver
        @param reciever reciever's address
     */
    function mint(address reciever) external onlyOwner {

        _safeMint(reciever, totalMinted);
        totalMinted += 1;
    }
}
