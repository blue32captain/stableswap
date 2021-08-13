## Deltafi

This repository contains the smart contracts for the Deltafi protocol.

## Build and Testing

### 1. Getting Started (Prerequisites)

- [Install npm](https://nodejs.org/en/download/)

### 2. Setup

```bash
npm install
```

### 3. Build

```bash
npm run build
```

### 4. Test

```bash
npm run test
```

### 5. Deploy

## Rinkeby
```bash
npm run rinkeby
```

## Kovan
```bash
npm run kovan
```

## References

### 1. [Development environment tutorial](https://rahulsethuram.medium.com/the-new-solidity-dev-stack-buidler-ethers-waffle-typescript-tutorial-f07917de48ae)

## Common Issues

### 1. (node:72065) Warning: Accessing non-existent property 'INVALID_ALT_NUMBER' of module exports inside circular dependency

It can happen when we run ```bash
npm run build
``` and ```bash
npm run test
```. The solution is to run ```npm update``` first.