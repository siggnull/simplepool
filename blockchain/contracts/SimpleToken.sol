// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ISimplePool.sol";


contract SimpleToken is Ownable, ERC20 {
    ISimplePool private _pool;

    error UnauthorizedAccount(address account);

    modifier whenPool() {
        if (address(_pool) != address(0)) {
            _;
        }
    }

    modifier onlyPool() {
        if (address(_pool) != _msgSender()) {
            revert UnauthorizedAccount(_msgSender());
        }
        _;
    }

    constructor() Ownable(_msgSender()) ERC20("Simple Token", "STK") {
    }

    function setPool(ISimplePool pool) public onlyOwner {
        _pool = pool;
    }

    function mint(address account, uint256 amount) public onlyPool {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public onlyPool {
        _burn(account, amount);
    }

    function totalShares() public view returns (uint256) {
        return super.totalSupply();
    }

    function sharesOf(address account) public view returns (uint256) {
        return super.balanceOf(account);
    }

    function totalSupply() public view override whenPool returns (uint256 result) {
        result = _pool.totalSupply();
    }

    function balanceOf(address account) public view override whenPool returns (uint256 result) {
        result = _pool.balanceOf(account);
    }
}
