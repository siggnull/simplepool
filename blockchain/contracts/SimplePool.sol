// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./interfaces/ISimplePool.sol";
import "./SimpleToken.sol";


contract SimplePool is ISimplePool {
    uint256 private _totalPooled = 0;
    SimpleToken private _token;

    error InsufficientLiquidity();
    error UnableToWithdraw();

    constructor() {
        _token = new SimpleToken(this);
    }

    function deposit() external payable {
        uint256 share = _shareForDepositAmount(msg.value);

        _token.mint(msg.sender, share);
    }

    function withdraw(uint256 amount) external {
        if (_token.balanceOf(msg.sender) < amount) {
            revert InsufficientLiquidity();
        }

        uint256 share = _shareForWithdrawalAmount(amount);

        _token.burn(msg.sender, share);

        (bool sent, ) = msg.sender.call{value: amount}("");
        if (!sent) {
            revert UnableToWithdraw();
        }
    }

    function reward() external payable {
        _totalPooled += msg.value;
    }

    function _shareForDepositAmount(uint256 amount) internal view returns (uint256) {
        if (_totalPooled == 0) {
            return amount;
        }

        return amount / _totalPooled;
    }

    function _shareForWithdrawalAmount(uint256 amount) internal view returns (uint256) {
        if (_totalPooled == 0) {
            return 0;
        }

        // make small rounding errors favor the protocol rather than the user
        return (amount * _token.totalSupply() + _totalPooled - 1) / _totalPooled;
    }

    function poolTotalSupply() external view returns (uint256) {
        return _totalPooled;
    }

    function poolBalanceOf(address _address) external view returns (uint256 result) {
        uint256 totalShares = _token.totalShares();
        if (totalShares > 0) {
            result = (this.poolTotalSupply() * _token.sharesOf(_address)) / totalShares;
        }
    }

    receive() external payable {
        _totalPooled += msg.value;
    }
}
