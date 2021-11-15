// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

interface IQUASERC20 {
    function burnFrom(address account_, uint256 amount_) external;

    function rebase( uint256 quasProfit_, uint epoch_) external returns (uint256);

    function circulatingSupply() external view returns (uint256);

    function balanceOf(address who) external view returns (uint256);

    function gonsForBalance( uint amount ) external view returns ( uint );

    function balanceForGons( uint gons ) external view returns ( uint );
    
}
