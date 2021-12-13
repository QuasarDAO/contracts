// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

interface IERC721Mintable {

    function mint(address reciever) external;

    function balanceOf(address owner) external returns (uint);

}
