// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.7.5;

import "./libraries/SafeMath.sol";
import "./libraries/SafeERC20.sol";

import "./interfaces/IERC20.sol";
import "./interfaces/ITreasury.sol";
import "./interfaces/IStaking.sol";
import "./interfaces/IOwnable.sol";
import "./interfaces/IsQUAS.sol";
import "./interfaces/ITeller.sol";

import "./types/QuasarAccessControlled.sol";

contract BondTeller is ITeller, QuasarAccessControlled {
    /* ========== DEPENDENCIES ========== */

    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using SafeERC20 for IsQUAS;

    /* ========== EVENTS =========== */

    event BondCreated(address indexed bonder, uint256 payout, uint256 expires);
    event Redeemed(address indexed bonder, uint256 payout);

    /* ========== MODIFIERS ========== */

    modifier onlyDepository() {
        require(msg.sender == depository || msg.sender == idoDepository, "Only depository");
        _;
    }

    /* ========== STRUCTS ========== */

    // Info for bond holder
    struct Bond {
        address principal; // token used to pay for bond
        uint256 principalPaid; // amount of principal token paid for bond
        uint256 payout; // QUAS remaining to be paid. agnostic balance
        uint256 bonded; // QUAS bonded 
        uint256 vested; // Block timestamp when bond is vested
        uint256 created; // time bond was created
        uint256 redeemed; // time bond was redeemed
    }

    /* ========== STATE VARIABLES ========== */

    address internal immutable depository; // contract where users deposit bonds
    address internal immutable idoDepository; // ido depository
    IStaking internal immutable staking; // contract to stake payout
    ITreasury internal immutable treasury;
    IERC20 internal immutable QUAS;
    IsQUAS internal immutable sQUAS; // payment token

    mapping(address => mapping(uint256 => Bond)) public bonderInfo; // address => bond id => Bond

    mapping(address => uint256) public FERs; // front end operator rewards
    uint256 public feReward;

    /* ========== CONSTRUCTOR ========== */

    constructor(
        address _depository,
        address _idoDepository,
        address _staking,
        address _treasury,
        address _quas,
        address _sQUAS,
        address _authority
    ) QuasarAccessControlled(IQuasarAuthority(_authority)) {
        require(_depository != address(0), "Zero address: Depository");
        depository = _depository;
        require(_depository != address(0), "Zero address: IDO Depository");
        idoDepository = _idoDepository;
        require(_staking != address(0), "Zero address: Staking");
        staking = IStaking(_staking);
        require(_treasury != address(0), "Zero address: Treasury");
        treasury = ITreasury(_treasury);
        require(_quas != address(0), "Zero address: QUAS");
        QUAS = IERC20(_quas);
        require(_sQUAS != address(0), "Zero address: sQUAS");
        sQUAS = IsQUAS(_sQUAS);
    }

    /* ========== DEPOSITORY FUNCTIONS ========== */

    /**
     * @notice add new bond payout to user data
     * @param _bid bond id
     * @param _bonder address
     * @param _principal address
     * @param _principalPaid uint256
     * @param _payout uint256
     * @param _expires uint256
     * @param _feo address
     */
    function newBond(
        uint256 _bid,
        address _bonder,
        address _principal,
        uint256 _principalPaid,
        uint256 _payout,
        uint256 _expires,
        address _feo
    ) external override onlyDepository {
        uint256 reward = _payout.mul(feReward).div(10_000);
        treasury.mint(address(this), _payout.add(reward));

        FERs[_feo] = FERs[_feo].add(reward); // front end operator reward

        Bond memory bondInfo = bonderInfo[_bonder][_bid];
        bonderInfo[_bonder][_bid] = Bond({
            principal: _principal,
            principalPaid: bondInfo.principalPaid + _principalPaid,
            payout: bondInfo.payout + sQUAS.toG(_payout),
            bonded: bondInfo.bonded + _payout,
            vested: _expires,
            created: block.timestamp,
            redeemed: 0
        });

        QUAS.approve(address(staking), _payout);
        staking.stake(address(this), _payout, false, true, true);
    }

    /* ========== INTERACTABLE FUNCTIONS ========== */

    /**
     *  @notice redeem bond for user
     *  @param _bonder address
     *  @param _bid uint256
     *  @param _unstake bool
     */
    function redeem(address _bonder, uint256 _bid, bool _unstake) public override {
        (,,uint256 payout,) = payoutInfo(_bonder, _bid);
        if (payout != 0) {
            delete bonderInfo[_bonder][_bid];
            emit Redeemed(_bonder, payout);
            if (_unstake) {
                payUnstaked(_bonder, payout);
            } else {
                payStaked(_bonder, payout);
            }
        }
    }

    // pay reward to front end operator
    function getReward() external override {
        uint256 reward = FERs[msg.sender];
        FERs[msg.sender] = 0;
        QUAS.safeTransfer(msg.sender, reward);
    }

    /* ========== OWNABLE FUNCTIONS ========== */

    // set reward for front end operator (4 decimals. 100 = 1%)
    function setFEReward(uint256 reward) external override onlyPolicy {
        feReward = reward;
    }

    /* ========== INTERNAL FUNCTIONS ========== */

    /**
     *  @notice send payout
     *  @param _amount uint256
     */
    function payUnstaked(address _bonder, uint256 _amount) internal {
        sQUAS.approve(address(staking), _amount);
        staking.unstake(address(this), _amount, false, true);
        QUAS.safeTransfer(_bonder, _amount);
    }

    /**
     *  @notice send payout
     *  @param _amount uint256
     */
    function payStaked(address _bonder, uint256 _amount) internal {
        sQUAS.safeTransfer(_bonder, _amount);
    }

    /* ========== VIEW FUNCTIONS ========== */

    // PAYOUT

    /**
     * @notice calculate amount of QUAS available for claim for single bond
     * @param _bonder address
     * @param _bid uint256
     * @return lockedPayout uint256, lockedStakingRewards uint256, pendingPayout uint256, pendingStakingRewards uint256
     */
    function payoutInfo(address _bonder, uint256 _bid) public view override 
        returns (uint256 lockedPayout, uint256 lockedStakingRewards, uint256 pendingPayout, uint256 pendingStakingRewards) {

        uint256 gpayout = bonderInfo[_bonder][_bid].payout;
        uint256 bonded = bonderInfo[_bonder][_bid].bonded;
        uint256 payout = sQUAS.fromG(gpayout);
        uint256 stakingRewards;
        if (bonded < payout) {
            stakingRewards = payout.sub(bonded);
        }

        if (bonderInfo[_bonder][_bid].redeemed == 0 && 
            bonderInfo[_bonder][_bid].vested <= block.timestamp) {
            pendingPayout = payout;
            pendingStakingRewards = stakingRewards;
        } else {
            lockedPayout = payout;
            lockedStakingRewards = stakingRewards;
        }
    }

    // VESTING

    /**
     * @notice calculate how far into vesting a depositor is
     * @param _bonder address
     * @param _bid uint256
     * @return percentVested_ uint256
     */
    function percentVestedFor(address _bonder, uint256 _bid) public view override returns (uint256 percentVested_) {
        Bond memory bond = bonderInfo[_bonder][_bid];

        uint256 timeSince = block.timestamp.sub(bond.created);
        uint256 term = bond.vested.sub(bond.created);

        percentVested_ = timeSince.mul(1e9).div(term);
    }
}
