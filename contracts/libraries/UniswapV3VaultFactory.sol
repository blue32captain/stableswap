// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.7.6;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
// import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/libraries/TickMath.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

import "./UniswapV3Vault.sol";

contract UniswapV3VaultFactory is Ownable {
    IUniswapV3Factory public uniswapV3Factory;
    mapping(address => mapping(address => mapping(uint24 => address)))
        public getUniswapV3Vaults;

    address[] private allUniswapV3Vaults;

    /// @dev Emitted when a new UniswapV3Vault is initiated.
    /// @param firstToken the token address 1
    /// @param secondToken the token address 2
    /// @param fee transaction fee
    /// @param uniswapV3Vault the UniswapV3Vault address
    event UniswapV3VaultsInitiated(
        address firstToken,
        address secondToken,
        uint24 fee,
        address uniswapV3Vault,
        uint256
    );

    constructor(address _uniswapV3Factory) {
        uniswapV3Factory = IUniswapV3Factory(_uniswapV3Factory);
    }

    /// @notice Initiate a new interest token contract
    /// @param tokenA The first token address.
    /// @param tokenB The second token address.
    /// @param fee Transaction fee.
    /// @return uniswapV3Vault The initiated interest token contract
    function initiateUniswapV3Vault(
        address tokenA,
        address tokenB,
        uint24 fee,
        uint256
    ) external onlyOwner returns (address uniswapV3Vault) {
        require(tokenA != tokenB, "Address is identical!");
        address firstToken = tokenA < tokenB ? tokenA : tokenB;
        address secondToken = tokenA < tokenB ? tokenB : tokenA;

        int24 tickSpacing = uniswapV3Factory.feeAmountTickSpacing(fee);
        require(tickSpacing != 0, "Fee can not be zero!");

        require(firstToken != address(0), "Address can not be zero!");

        require(
            getUniswapV3Vaults[firstToken][secondToken][fee] == address(0),
            "UniswapV3Vault already existing!"
        );

        address pool = uniswapV3Factory.getPool(firstToken, secondToken, fee);
        /// If pool is empty, then create a new pool
        if (pool == address(0)) {
            pool = uniswapV3Factory.createPool(firstToken, secondToken, fee);
        }
        /// Initiate new vault
        // uniswapV3Vault = address(
        //     new UniswapV3Vault{salt: keccak256(abi.encodePacked(firstToken, secondToken, fee, tickSpacing))}(pool, owner())
        // );

        /// Update uniswapV3Vault and push to array - allUniswapV3Vaults that contains the whole vaults.
        getUniswapV3Vaults[firstToken][secondToken][fee] = uniswapV3Vault;
        getUniswapV3Vaults[secondToken][firstToken][fee] = uniswapV3Vault;
        allUniswapV3Vaults.push(uniswapV3Vault);

        /// Trigger event for notifying new vault is initiated
        emit UniswapV3VaultsInitiated(
            firstToken,
            secondToken,
            fee,
            uniswapV3Vault,
            allUniswapV3Vaults.length
        );

        return uniswapV3Vault;
    }

    function getAllUniswapV3Vaults() external view returns (address[] memory) {
        return allUniswapV3Vaults;
    }
}
