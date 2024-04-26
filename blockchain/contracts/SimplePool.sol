// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./interfaces/ISimplePool.sol";
import "./SimpleToken.sol";


contract SimplePool is ISimplePool {
    uint256 totalPooled = 0;
    SimpleToken token;

    error InsufficientLiquidity();
    error UnableToWithdraw();

    constructor() {
        token = new SimpleToken(this);
    }

    function deposit() external payable {
        uint256 share = _shareForDepositAmount(msg.value);

        token.mint(msg.sender, share);
    }

    function withdraw(uint256 _amount) external {
        if (token.balanceOf(msg.sender) < _amount) {
            revert InsufficientLiquidity();
        }

        uint256 share = _shareForWithdrawalAmount(_amount);

        token.burn(msg.sender, share);

        (bool sent, ) = msg.sender.call{value: _amount}("");
        if (!sent) {
            revert UnableToWithdraw();
        }
    }

    function reward() external payable {
        totalPooled += msg.value;
    }

    function _shareForDepositAmount(uint256 _amount) internal view returns (uint256) {
        if (totalPooled == 0) {
            return _amount;
        }

        return _amount / totalPooled;
    }

    function _shareForWithdrawalAmount(uint256 _amount) internal view returns (uint256) {
        if (totalPooled == 0) {
            return 0;
        }

        // make small rounding errors favor the protocol rather than the user
        return (_amount * token.totalSupply() + totalPooled - 1) / totalPooled;
    }

    function poolTotalSupply() external view returns (uint256) {
        return totalPooled;
    }

    function poolBalanceOf(address _user) external view returns (uint256 result) {
        uint256 totalShares = token.totalShares();
        if (totalShares > 0) {
            result = (this.poolTotalSupply() * token.sharesOf(_user)) / totalShares;
        }
    }

    receive() external payable {
        totalPooled += msg.value;
    }
}
