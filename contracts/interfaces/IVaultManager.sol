// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.7.6;

interface IVaultManager {
    function rebalance() external;

    function shouldRebalance() external view returns (bool);
}
