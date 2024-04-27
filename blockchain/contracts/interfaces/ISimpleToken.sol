// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;


interface ISimpleToken {
    function mint(address account, uint256 amount) external;
    function burn(address account, uint256 amount) external;
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function totalShares() external view returns (uint256);
    function sharesOf(address account) external view returns (uint256);
}
