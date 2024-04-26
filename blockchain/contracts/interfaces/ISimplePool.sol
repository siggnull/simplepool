// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;


interface ISimplePool {
    function balanceOf(address account) external view returns (uint256);
    function totalSupply() external view returns (uint256);
}
