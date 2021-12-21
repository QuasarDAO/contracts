// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../common/ManagerOwnable.sol";
import "../common/SafeERC20.sol";
import "./IBondingVault.sol";

contract BondingVault is ManagerOwnable, IBondingVault {

    using SafeERC20 for IERC20;

    address public immutable squas;

    constructor ( address _squas ) {
        squas = _squas;
    }

    function redeem() external override onlyManager returns (uint) {
        uint balance = IERC20( squas ).balanceOf(address(this));
        IERC20( squas ).safeTransfer( _owner, balance );
        return balance;
    }

    function destroy( address payable _recipient ) external override onlyManager {
        selfdestruct( _recipient );
    }

}
