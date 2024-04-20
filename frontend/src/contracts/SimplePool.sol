// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


struct BalanceChange {
    uint timestamp;
    int8 sign;
    uint amount;
}

contract SimplePool {
    // map addresses to balance changes
    mapping(address => BalanceChange[]) balanceChanges;

    function change(address addr, uint timestamp, int8 sign, uint amount) private {
        balanceChanges[addr].push(BalanceChange({timestamp: timestamp, sign: sign, amount: amount}));
    }

    // get balance for an address
    function getBalance(address addr) public view returns (int result) {
        if (balanceChanges[addr].length > 0) {
            for (uint i = 0; i < balanceChanges[addr].length; i++) {
                if (balanceChanges[addr][i].sign > 0) {
                    result += int(balanceChanges[addr][i].amount);
                }
                else {
                    result -= int(balanceChanges[addr][i].amount);
                }
            }
        }

        return 0;
    }

    // deposit function to add positive balance changes
    function deposit() public payable {
        change(msg.sender, block.timestamp, 1, msg.value);
    }

    // withdraw function to add negative balance changes
    function withdraw(uint amount) public payable {
        // check balance
        if (getBalance(msg.sender) < int(amount)) {
            revert("Not enough balance");
        }

        change(msg.sender, block.timestamp, -1, amount);

        payable(msg.sender).transfer(amount);
    }
}
