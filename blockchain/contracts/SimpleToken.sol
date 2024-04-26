// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ISimplePool.sol";


contract SimpleToken is Ownable, ERC20 {
    ISimplePool private _pool;

    constructor(ISimplePool pool) Ownable(address(_pool)) ERC20("Simple Token", "STK") {
        _pool = pool;
    }

    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public onlyOwner {
        _burn(account, amount);
    }

    function totalShares() public view returns (uint256) {
        return super.totalSupply();
    }

    function sharesOf(address account) public view returns (uint256) {
        return super.balanceOf(account);
    }

    function totalSupply() public view override returns (uint256) {
        return _pool.totalSupply();
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _pool.balanceOf(account);
    }
}
