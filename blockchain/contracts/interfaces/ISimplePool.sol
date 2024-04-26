// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;


interface ISimplePool {
    function poolBalanceOf(address account) external view returns (uint256);
    function poolTotalSupply() external view returns (uint256);
}
