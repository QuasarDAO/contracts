// SPDX-License-Identifier: AGPL-3.0
pragma solidity >=0.7.5;

interface ITeller {
    function newBond( 
        uint256 _bid,
        address _bonder, 
        address _principal,
        uint _principalPaid,
        uint _payout, 
        uint _expires,
        address _feo
    ) external;
    function redeem(address _bonder, uint256 _bid, bool _unstake) external;
    function getReward() external;
    function setFEReward(uint256 reward) external;
    function payoutInfo(address _bonder, uint256 _index) external view returns (uint256 lockedPayout, uint256 lockedStakingRewards, uint256 pendingPayout, uint256 pendingStakingRewards);
    function percentVestedFor(address _bonder, uint256 _index) external view returns (uint256 percentVested_);
}
