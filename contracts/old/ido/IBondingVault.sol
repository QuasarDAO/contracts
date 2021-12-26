// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

interface IBondingVault {

    function redeem() external returns (uint);

    function destroy(address payable _recipient) external;

}
