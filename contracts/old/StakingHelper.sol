// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./common/IERC20.sol";
import "./common/IStaking.sol";

contract StakingHelper {

    address public immutable staking;
    address public immutable QUAS;

    constructor ( address _staking, address _QUAS ) {
        require( _staking != address(0) );
        staking = _staking;
        require( _QUAS != address(0) );
        QUAS = _QUAS;
    }

    function stake( uint _amount, address recipient ) external {
        IERC20( QUAS ).transferFrom( msg.sender, address(this), _amount );
        IERC20( QUAS ).approve( staking, _amount );
        IStaking( staking ).stake( _amount, recipient );
        IStaking( staking ).claim( recipient );
    }
}