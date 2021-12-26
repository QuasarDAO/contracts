// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../common/PolicyOwnable.sol";
import "../common/FixedPoint.sol";
import "../common/SafeMath.sol";
import "../common/ITreasury.sol";
import "../common/IStakingHelper.sol";
import "../common/IStaking.sol";
import "../common/IBondingCalculator.sol";
import "./IERC721.sol";
import "./BondingVault.sol";

contract QuasarIDOBondDepository is PolicyOwnable {

    using FixedPoint for *;
    using SafeERC20 for IERC20;
    using SafeMath for uint;


    /* ======== EVENTS ======== */

    event BondCreated( uint deposit, uint indexed payout, uint indexed expires, uint indexed priceInUSD );
    event BondRedeemed( address indexed recipient, uint payout, uint stakingProfit );




    /* ======== STATE VARIABLES ======== */

    address public immutable QUAS; // token given as payment for bond
    address public immutable sQUAS; // staked 
    address public immutable idoAccessNft; // nft gives access to IDO
    address public immutable principle; // token used to create bond
    address public immutable treasury; // mints QUAS when receives principle
    address public immutable team; // receives profit share from bond

    address public staking; // to auto-stake payout
    address public stakingHelper; // to stake and claim if no staking warmup
    bool public useHelper;

    bool public isOpen; // toggle bond sales

    Terms public terms; // stores terms for new bonds

    mapping( address => Bond ) public bondInfo; // stores bond information for depositors



    /* ======== STRUCTS ======== */

    // Info for creating new bonds
    struct Terms {
        bool initialized;
        uint price; // static price of QUAS
        uint priceInUSD; // static price of QUAS in USD (10000 = 100$)
        uint maxPurchase; // in QUAS
        uint fee; // as % of bond payout, in hundreths. ( 500 = 5% = 0.05 for every 1 paid)
        uint vestingTerm; // in seconds
    }

    // Info for bond holder
    struct Bond {
        uint payout; // QUAS remaining to be paid
        uint lastTime; // Last interaction
        uint vesting; // Seconds left to vest
        bool redeemed; // if bond has been redeemed
        uint redeemedAmount; // amount of QUAS redeemed 
        address vault; // store sQUAS in the vault to earn staking rewards
    }




    /* ======== INITIALIZATION ======== */

    constructor ( 
        address _QUAS,
        address _sQUAS,
        address _nft,
        address _principle,
        address _treasury, 
        address _team
    ) {
        require( _QUAS != address(0) );
        QUAS = _QUAS;
        require( _sQUAS != address(0) );
        sQUAS = _sQUAS;
        require( _nft != address(0) );
        idoAccessNft = _nft;
        require( _principle != address(0) );
        principle = _principle;
        require( _treasury != address(0) );
        treasury = _treasury;
        require( _team != address(0) );
        team = _team;
    }

    /**
     *  @notice initializes bond parameters
     *  @param _price uint
     *  @param _priceInUSD uint
     *  @param _maxPurchase uint
     *  @param _fee uint
     *  @param _vestingTerm uint
     */
    function initializeBondTerms( 
        uint _price,
        uint _priceInUSD,
        uint _maxPurchase,
        uint _fee,
        uint _vestingTerm
    ) external onlyPolicy() {
        require( terms.initialized == false, "Bond can be initialized only ones" );
        terms = Terms ({
            initialized: true,
            price: _price,
            priceInUSD: _priceInUSD,
            maxPurchase: _maxPurchase,
            fee: _fee,
            vestingTerm: _vestingTerm
        });
    }

    /**
     *  @notice set contract for auto stake
     *  @param _staking address
     *  @param _helper bool
     */
    function setStaking( address _staking, bool _helper ) external onlyPolicy() {
        require( _staking != address(0) );
        if ( _helper ) {
            useHelper = true;
            stakingHelper = _staking;
        } else {
            useHelper = false;
            staking = _staking;
        }
    }

    /**
     * @notice toggles isOpen flag
     */
    function toggleIsOpen() external onlyPolicy() {
        isOpen = !isOpen;
    }




    /* ======== USER FUNCTIONS ======== */

    /**
     *  @notice deposit bond
     *  @param _amount uint
     *  @param _depositor address
     *  @return uint
     */
    function deposit( 
        uint _amount, 
        address _depositor
    ) external returns ( uint ) {
        require( _depositor != address(0), "Invalid address" );
        require( isOpen == true, 'IDO is closed');

        // check the depositor has IDO access NFT
        require(hasAccessToIDO(_depositor), "No access" );
        
        uint value = ITreasury( treasury ).valueOf( principle, _amount );
        uint payout = payoutFor( value ); // payout to bonder is computed

        require( payout <= maxPayout( _depositor ), "Max payout exceeded"); 
        require( payout >= 10000000, "Bond too small" ); // must be > 0.01 QUAS ( underflow protection )

        // profits are calculated
        uint fee = payout.mul( terms.fee ).div( 10000 );
        uint profit = value.sub( payout ).sub( fee );

        /**
            principle is transferred in
            approved and
            deposited into the treasury, returning (_amount - profit) QUAS
         */
        IERC20( principle ).safeTransferFrom( msg.sender, address(this), _amount );
        IERC20( principle ).approve( address( treasury ), _amount );
        ITreasury( treasury ).deposit( _amount, principle, profit );
        
        if ( fee != 0 ) { // fee is transferred to team 
            IERC20( QUAS ).safeTransfer( team, fee ); 
        }

        // exchange QUAS for sQUAS
        stakeOrSend( address(this), true, payout );

        address vaultAddress;
        uint lastTime = bondInfo[ _depositor ].lastTime;
        if (lastTime == 0) {
            // create new vault if bond is created
            BondingVault vault = new BondingVault( sQUAS );
            vaultAddress = address( vault );
        } else {
            // use existing vault if bond is updated
            vaultAddress = bondInfo[ _depositor ].vault;
        }

        // deposit squas to the vault
        IERC20 ( sQUAS ).safeTransfer( vaultAddress, payout );
        updateBondInfo( _depositor, payout, vaultAddress);

        // indexed events are emitted
        emit BondCreated( _amount, payout, block.timestamp.add( terms.vestingTerm ), bondPriceInUSD() );

        return payout; 
    }

    /** 
     *  @notice redeem bond for user
     *  @param _recipient address
     *  @param _stake bool
     *  @return uint
     */ 
    function redeem( address payable _recipient, bool _stake ) external returns ( uint ) {        
        Bond memory info = bondInfo[ _recipient ];

        if ( canRedeem( _recipient ) ) {
            // redeem from the vault and unstake
            address vaultAddress = bondInfo[ _recipient ].vault;
            uint redeemed = IBondingVault( vaultAddress ).redeem();
            IERC20( sQUAS ).approve( staking, redeemed );
            IStaking( staking ).unstake( redeemed, false );

            // mark bond as redeemed
            bondInfo[ _recipient ].redeemed = true;
            bondInfo[ _recipient ].redeemedAmount = redeemed;

            // calculate staking rewards
            uint stakingProfit = redeemed - info.payout;
            emit BondRedeemed( _recipient, info.payout, stakingProfit ); // emit bond data

            // destroy contract to safe some gas
            IBondingVault( vaultAddress ).destroy( _recipient );

            return stakeOrSend( _recipient, _stake, redeemed ); // pay user everything due
        } else {
            return 0;
        }
    }

    /* ======== INTERNAL HELPER FUNCTIONS ======== */

    /**
     *  @notice allow user to stake payout automatically
     *  @param _stake bool
     *  @param _amount uint
     *  @return uint
     */
    function stakeOrSend( address _recipient, bool _stake, uint _amount ) internal returns ( uint ) {
        if ( !_stake ) { // if user does not want to stake
            IERC20( QUAS ).transfer( _recipient, _amount ); // send payout
        } else { // if user wants to stake
            if ( useHelper ) { // use if staking warmup is 0
                IERC20( QUAS ).approve( stakingHelper, _amount );
                IStakingHelper( stakingHelper ).stake( _amount, _recipient );
            } else {
                IERC20( QUAS ).approve( staking, _amount );
                IStaking( staking ).stake( _amount, _recipient );
            }
        }
        return _amount;
    }

    /**
     *  @notice calculate interest due for new bond
     *  @param _value uint
     *  @return uint
     */
    function payoutFor( uint _value ) public view returns ( uint ) {
        return FixedPoint.fraction( _value, bondPrice() ).decode112with18().div( 1e16 );
    }

    /**
     *  @notice calculate current bond premium
     *  @return price_ uint
     */
    function bondPrice() public view returns ( uint ) {        
        return terms.price;
    }

    /**
     *  @notice converts bond price to DAI value
     *  @return price_ uint
     */
    function bondPriceInUSD() public view returns ( uint ) {
        return terms.priceInUSD;
    }

    /**
     *  @notice determine maximum bond size
     *  @return uint
     */
    function maxPayout(address _depositor) public view returns ( uint ) {
        uint payout = bondInfo[ _depositor ].payout;
        bool redeemed = bondInfo[ _depositor ].redeemed;
        if (payout <= terms.maxPurchase && !redeemed && hasAccessToIDO(_depositor)) {
            return terms.maxPurchase - bondInfo[ _depositor ].payout;
        } else {
            return 0;
        }
    }

    /**
     *  @notice calculate how far into vesting a depositor is
     *  @param _depositor address
     *  @return percentVested_ uint
     */
    function percentVestedFor( address _depositor ) public view returns ( uint percentVested_ ) {
        Bond memory bond = bondInfo[ _depositor ];
        uint secondsSinceLast = uint(block.timestamp).sub( bond.lastTime );
        uint vesting = bond.vesting;

        if ( vesting > 0 ) {
            percentVested_ = secondsSinceLast.mul( 10000 ).div( vesting );
        } else {
            percentVested_ = 0;
        }
    }

    /**
     *  @notice calculate amount of QUAS available for claim by depositor
     *  @param _depositor address
     *  @return pendingPayout_ uint
     */
    function pendingPayoutFor( address _depositor ) external view returns ( uint pendingPayout_ ) {
        if ( canRedeem( _depositor ) ) {
            pendingPayout_ = vaultBalance( _depositor );
        } else {
            pendingPayout_ = 0;
        }
    }

    /**
     * @notice checks if depostir can redeem QUAS
     * @param _depositor address
     * @return bool
     */
    function canRedeem( address _depositor ) public view returns ( bool ) {
        Bond memory bond = bondInfo[ _depositor ];
        bool redeemed = bond.redeemed;
        return !redeemed && percentVestedFor( _depositor ) >= 10000;
    }

    /**
     * @notice returns balance of the depositor's bonding vault (purchased + staking rewards)
     * @param _depositor address
     * @return balance_ uint
     */
    function vaultBalance( address _depositor ) public view returns ( uint balance_ ) {
        Bond memory bond = bondInfo[ _depositor ];
        bool redeemed = bond.redeemed;
        uint lastTime = bond.lastTime;

        if (!redeemed &&  lastTime != 0) {
            address vaultAddress = bond.vault;
            balance_ = IERC20( sQUAS ).balanceOf( vaultAddress );
        } else {
            balance_ = 0;
        }
    }

    /**
     * @notice returns if _depositor has IDO access NFT on his balance
     * @param _depositor address
     * @return bool
     */
    function hasAccessToIDO( address _depositor ) public view returns (bool) {
        return IERC721 ( idoAccessNft ).balanceOf(_depositor) >= 1;
    }

    /**
     * @notice creates or updates depositor's bond information
     * @param _depositor address
     * @param _payout uint
     * @param _vault address
     */
    function updateBondInfo( address _depositor, uint _payout, address _vault) internal {
        bondInfo[ _depositor ] = Bond({ 
            payout: bondInfo[ _depositor ].payout.add( _payout ),
            vesting: terms.vestingTerm,
            lastTime: uint(block.timestamp),
            redeemed: false,
            redeemedAmount: 0,
            vault: _vault
        });
    }

}
