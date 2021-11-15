// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./common/SafeMath.sol";
import "./common/SafeERC20.sol";
import "./common/ManagerOwnable.sol";
import "./common/IsQUASERC20.sol";
import "./common/IWarmup.sol";
import "./common/IDistributor.sol";

contract QuasStaking is ManagerOwnable {

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address public immutable QUAS;
    address public immutable sQUAS;

    struct Epoch {
        uint number;
        uint distribute;
        uint length;
        uint endTime;
    }
    Epoch public epoch;

    address public distributor;
    
    address public locker;
    uint public totalBonus;
    
    address public warmupContract;
    uint public warmupPeriod;
    
    constructor ( 
        address _quas, 
        address _squas, 
        uint _epochLength,
        uint _firstEpochNumber,
        uint _firstEpochTime
    ) {
        require( _quas != address(0) );
        QUAS = _quas;
        require( _squas != address(0) );
        sQUAS = _squas;
        
        epoch = Epoch({
            length: _epochLength,
            number: _firstEpochNumber,
            endTime: _firstEpochTime,
            distribute: 0
        });
    }

    struct Claim {
        uint deposit;
        uint gons;
        uint expiry;
        bool lock; // prevents malicious delays
    }
    mapping( address => Claim ) public warmupInfo;

    /**
        @notice stake QUAS to enter warmup
        @param _amount uint
        @return bool
     */
    function stake( uint _amount, address _recipient ) external returns ( bool ) {
        rebase();
        
        IERC20( QUAS ).safeTransferFrom( msg.sender, address(this), _amount );

        Claim memory info = warmupInfo[ _recipient ];
        require( !info.lock, "Deposits for account are locked" );

        warmupInfo[ _recipient ] = Claim ({
            deposit: info.deposit.add( _amount ),
            gons: info.gons.add( IsQUASERC20( sQUAS ).gonsForBalance( _amount ) ),
            expiry: epoch.number.add( warmupPeriod ),
            lock: false
        });
        
        IERC20( sQUAS ).safeTransfer( warmupContract, _amount );
        return true;
    }

    /**
        @notice retrieve sQUAS from warmup
        @param _recipient address
     */
    function claim ( address _recipient ) public {
        Claim memory info = warmupInfo[ _recipient ];
        if ( epoch.number >= info.expiry && info.expiry != 0 ) {
            delete warmupInfo[ _recipient ];
            IWarmup( warmupContract ).retrieve( _recipient, IsQUASERC20( sQUAS ).balanceForGons( info.gons ) );
        }
    }

    /**
        @notice forfeit sQUAS in warmup and retrieve QUAS
     */
    function forfeit() external {
        Claim memory info = warmupInfo[ msg.sender ];
        delete warmupInfo[ msg.sender ];

        IWarmup( warmupContract ).retrieve( address(this), IsQUASERC20( sQUAS ).balanceForGons( info.gons ) );
        IERC20( QUAS ).safeTransfer( msg.sender, info.deposit );
    }

    /**
        @notice prevent new deposits to address (protection from malicious activity)
     */
    function toggleDepositLock() external {
        warmupInfo[ msg.sender ].lock = !warmupInfo[ msg.sender ].lock;
    }

    /**
        @notice redeem sQUAS for QUAS
        @param _amount uint
        @param _trigger bool
     */
    function unstake( uint _amount, bool _trigger ) external {
        if ( _trigger ) {
            rebase();
        }
        IERC20( sQUAS ).safeTransferFrom( msg.sender, address(this), _amount );
        IERC20( QUAS ).safeTransfer( msg.sender, _amount );
    }

    /**
        @notice returns the sQUAS index, which tracks rebase growth
        @return uint
     */
    function index() public view returns ( uint ) {
        return IsQUASERC20( sQUAS ).index();
    }

    /**
        @notice trigger rebase if epoch over
     */
    function rebase() public {
        if( epoch.endTime <= uint(block.timestamp) ) {

            IsQUASERC20( sQUAS ).rebase( epoch.distribute, epoch.number );

            epoch.endTime = epoch.endTime.add( epoch.length );
            epoch.number++;
            
            if ( distributor != address(0) ) {
                IDistributor( distributor ).distribute();
            }

            uint balance = contractBalance();
            uint staked = IsQUASERC20( sQUAS ).circulatingSupply();

            if( balance <= staked ) {
                epoch.distribute = 0;
            } else {
                epoch.distribute = balance.sub( staked );
            }
        }
    }

    /**
        @notice returns contract QUAS holdings, including bonuses provided
        @return uint
     */
    function contractBalance() public view returns ( uint ) {
        return IERC20( QUAS ).balanceOf( address(this) ).add( totalBonus );
    }

    /**
        @notice provide bonus to locked staking contract
        @param _amount uint
     */
    function giveLockBonus( uint _amount ) external {
        require( msg.sender == locker );
        totalBonus = totalBonus.add( _amount );
        IERC20( sQUAS ).safeTransfer( locker, _amount );
    }

    /**
        @notice reclaim bonus from locked staking contract
        @param _amount uint
     */
    function returnLockBonus( uint _amount ) external {
        require( msg.sender == locker );
        totalBonus = totalBonus.sub( _amount );
        IERC20( sQUAS ).safeTransferFrom( locker, address(this), _amount );
    }

    enum CONTRACTS { DISTRIBUTOR, WARMUP, LOCKER }

    /**
        @notice sets the contract address for LP staking
        @param _contract address
     */
    function setContract( CONTRACTS _contract, address _address ) external onlyManager() {
        if( _contract == CONTRACTS.DISTRIBUTOR ) { // 0
            distributor = _address;
        } else if ( _contract == CONTRACTS.WARMUP ) { // 1
            require( warmupContract == address( 0 ), "Warmup cannot be set more than once" );
            warmupContract = _address;
        } else if ( _contract == CONTRACTS.LOCKER ) { // 2
            require( locker == address(0), "Locker cannot be set more than once" );
            locker = _address;
        }
    }
    
    /**
     * @notice set warmup period in epoch's numbers for new stakers
     * @param _warmupPeriod uint
     */
    function setWarmup( uint _warmupPeriod ) external onlyManager() {
        warmupPeriod = _warmupPeriod;
    }
}
