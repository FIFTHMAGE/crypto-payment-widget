// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PaymentRouter
 * @author Crypto Payment Widget Team  
 * @notice Routes payments with optional token swaps
 * @dev Integrates with DEX for automatic token conversion
 */
contract PaymentRouter is ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public immutable wethAddress;
    mapping(address => bool) public trustedDexes;
    address public owner;

    event PaymentRouted(
        address indexed sender,
        address indexed recipient,
        address inputToken,
        address outputToken,
        uint256 inputAmount,
        uint256 outputAmount
    );

    event DexAdded(address indexed dex);
    event DexRemoved(address indexed dex);

    error Unauthorized();
    error InvalidDex(address dex);
    error SwapFailed();
    error InvalidAmount();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor(address weth_) {
        owner = msg.sender;
        wethAddress = weth_;
    }

    /**
     * @notice Route payment with optional swap
     * @param recipient Payment recipient
     * @param inputToken Input token address
     * @param outputToken Desired output token
     * @param amount Input amount
     * @param dex DEX router address for swap
     * @param swapData Encoded swap call data
     * @return outputAmount Amount received after swap
     */
    function routePayment(
        address recipient,
        address inputToken,
        address outputToken,
        uint256 amount,
        address dex,
        bytes calldata swapData
    ) external payable nonReentrant returns (uint256 outputAmount) {
        if (amount == 0) revert InvalidAmount();
        
        if (inputToken == outputToken) {
            // No swap needed - direct transfer
            if (inputToken == address(0)) {
                require(msg.value == amount, "Incorrect ETH");
                _transferETH(recipient, amount);
            } else {
                IERC20(inputToken).safeTransferFrom(msg.sender, recipient, amount);
            }
            emit PaymentRouted(msg.sender, recipient, inputToken, outputToken, amount, amount);
            return amount;
        }

        // Swap required
        if (!trustedDexes[dex]) revert InvalidDex(dex);

        uint256 balanceBefore;
        if (outputToken == address(0)) {
            balanceBefore = address(this).balance;
        } else {
            balanceBefore = IERC20(outputToken).balanceOf(address(this));
        }

        if (inputToken == address(0)) {
            require(msg.value == amount, "Incorrect ETH");
            (bool success, ) = dex.call{value: amount}(swapData);
            if (!success) revert SwapFailed();
        } else {
            IERC20(inputToken).safeTransferFrom(msg.sender, address(this), amount);
            IERC20(inputToken).safeApprove(dex, amount);
            (bool success, ) = dex.call(swapData);
            if (!success) revert SwapFailed();
        }

        if (outputToken == address(0)) {
            outputAmount = address(this).balance - balanceBefore;
            _transferETH(recipient, outputAmount);
        } else {
            outputAmount = IERC20(outputToken).balanceOf(address(this)) - balanceBefore;
            IERC20(outputToken).safeTransfer(recipient, outputAmount);
        }

        emit PaymentRouted(msg.sender, recipient, inputToken, outputToken, amount, outputAmount);
        return outputAmount;
    }

    /**
     * @notice Add trusted DEX
     * @param dex DEX router address
     */
    function addDex(address dex) external onlyOwner {
        trustedDexes[dex] = true;
        emit DexAdded(dex);
    }

    /**
     * @notice Remove trusted DEX
     * @param dex DEX router address
     */
    function removeDex(address dex) external onlyOwner {
        trustedDexes[dex] = false;
        emit DexRemoved(dex);
    }

    function _transferETH(address to, uint256 amount) private {
        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH transfer failed");
    }

    receive() external payable {}
}

