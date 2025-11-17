// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PaymentRequest
 * @author Crypto Payment Widget Team
 * @notice Invoice/request system for soliciting payments
 */
contract PaymentRequest is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum RequestStatus { Pending, Paid, Cancelled, Expired }

    struct Request {
        address requester;
        address payer;
        address token;
        uint256 amount;
        string description;
        uint256 dueDate;
        RequestStatus status;
    }

    mapping(bytes32 => Request) public requests;
    mapping(address => bytes32[]) public requesterRequests;
    mapping(address => bytes32[]) public payerRequests;
    uint256 public requestCount;

    event RequestCreated(bytes32 indexed requestId, address indexed requester, address indexed payer, uint256 amount);
    event RequestPaid(bytes32 indexed requestId, address indexed payer);
    event RequestCancelled(bytes32 indexed requestId);

    function createRequest(
        address payer,
        address token,
        uint256 amount,
        string calldata description,
        uint256 dueDate
    ) external returns (bytes32) {
        bytes32 requestId = keccak256(abi.encodePacked(
            msg.sender, payer, amount, block.timestamp, requestCount++
        ));

        requests[requestId] = Request({
            requester: msg.sender,
            payer: payer,
            token: token,
            amount: amount,
            description: description,
            dueDate: dueDate,
            status: RequestStatus.Pending
        });

        requesterRequests[msg.sender].push(requestId);
        payerRequests[payer].push(requestId);

        emit RequestCreated(requestId, msg.sender, payer, amount);
        return requestId;
    }

    function payRequest(bytes32 requestId) external payable nonReentrant {
        Request storage request = requests[requestId];
        require(request.status == RequestStatus.Pending, "Not pending");
        require(msg.sender == request.payer || request.payer == address(0), "Not authorized");

        request.status = RequestStatus.Paid;

        if (request.token == address(0)) {
            require(msg.value == request.amount, "Incorrect ETH");
            (bool success, ) = request.requester.call{value: request.amount}("");
            require(success, "Transfer failed");
        } else {
            IERC20(request.token).safeTransferFrom(msg.sender, request.requester, request.amount);
        }

        emit RequestPaid(requestId, msg.sender);
    }

    function cancelRequest(bytes32 requestId) external {
        Request storage request = requests[requestId];
        require(msg.sender == request.requester, "Not requester");
        require(request.status == RequestStatus.Pending, "Not pending");
        
        request.status = RequestStatus.Cancelled;
        emit RequestCancelled(requestId);
    }

    function getRequest(bytes32 requestId) external view returns (Request memory) {
        return requests[requestId];
    }

    receive() external payable {}
}

