// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./SimpleToken.sol";


contract SimplePool {
    uint totalPooled = 0;
    ERC20 token;

    error InsufficientLiquidity();
    error UnableToWithdraw();

    constructor() {
        token = SimpleToken();
    }

    function deposit() external payable {
        share = _shareForDepositAmount(msg.value);

        token.mint(msg.sender, share);
    }

    function withdraw(uint _amount) external {
        if (token.balanceOf(msg.sender) < _amount) {
            revert InsufficientLiquidity();
        }

        uint share = _shareForWithdrawalAmount(_amount);

        token.burn(msg.sender, share);

        (bool sent, ) = msg.sender.call{value: _amount}("");
        if (!sent) {
            revert UnableToWithdraw();
        }
    }

    function reward() external payable {
        totalPooled += msg.value;
    }

    function _shareForDepositAmount(uint _amount) returns uint {
        if (totalPooled == 0) {
            return _amount;
        }

        return _amount / totalPooled;
    }

    function _shareForWithdrawalAmount(uint _amount) returns uint {
        if (totalPooled == 0) {
            return 0;
        }

        // make small rounding errors favor the protocol rather than the user
        return (_amount * token.totalSupply() + totalPooled - 1) / totalPooled;
    }

    receive() external payable {
        totalPooled += msg.value;
    }
}
