//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; 
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol"; 
import "hardhat/console.sol";

import "./interfaces/IUniswapV2Exchange.sol";
import "./interfaces/IUniswapV2Router.sol";
import "./interfaces/IUniswapV2Factory.sol";
import "./interfaces/IWETH.sol";
import "./interfaces/IBalancerRegistry.sol";
import "./interfaces/IBalancerPool.sol";


contract SwapperV1 is Initializable, AccessControlUpgradeable, UUPSUpgradeable{

    /// @notice declaration of variables

    using Counters for Counters.Counter;
    uint256 public commission;  
    Counters.Counter private _itemIds; 
    address public target_account;
    address public _owner;


    using SafeMath for uint256;
    using UniswapV2ExchangeLib for IUniswapV2Exchange;


    IUniswapV2Factory internal constant factory =
        IUniswapV2Factory(0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f);

    IWETH internal constant WETH =
        IWETH(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

    // Receives 0.1% of the total ETH used for swaps
    address public feeRecipient;

    // fee charged, initializes in 0.1%
    uint256 public fee;



    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");



    /// @notice events

    event exchange(
        string,
        address[]  tokens, 
        uint256[]  distribution
    );
   

    /// @notice contract initialization

    function initialize(address _feeRecipient, uint256 _fee) public initializer {

        require(_feeRecipient != address(0));
        require(_fee > 0);
        feeRecipient = _feeRecipient;
        fee = _fee;


        __AccessControl_init();
        __UUPSUpgradeable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        
        
    }

    function _authorizeUpgrade(address newAuthorize) internal onlyRole(UPGRADER_ROLE) override{}


     /**
    @notice make a swap using uniswap
   */
    function _swapUniswap(
        IERC20 fromToken,
        IERC20 destToken,
        uint256 amount
    ) internal returns (uint256 returnAmount) {
        require(fromToken != destToken, "SAME_TOKEN");
        require(amount > 0, "ZERO-AMOUNT");

        IUniswapV2Exchange exchange = factory.getPair(fromToken, destToken);
        returnAmount = exchange.getReturn(fromToken, destToken, amount);

        fromToken.transfer(address(exchange), amount);

        if (
            uint256(uint160(address(fromToken))) <
            uint256(uint160(address(destToken)))
        ) {
            exchange.swap(0, returnAmount, msg.sender, "");
        } else {
            exchange.swap(returnAmount, 0, msg.sender, "");
        }
    }

    /**
    @notice swap ETH for multiple tokens according to distribution %
    @dev tokens length should be equal to distribution length
    @dev msg.value will be completely converted to tokens
    @param tokens array of tokens to swap to
    @param distribution array of % amount to convert eth from (3054 = 30.54%)
   */
    function swap(address[] memory tokens, uint256[] memory distribution)
        external
        payable
    {
        require(msg.value > 0);
        require(tokens.length == distribution.length);

        // Calculate ETH left after subtracting fee
        uint256 afterFee = msg.value.sub(msg.value.mul(fee).div(100000));

        // Wrap all ether that is going to be used in the swap
        WETH.deposit{value: afterFee}();
        emit exchange("exchange",tokens,distribution);

        for (uint256 i = 0; i < tokens.length; i++) {
            _swapUniswap(
                WETH,
                IERC20(tokens[i]),
                afterFee.mul(distribution[i]).div(10000)
            );
        }

        // Send remaining ETH to fee recipient
        payable(feeRecipient).transfer(address(this).balance);
    }





}

