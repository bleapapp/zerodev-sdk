# ZeroDev SDK

[![CI Tests](https://github.com/zerodevapp/sdk/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/zerodevapp/sdk/actions/workflows/main.yml)

---

SDK for [ZeroDev](https://docs.zerodev.app/), based on [Kernel](https://github.com/zerodevapp/kernel).

## Getting started

Follow the instructions below to install the packages.

via `yarn`

```bash
yarn add @zerodev/sdk
```

via `npm`

```bash
npm i -s @zerodev/sdk
```

## Example Usage to Interact with [Kernel Accounts](https://github.com/zerodevapp/kernel/blob/main/src/Kernel.sol)

### Basic Usage

```ts
import { ECDSAProvider } from "@zerodev/sdk";
import { LocalAccountSigner } from "@alchemy/aa-core";

// 1. define the EOA owner of the Smart Account
// This is just one exapmle of how to interact with EOAs, feel free to use any other interface
const owner = LocalAccountSigner.privateKeyToAccountSigner(PRIVATE_KEY);

// 2. Create a ZeroDev Provider
let ecdsaProvider = await ECDSAProvider.init({
  projectId, // zeroDev projectId
  owner,
  // Optional: pass the paymasterConfig to use the verifying paymaster
  // opts: {
  //     paymasterConfig: {
  //         policy: "VERIFYING_PAYMASTER"
  //     }
  // }
});

// 3. send a UserOperation
const { hash } = await ecdsaProvider.sendUserOperation({
  target: "0xTargetAddress",
  data: "0xcallData",
  value: 0n, // value: bigint or undefined
});

// 4. Wait for UserOp
const tx = await ecdsaProvider.waitForUserOperationTransaction(
  result.hash as Hex
);
```

### Batch Transactions

```ts
const { hash } = await ecdsaProvider.sendUserOperation([
  {
    target: "0xTargetAddress1",
    data: "0xcallData1",
    value: 0n, // value: bigint or undefined
  },
  {
    target: "0xTargetAddress2",
    data: "0xcallData2",
    value: 0n, // value: bigint or undefined
  },
]);
```

### Optional params for ValidatorProvider:

| Option                                            | Usage                                                                                                              | Type                                     | Default                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- | -------------------------------------------------------------------------------- |
| bundlerProvider                                   | Bundler Provider                                                                                                   | "ALCHEMY", "STACKUP", "PIMLICO"          | "STACKUP"                                                                        |
| usePaymaster                                      | Use paymaster to send userOps                                                                                      | boolean                                  | true                                                                             |
| opts:paymasterConfig:paymasterProvider            | Paymaster Provider                                                                                                 | "ALCHEMY", "STACKUP", "PIMLICO"          | "STACKUP"                                                                        |
| opts:paymasterConfig:onlySendSponsoredTransaction | Only send sponsored transaction and revert if somehow paymaster fails                                              | boolean                                  | false                                                                            |
| opts:paymasterConfig:policy                       | Paymaster policy                                                                                                   | "TOKEN_PAYMASTER", "VERIFYING_PAYMASTER" | "VERIFYING_PAYMASTER"                                                            |
| opts:paymasterConfig:gasToken                     | ERC20 token to use for gas fees in case of "TOKEN_PAYMASTER"                                                       | "USDC", "PEPE", "TEST_ERC20"             | (Required)                                                                       |
| opts:providerConfig:rpcUrl                        | Custom RPC URL for the non-AA calls (e.g. Infura/Alchemy)                                                                              | string                                   | default ZeroDev included urls (should provide your own)                          |
| opts:providerConfig:bundlerRpcUrl                 | Custom RPC URL for the bundler provider                                                                            | string                                   | "https://v0-6-meta-bundler.onrender.com"                                         |
| opts:providerConfig:opts:txMaxRetries             | The maximum number of times to try fetching a transaction receipt before giving up                                 | number                                   | 5                                                                                |
| opts:providerConfig:opts:txRetryIntervalMs        | The interval in milliseconds to wait between retries while waiting for tx receipts                                 | number                                   | 2000                                                                             |
| opts:providerConfig:opts:minPriorityFeePerBid     | used when computing the fees for a user operation                                                                  | bigint                                   | 100_000_000n, [Chain-wise defaults](/packages/core/src/provider/base.ts#L61-L64) |
| opts:providerConfig:opts:sendTxMaxRetries         | The maximum number of times to try sending a transaction before giving up                                          | number                                   | 3                                                                                |
| opts:providerConfig:opts:sendTxRetryIntervalMs    | The interval in milliseconds to wait between retries while sending a transaction                                   | number                                   | 180000                                                                           |
| opts:accountConfig:index                          | Index variable to be used alongwith with owner address and validator data while calculating counterfactual address | number                                   | 1000                                                                             |
| [TODO] include other options                      |                                                                                                                    |                                          |                                                                                  |

### Pay gas in ERC20

ZeroDev currently supports:

- `USDC`
- `PEPE` (mainnet only)
- `DAI` (upcoming)

Just pass the `paymasterConfig` to `createZeroDevProvider` function while creating the provider.

```ts
let ecdsaProvider = await ECDSAProvider.init({
  projectId, // zeroDev projectId
  owner,
  opts: {
    paymasterConfig: {
      policy: "TOKEN_PAYMASTER",
      gasToken: "TEST_ERC20",
    },
  },
});
```

### Change Kernel Account Owner in ECDSAValidator

```ts
// 1. Create a ECDSAValidatorProvider
const ecdsaProvider = await ECDSAProvider.init({
    projectId: "c73037ef-8c0b-48be-a581-1f3d161151d3",
    owner,
});

// 2. Change the owner of the Kernel Account
const { hash } = await ecdsaProvider.changeOwner(<NEW_OWNER_ADDRESS>);
```

### Via `ethers` Signer

```ts
import { Wallet } from "@ethersproject/wallet";
import {
  ZeroDevEthersProvider,
  convertEthersSignerToAccountSigner,
} from "@zerodev/sdk";

// 1. Create an ethers Wallet
const owner = Wallet.fromMnemonic(OWNER_MNEMONIC);

// 2. Create a ZeroDev ZeroDevEthersProvider passing the ethers Wallet as the signer
const provider = await ZeroDevEthersProvider.init("ECDSA", {
  projectId, // zeroDev projectId
  owner: convertEthersSignerToAccountSigner(owner),
  opts: {
    paymasterConfig: {
      policy: "VERIFYING_PAYMASTER",
    },
  },
});

// 3. Get the AccountSigner adapter of ethers signer
const signer = provider.getAccountSigner();

// 4. send a UserOperation
const { hash } = await signer.sendUserOperation({
  target: "0xTargetAddress",
  data: "0xcallData",
  value: 0n, // value: bigint or undefined
});
```

### Via `viem` using `custom` transport which supports EIP-1193 providers

```ts
import { createWalletClient, custom } from "viem";
import { polygonMumbai } from "viem/chains";
import {
  ECDSAProvider,
  convertWalletClientToAccountSigner,
} from "@zerodev/sdk";

// 1. Create a Viem Wallet Client using the custom transport
const client = createWalletClient({
  chain: polygonMumbai,
  transport: custom(window.ethereum),
});

// 2. Create a ZeroDev ECDSAProvider passing the Viem Wallet Client as the signer
let ecdsaProvider = await ECDSAProvider.init({
  projectId, // zeroDev projectId
  owner: convertWalletClientToAccountSigner(client),
});

// 3. send a UserOperation
const { hash } = await ecdsaProvider.sendUserOperation({
  target: "0xTargetAddress",
  data: "0xcallData",
  value: 0n, // value: bigint or undefined
});
```

### Using [Magic](https://magic.link/)

```ts
import { ECDSAProvider, getRPCProviderOwner } from "@zerodev/sdk";
import { Magic } from "magic-sdk";

const magic = new Magic("MAGIC_API_KEY", {
  // magic config...
});

let ecdsaProvider = await ECDSAProvider.init({
  projectId, // zeroDev projectId
  owner: getRPCProviderOwner(magic.rpcProvider),
});
```

### Using [Web3Auth](https://web3auth.io/)

```ts
import { ECDSAProvider, getRPCProviderOwner } from "@zerodev/sdk";
import { Web3Auth } from "@web3auth/modal";

const web3auth = new Web3Auth({
  // web3auth config...
});

await web3auth.initModal();

web3auth.connect();

let ecdsaProvider = await ECDSAProvider.init({
  projectId, // zeroDev projectId
  owner: getRPCProviderOwner(web3auth.provider),
});
```

## Using validator plugins

### Kill Switch Validator

A designated guardian can "turn off" the account and set a new owner.

```ts
import { constants } from "@zerodev/sdk";
// 1. Get the default ecdsa validator provider
const ecdsaProvider = await ECDSAProvider.init({
  projectId, // zeroDev projectId
  owner,
});

// 2. Initialize KillSwitch Validator Provider
const accountAddress = await ecdsaProvider.getAccount().getAddress();
const selector = getFunctionSelector("toggleKillSwitch()");

const blockerKillSwitchProvider = await KillSwitchProvider.init({
  projectId, // zeroDev projectId
  guardian, // Guardian signer
  delaySeconds: 1000, // Delay in seconds
  defaultProvider: ecdsaProvider,
  opts: {
    validatorConfig: {
      mode: ValidatorMode.plugin,
      executor: constants.KILL_SWITCH_ACTION, // Address of the executor contract
      selector, // Function selector in the executor contract to toggleKillSwitch()
    },
  },
});

// 3. Send the transaction to turn on the KillSwitch
result = await blockerKillSwitchProvider.sendUserOperation({
  target: accountAddress,
  data: selector,
});

await blockerKillSwitchProvider.waitForUserOperationTransaction(
  result.hash as Hex
);

// 4. Get KillSwitch validator provider instance with SUDO mode
const sudoModeKillSwitchProvider = await KillSwitchProvider.init({
  projectId, // zeroDev projectId
  guardian,
  delaySeconds: 0,
  defaultProvider: ecdsaProvider,
  opts: {
    validatorConfig: {
      mode: ValidatorMode.sudo,
      executor: KILL_SWITCH_ACTION,
      selector,
    },
  },
});

// 5. Send transaction to change the owner address
const changeOwnerdata = await ecdsaProvider.getEncodedEnableData(
  "0xNEW_OWNER_ADDRESS"
);
let result = await sudoModeKillSwitchProvider.sendUserOperation({
  target: accountAddress,
  data: changeOwnerdata,
});

await sudoModeKillSwitchProvider.waitForUserOperationTransaction(
  result.hash as Hex
);
```

#### Force Unblock

```ts
let result = await sudoModeKillSwitchProvider.sendUserOperation({
  target: accountAddress,
  data: selector,
});

await sudoModeKillSwitchProvider.waitForUserOperationTransaction(
  result.hash as Hash
);
```

<!--
### ERC165 Session Key Validator

```ts
// 1. Get the default ecdsa validator provider
const ecdsaProvider = await ECDSAProvider.init({
  projectId, // zeroDev projectId
  owner,
});

// 2. Deploy the Kernel account if not already by sending an empty transaction
let result = await ecdsaProvider.sendUserOperation({
  target: "0xADDRESS",
  data: "0x",
});
await ecdsaProvider.waitForUserOperationTransaction(result.hash as Hex);

// 3. Initialize required variables
const accountAddress = await ecdsaProvider.getAccount().getAddress();
const selector = getFunctionSelector(
  "transferERC721Action(address, uint256, address)"
);

// 4. Initialize ERC165SessionKey Validator Provider
const erc165SessionKeyProvider = await ERC165SessionKeyProvider.init({
  projectId, // ZeroDev projectId
  sessionKey, // Session Key signer
  sessionKeyData: {
    selector, // Function selector in the executor contract to execute
    erc165InterfaceId: "0x80ac58cd", // Supported interfaceId of the contract the executor calls
    validAfter: 0,
    validUntil: 0,
    addressOffset: 16, // Address offest of the contract called by the executor in the calldata
  },
  opts: {
    accountConfig: {
      accountAddress,
    },
    validatorConfig: {
      mode: ValidatorMode.plugin,
      executor: constants.TOKEN_ACTION, // Address of the executor contract
      selector, // Function selector in the executor contract to execute
    },
  },
});

// 5. Get enable signature from default ECDSA validator provider and set it in ERC165SessionKey Validator Provider
const enableSig = await ecdsaProvider
  .getValidator()
  .approveExecutor(
    accountAddress,
    selector,
    constants.TOKEN_ACTION,
    0,
    0,
    erc165SessionKeyProvider.getValidator()
  );

erc165SessionKeyProvider.getValidator().setEnableSignature(enableSig);

// 6. Send the transaction
const { hash } = await erc165SessionKeyProvider.sendUserOperation({
  target: accountAddress,
  data: encodeFunctionData({
    abi: TokenActionsAbi,
    functionName: "transferERC721Action",
    args: ["TOKEN_ADDRESS", "TOKEN_ID", "RECIPIENT_ADDRESS"],
  }),
});
```

-->

### Session Key Validator

[Please check out the session key docs here.](https://docs.zerodev.app/use-wallets/use-session-keys)

### Recovery Key Validator

[Please check out the recovery docs here.](https://docs.zerodev.app/use-wallets/recovery)

## Components

### Core Components

The primary interfaces are the `ZeroDevProvider`, `KernelSmartContractAccount` and `KernelBaseValidator`

The `ZeroDevProvider` is an ERC-1193 compliant Provider built on top of Alchemy's `SmartAccountProvider`

1. `sendUserOperation` -- this takes in `target`, `callData`, and an optional `value` which then constructs a UserOperation (UO), sends it, and returns the `hash` of the UO. It handles estimating gas, fetching fee data, (optionally) requesting paymasterAndData, and lastly signing. This is done via a middleware stack that runs in a specific order. The middleware order is `getDummyPaymasterData` => `estimateGas` => `getFeeData` => `getPaymasterAndData`. The paymaster fields are set to `0x` by default. They can be changed using `provider.withPaymasterMiddleware`.
2. `sendTransaction` -- this takes in a traditional Transaction Request object which then gets converted into a UO. Currently, the only data being used from the Transaction Request object is `from`, `to`, `data` and `value`. Support for other fields is coming soon.

`KernelSmartContractAccount` is Kernel's implementation of `BaseSmartContractAccount`. The following methods are implemented:

1. `getDummySignature` -- this method should return a signature that will not `revert` during validation. It does not have to pass validation, just not cause the contract to revert. This is required for gas estimation so that the gas estimate are accurate.
2. `encodeExecute` -- this method should return the abi encoded function data for a call to your contract's `execute` method
3. `encodeExecuteDelegate` -- this method should return the abi encoded function data for a `delegate` call to your contract's `execute` method
4. `signMessage` -- used to sign messages
5. `signTypedData` -- used to sign typed data
6. `signMessageWith6492` -- like `signMessage` but supports ERC-6492
7. `signTypedDataWith6492` -- like `signTypedData` but supports ERC-6492
8. `getAccountInitCode` -- this should return the init code that will be used to create an account if one does not exist. Usually this is the concatenation of the account's factory address and the abi encoded function data of the account factory's `createAccount` method.

The `KernelBaseValidator` is a plugin that modify how transactions are validated. It allows for extension and implementation of arbitrary validation logic. It implements 3 main methods:

1. `getAddress` -- this returns the address of the validator
2. `getOwner` -- this returns the eligible signer's address for the active smart wallet
3. `getSignature` -- this method signs the userop hash using signer object and then concats additional params based on validator mode.

## Contributing

1. clone the repo
2. run `yarn`
3. Make changes to packages

### Adding new custom validator plugin

1. Create a new validator class that extends `KernelBaseValidator` similar to [`ECDSAValidator`](`packages/accounts/src/kernel-zerodev/validator/ecdsa-validator.ts`).

2. Make sure to pass the `validatorAddress` of your validator to the `KernelBaseValidator` base class.

3. Create a new validator provider that extends `ValidatorProvider` similar to [`ECDSAValidatorProvider`](`packages/accounts/src/kernel-zerodev/validator-provider/ecdsa-provider.ts`).

4. Use the newly created validator provider as per above examples.

#### `KernelBaseValidator` methods to be implemented in your validator class

- `signer()` -- this method should return the signer as per your validator's implementation. For example, for Multi-Signature validator, this method should return one of the owner signer which is connected to the multisig wallet contract and currently using the DAPP.
- `getOwner()` -- this method should return the address of the signer. For example, for Multi-Signature validator, this method should return the address of the signer which is connected to the multisig wallet contract and currently using the DAPP.
- `getEnableData()` -- this method should return the bytes data for the `enable` method of your validator contract. For example, in ECDSA validator, this method returns `owner` address as bytes data. This method is used to enable the validator for the first time while creating the account wallet.
- `encodeEnable(enableData: Hex)` -- this method should return the abi encoded function data for the `enable` method of your validator contract. For example, in ECDSA validator, this method returns the abi encoded function data for the `enable` method with owner address as bytes param.
- `encodeDisable(disableData: Hex)` -- this method should return the abi encoded function data for the `disable` method of your validator contract. For example, in ECDSA validator, this method returns the abi encoded function data for the `disable` method with empty bytes param since ECDSA Validator doesn't require any param.
- `signMessage(message: Uint8Array | string | Hex)` -- this method should return the signature of the message using the connected signer.
- `signUserOp(userOp: UserOperationRequest)` -- this method should return the signature of the userOp hash using the connected signer.
