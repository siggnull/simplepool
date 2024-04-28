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
        uint256 share = _shareForDepositAmount(msg.value);

        _token.mint(msg.sender, share);
    }

    function withdraw(uint256 amount) external requireInitialized {
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

    function _shareForDepositAmount(uint256 amount) private view returns (uint256) {
        if (_totalPooled == 0) {
            return amount;
        }

        return amount / _totalPooled;
    }

    function _shareForWithdrawalAmount(uint256 amount) private view returns (uint256) {
        if (_totalPooled == 0) {
            return 0;
        }

        // make small rounding errors favor the protocol rather than the user
        return (amount * _token.totalSupply() + _totalPooled - 1) / _totalPooled;
    }

    function totalSupply() external view returns (uint256) {
        return _totalPooled;
    }

    function balanceOf(address _address) external view requireInitialized returns (uint256 result) {
        uint256 totalShares = _token.totalShares();
        if (totalShares > 0) {
            result = (this.totalSupply() * _token.sharesOf(_address)) / totalShares;
        }
    }

    receive() external payable {
        _totalPooled += msg.value;
    }
}
