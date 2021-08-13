// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DeltafiToken is ERC20 {
    uint256 public constant INITIAL_SUPPLY = 1000000000; // 1 billion

    constructor(address tokenHolder) ERC20("Deltafi Token", "Deltafi") {
        // fund the token swap contract
        _mint(tokenHolder, INITIAL_SUPPLY * 1e18);
    }
}
