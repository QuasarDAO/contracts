// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./common/IERC20.sol";

contract StakingWarmup {

    address public immutable staking;
    address public immutable sQUAS;

    constructor ( address _staking, address _sQUAS ) {
        require( _staking != address(0) );
        staking = _staking;
        require( _sQUAS != address(0) );
        sQUAS = _sQUAS;
    }

    function retrieve( address _staker, uint _amount ) external {
        require( msg.sender == staking );
        IERC20( sQUAS ).transfer( _staker, _amount );
    }
}
