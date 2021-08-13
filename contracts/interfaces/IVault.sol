// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.7.6;

// interface for Vault
// we have deposit and withdraw functions, some events
interface IVault {
    function deposit(
        uint256,
        uint256,
        uint256,
        uint256,
        address
    )
        external
        returns (
            uint256,
            uint256,
            uint256
        );

    function withdraw(
        uint256,
        uint256,
        uint256,
        address
    ) external returns (uint256, uint256);

    function rebalance(
        int256 swapAmount,
        uint160 sqrtPriceLimitX96,
        int24 _baseLower,
        int24 _baseUpper,
        int24 _bidLower,
        int24 _bidUpper,
        int24 _askLower,
        int24 _askUpper
    ) external;

    function getTotalAmounts() external view returns (uint256, uint256);
}
