// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Owned.sol";
import "./Logger.sol";
import "./IFaucet.sol";

contract Faucet is Owned, Logger, IFaucet{
 
    uint public numOfFunders;
    mapping(address => bool) private funders;
    mapping(uint => address) private fundersList;


    modifier limitWithdrawal(uint withdrawAmount) {
        require(withdrawAmount <= 0.1 ether, "You can only withdraw 0.1 ether at a time");
        _;
    }

    receive() external payable {}

    function emitLog() public override pure returns(bytes32){
        return "Hello";
    }
    
    function addFunds() override external payable {
        address funder = msg.sender;
        if (!funders[funder]) {
            uint index = numOfFunders++;
            funders[funder] = true;
            fundersList[index] = funder;
        }
    }

    function withdraw(uint withdrawAmount) override external limitWithdrawal(withdrawAmount){
        payable(msg.sender).transfer(withdrawAmount);
    }

    function getFunderAtIndex(uint index) external view returns (address) {
        return fundersList[index];
    }

    function getAllFunders() external view returns (address[] memory) {
        address[] memory allFunders = new address[](numOfFunders);
        for (uint i = 0; i < numOfFunders; i++) {
            allFunders[i] = fundersList[i];
        }
        return allFunders;
    }
}