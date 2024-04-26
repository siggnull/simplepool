// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ISimplePool.sol";


contract SimpleToken is Ownable, ERC20 {
    ISimplePool pool;

    constructor(ISimplePool _pool) Ownable(address(_pool)) ERC20("Simple Token", "STK") {
        pool = _pool;
    }

    function mint(address _account, uint256 _amount) public onlyOwner {
        _mint(_account, _amount);
    }

    function burn(address _account, uint256 _amount) public onlyOwner {
        _burn(_account, _amount);
    }

    function totalShares() public view returns (uint256) {
        return super.totalSupply();
    }

    function sharesOf(address _account) public view returns (uint256) {
        return super.balanceOf(_account);
    }

    function totalSupply() public view override returns (uint256) {
        return pool.poolTotalSupply();
    }

    function balanceOf(address _account) public view override returns (uint256) {
        return pool.poolBalanceOf(_account);
    }
}
