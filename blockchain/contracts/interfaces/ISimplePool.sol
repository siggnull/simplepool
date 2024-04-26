// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;


interface ISimplePool {
    function poolBalanceOf(address _user) external view returns (uint256);
    function poolTotalSupply() public view returns (uint256);
}
