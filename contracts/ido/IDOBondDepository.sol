// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../types/QuasarAccessControlled.sol";

import "../libraries/SafeMath.sol";
import "../libraries/FixedPoint.sol";
import "../libraries/SafeERC20.sol";

import "../interfaces/ITreasury.sol";
import "../interfaces/IERC20Metadata.sol";
import "../interfaces/ITeller.sol";

contract QuasarIDOBondDepository is QuasarAccessControlled {
    using FixedPoint for *;
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /* ======== EVENTS ======== */

    event CreateBond(
        uint256 bid,
        uint256 amount,
        uint256 payout,
        uint256 expires
    );

    /* ======== DATA STRUCTURES ======== */

    enum STAGE {
        CLOSED, //0
        WHITELIST, //1
        PUBLIC //2
    }

    // Info about each type of bond
    struct Bond {
        uint256 bondId;
        IERC20 principal; // token to accept as payment
        uint256 vestingTerm; // term in seconds (fixed-term)
        uint256 price; // ido price in pretty dollars (10000 = 100$)
        uint256 priceInUSD; // ido price in principal
        uint256 maxPurchase; // max allocation in QUAS
        uint256 capacity; // capacity remaining in QUAS
        uint256 purchased; // in QUAS
        STAGE stage; // current stage of IDO
        bool initialized; // is bond initialized
    }

    /* ======== STATE VARIABLES ======== */

    Bond public bond;

    ITeller public teller; // handles payment

    ITreasury immutable treasury;

    mapping(address => bool) whitelisted;
    mapping(address => uint256) purchased; // in QUAS

    bool killed;

    /* ======== CONSTRUCTOR ======== */

    constructor(
        address _treasury, 
        address _authority
    ) QuasarAccessControlled(IQuasarAuthority(_authority)) {
        require(_treasury != address(0));
        treasury = ITreasury(_treasury);
    }

    /* ======== POLICY FUNCTIONS ======== */

    /**
    * @notice creates a new bond type
    * @param _bondId uint256
    * @param _principal address
    * @param _vestingTerm uint256
    * @param _price uint256
    * @param _priceInUSD uint256
    * @param _maxPurchase uint256
    * @param _capacity uint
    */
    function initializeBond(
        uint256 _bondId,
        address _principal,
        uint256 _vestingTerm,
        uint256 _price,
        uint256 _priceInUSD,
        uint256 _maxPurchase,
        uint256 _capacity
    ) external onlyGuardian {
        require(!bond.initialized, "IDO: already initialized");
        bond = Bond({
            bondId: _bondId,
            principal: IERC20(_principal), 
            vestingTerm: _vestingTerm,
            price: _price,
            priceInUSD: _priceInUSD,
            maxPurchase: _maxPurchase,
            capacity: _capacity,
            purchased: 0,
            stage: STAGE.CLOSED,
            initialized: true
        });
    }

    /**
    * @notice set stage of IDO
    * @param _stage stage
    */
    function setStage(STAGE _stage) external onlyGuardian {
        require(bond.initialized, "Bond is not initialized");
        bond.stage = _stage;
    }

    /**
    * @notice adds addresses to whitelisted array
    * @param _addresses address[]
    * @param _whitelisted bool
    */
    function pushWhitelisted(address[] calldata _addresses, bool _whitelisted) external onlyGuardian {
        for (uint i = 0; i < _addresses.length; i++) {
            whitelisted[_addresses[i]] = _whitelisted;
        }
    }

    /**
    * @notice set teller contract
    * @param _teller address
    */
    function setTeller(address _teller) external onlyGovernor {
        require(address(teller) == address(0));
        require(_teller != address(0));
        teller = ITeller(_teller);
    }

    /**
    * @notice stop deposits forever
    */
    function kill() external onlyGovernor {
        killed = true;
    }

    /* ======== MUTABLE FUNCTIONS ======== */

    /**
    * @notice deposit bond
    * @param _amount uint
    * @param _depositor address
    * @param _feo address
    * @return uint256
    */
    function deposit(
        uint256 _amount,
        address _depositor,
        address _feo
    ) external returns (uint256) {
        require(!killed, "IDO: stopped forever");
        require(_depositor != address(0), "Invalid address");
        require(bond.initialized, "IDO: Not initialized");
        require(bond.stage != STAGE.CLOSED, "IDO: Closed");
        if (bond.stage == STAGE.WHITELIST) {
            require(whitelisted[msg.sender], "IDO: Not whitelisted");
        }

        uint256 value = treasury.tokenValue(address(bond.principal), _amount);
        uint256 payout = payoutFor(value); // payout to bonder is computed

        require(payout >= 10000000, "IDO: Bond too small"); // must be > 0.01 QUAS ( underflow protection )
        require(payout <= maxPayout(msg.sender), "IDO: Max allocation exceeded");

        bond.principal.safeTransferFrom(msg.sender, address(this), _amount); // move funds from sender
        bond.principal.approve(address(treasury), _amount);
        treasury.deposit(_amount, address(bond.principal), value);  // deposit funds to treasury

        uint256 expiration = bond.vestingTerm.add(block.timestamp);

        // user info stored with teller
        teller.newBond(bond.bondId, _depositor, address(bond.principal), _amount, payout, expiration, _feo);

        emit CreateBond(bond.bondId, _amount, payout, expiration);

        purchased[msg.sender] = purchased[msg.sender] + payout;

        return payout;
    }


    /* ======== VIEW FUNCTIONS ======== */

    // PAYOUT

    /**
     *  @notice determine maximum bond size
     *  @return uint
     */
    function maxPayout(address _depositor) public view returns (uint256) {

        uint256 maxPurchase = bond.maxPurchase;
        uint256 bonded = purchased[_depositor];
        uint256 remainingAllocation = maxPurchase.sub(bonded);
        uint256 remainingCapacity = remainingBondCapacity();

        if (bond.stage == STAGE.WHITELIST && whitelisted[_depositor] && remainingCapacity > 0) {
            if (remainingAllocation > remainingCapacity) {
                return remainingCapacity;
            } else {
                return remainingAllocation;
            }
        }
        if (bond.stage == STAGE.PUBLIC) {
            if (remainingAllocation > remainingCapacity) {
                return remainingCapacity;
            } else {
                return remainingAllocation;
            }        
        }
        return 0;
    }

    /**
     * @notice determine remaining bond capacity 
     */
    function remainingBondCapacity() public view returns (uint256) {
        if (bond.capacity < bond.purchased) {
            return 0;
        } else {
            return bond.capacity.sub(bond.purchased);
        }
    }

    /**
     *  @notice calculate interest due for new bond
     *  @param _value uint
     *  @return uint
     */
    function payoutFor(uint256 _value) public view returns (uint256) {
        return FixedPoint.fraction(_value, bondPrice()).decode112with18().div(1e16);
    }

    /**
     *  @notice bond price
     *  @return price_ uint
     */
    function bondPrice() public view returns (uint256) {
        return bond.price;
    }

    /**
     *  @notice bond price in DAI
     *  @return price_ uint
     */
    function bondPriceInUSD() public view returns (uint256) {
        return bond.priceInUSD;
    }
}
