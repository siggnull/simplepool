// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;


interface ISimplePool {
    function poolBalanceOf(address _address) external view returns (uint256);
    function poolTotalSupply() external view returns (uint256);
}
