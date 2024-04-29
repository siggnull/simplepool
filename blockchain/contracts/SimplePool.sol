// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ISimplePool.sol";
import "./interfaces/ISimpleToken.sol";


contract SimplePool is ISimplePool, Ownable {
    uint256 private _totalPooled = 0;
    ISimpleToken private _token;

    error InsufficientLiquidity();
    error UnableToWithdraw();
    error NotInitialized();

    modifier requireInitialized() {
        if (address(_token) == address(0)) {
            revert NotInitialized();
        }
        _;
    }

    constructor() Ownable(_msgSender()) {
    }

    function initialize(ISimpleToken token) external onlyOwner {
        _token = token;
    }

    function deposit() external payable requireInitialized {
        uint256 share = _shareForDepositAmount(msg.value, _totalPooled);

        _totalPooled += msg.value;
        _token.mint(msg.sender, share);
    }

    function withdraw(uint256 amount) external requireInitialized {
        uint256 balance = this.balanceOf(msg.sender);
        if (balance < amount) {
            revert InsufficientLiquidity();
        }

        uint256 share = _shareForWithdrawalAmount(amount, _totalPooled);

        _token.burn(msg.sender, share);
        _totalPooled -= amount;

        (bool sent, ) = msg.sender.call{value: amount}("");
        if (!sent) {
            revert UnableToWithdraw();
        }
    }

    function reward() external payable {
        _totalPooled += msg.value;
    }

    function _shareForDepositAmount(uint256 amount, uint256 pooled) private view returns (uint256) {
        if (pooled == 0) {
            return amount;
        }

        return amount * _token.totalShares() / pooled;
    }

    function _shareForWithdrawalAmount(uint256 amount, uint256 pooled) private view returns (uint256) {
        if (pooled == 0) {
            return 0;
        }

        // make small rounding errors favor the protocol rather than the user
        return (amount * _token.totalShares() + pooled - 1) / pooled;
    }

    function totalSupply() external view returns (uint256) {
        return _totalPooled;
    }

    function balanceOf(address account) external view requireInitialized returns (uint256 result) {
        uint256 totalShares = _token.totalShares();
        if (totalShares > 0) {
            result = (_totalPooled * _token.sharesOf(account)) / totalShares;
        }
    }

    receive() external payable {
        _totalPooled += msg.value;
    }
}
