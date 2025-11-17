// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IPaymentProcessor.sol";

/**
 * @title PaymentProcessorUpgradeable
 * @notice Upgradeable payment processor using UUPS proxy pattern
 * @dev Allows for contract upgrades while preserving storage
 */
contract PaymentProcessorUpgradeable is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    IPaymentProcessor
{
    using SafeERC20 for IERC20;

    mapping(bytes32 => Payment) private _payments;
    mapping(bytes32 => EscrowPayment) private _escrowPayments;
    mapping(address => uint256) private _totalReceived;
    mapping(address => uint256) private _totalSent;
    bytes32[] private _paymentIds;

    uint256 private _platformFee;
    uint256 private constant FEE_DENOMINATOR = 10000;
    address private _feeCollector;

    uint256 private _paymentNonce;
    uint256 private _escrowNonce;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize the upgradeable contract
     * @param feeCollector_ Initial fee collector address
     */
    function initialize(address feeCollector_) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        require(feeCollector_ != address(0), "Invalid fee collector");
        _feeCollector = feeCollector_;
        _platformFee = 25;
    }

    /**
     * @dev Authorize upgrade (only owner can upgrade)
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @notice Process a direct payment
     */
    function processPayment(
        address payee,
        address token,
        uint256 amount,
        string calldata metadata
    ) external payable override nonReentrant returns (bytes32) {
        require(payee != address(0), "Invalid payee");
        require(amount > 0, "Invalid amount");

        bytes32 paymentId = _generatePaymentId(msg.sender, payee, amount, _paymentNonce++);

        uint256 fee = (amount * _platformFee) / FEE_DENOMINATOR;
        uint256 netAmount = amount - fee;

        if (token == address(0)) {
            require(msg.value == amount, "Incorrect ETH amount");
            _transferETH(payee, netAmount);
            if (fee > 0) {
                _transferETH(_feeCollector, fee);
            }
        } else {
            IERC20(token).safeTransferFrom(msg.sender, payee, netAmount);
            if (fee > 0) {
                IERC20(token).safeTransferFrom(msg.sender, _feeCollector, fee);
            }
        }

        _payments[paymentId] = Payment({
            payer: msg.sender,
            payee: payee,
            amount: amount,
            token: token,
            timestamp: block.timestamp,
            status: PaymentStatus.Completed,
            metadata: metadata
        });

        _paymentIds.push(paymentId);
        _totalSent[msg.sender] += amount;
        _totalReceived[payee] += amount;

        emit PaymentProcessed(paymentId, msg.sender, payee, amount, token, fee, block.timestamp);
        return paymentId;
    }

    /**
     * @notice Create an escrow payment
     */
    function createEscrow(
        address payee,
        address token,
        uint256 amount,
        uint256 releaseTime,
        string calldata metadata
    ) external payable override nonReentrant returns (bytes32) {
        require(payee != address(0), "Invalid payee");
        require(amount > 0, "Invalid amount");
        require(releaseTime > block.timestamp, "Invalid release time");

        bytes32 escrowId = _generateEscrowId(msg.sender, payee, amount, _escrowNonce++);

        if (token == address(0)) {
            require(msg.value == amount, "Incorrect ETH amount");
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        _escrowPayments[escrowId] = EscrowPayment({
            payer: msg.sender,
            payee: payee,
            amount: amount,
            token: token,
            releaseTime: releaseTime,
            released: false,
            refunded: false,
            metadata: metadata
        });

        emit EscrowCreated(escrowId, msg.sender, payee, amount, releaseTime, token);
        return escrowId;
    }

    /**
     * @notice Release escrow payment
     */
    function releaseEscrow(bytes32 escrowId) external override nonReentrant {
        EscrowPayment storage escrow = _escrowPayments[escrowId];
        require(!escrow.released && !escrow.refunded, "Escrow processed");
        require(
            msg.sender == escrow.payer || block.timestamp >= escrow.releaseTime,
            "Cannot release"
        );

        escrow.released = true;

        uint256 fee = (escrow.amount * _platformFee) / FEE_DENOMINATOR;
        uint256 netAmount = escrow.amount - fee;

        if (escrow.token == address(0)) {
            _transferETH(escrow.payee, netAmount);
            if (fee > 0) {
                _transferETH(_feeCollector, fee);
            }
        } else {
            IERC20(escrow.token).safeTransfer(escrow.payee, netAmount);
            if (fee > 0) {
                IERC20(escrow.token).safeTransfer(_feeCollector, fee);
            }
        }

        emit EscrowReleased(escrowId, escrow.payee, netAmount, fee);
    }

    /**
     * @notice Refund escrow payment
     */
    function refundEscrow(bytes32 escrowId) external override nonReentrant {
        EscrowPayment storage escrow = _escrowPayments[escrowId];
        require(!escrow.released && !escrow.refunded, "Escrow processed");
        require(msg.sender == escrow.payer, "Only payer");

        escrow.refunded = true;

        if (escrow.token == address(0)) {
            _transferETH(escrow.payer, escrow.amount);
        } else {
            IERC20(escrow.token).safeTransfer(escrow.payer, escrow.amount);
        }

        emit EscrowRefunded(escrowId, escrow.payer, escrow.amount);
    }

    /**
     * @notice Split payment among recipients
     */
    function splitPayment(
        address[] calldata recipients,
        uint256[] calldata amounts,
        address token,
        string calldata metadata
    ) external payable override nonReentrant returns (bytes32) {
        require(recipients.length == amounts.length, "Length mismatch");
        require(recipients.length > 0, "Empty array");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            require(amounts[i] > 0, "Invalid amount");
            totalAmount += amounts[i];
        }

        if (token == address(0)) {
            require(msg.value == totalAmount, "Incorrect ETH amount");
        }

        bytes32 paymentId = keccak256(
            abi.encodePacked(msg.sender, recipients, amounts, block.timestamp, _paymentNonce++)
        );

        uint256 totalFees = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 fee = (amounts[i] * _platformFee) / FEE_DENOMINATOR;
            uint256 netAmount = amounts[i] - fee;
            totalFees += fee;

            if (token == address(0)) {
                _transferETH(recipients[i], netAmount);
            } else {
                IERC20(token).safeTransferFrom(msg.sender, recipients[i], netAmount);
            }

            _totalReceived[recipients[i]] += amounts[i];
        }

        if (totalFees > 0) {
            if (token == address(0)) {
                _transferETH(_feeCollector, totalFees);
            } else {
                IERC20(token).safeTransferFrom(msg.sender, _feeCollector, totalFees);
            }
        }

        _totalSent[msg.sender] += totalAmount;
        emit PaymentProcessed(paymentId, msg.sender, address(0), totalAmount, token, totalFees, block.timestamp);
        return paymentId;
    }

    function _transferETH(address to, uint256 amount) private {
        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH transfer failed");
    }

    function _generatePaymentId(
        address payer,
        address payee,
        uint256 amount,
        uint256 nonce
    ) private view returns (bytes32) {
        return keccak256(abi.encodePacked(payer, payee, amount, block.timestamp, nonce));
    }

    function _generateEscrowId(
        address payer,
        address payee,
        uint256 amount,
        uint256 nonce
    ) private view returns (bytes32) {
        return keccak256(abi.encodePacked(payer, payee, amount, block.timestamp, nonce, "escrow"));
    }

    function getPayment(bytes32 paymentId) external view override returns (Payment memory) {
        return _payments[paymentId];
    }

    function getEscrow(bytes32 escrowId) external view override returns (EscrowPayment memory) {
        return _escrowPayments[escrowId];
    }

    function getPaymentCount() external view override returns (uint256) {
        return _paymentIds.length;
    }

    function getVersion() external pure returns (string memory) {
        return "1.0.0";
    }

    receive() external payable {}
}

