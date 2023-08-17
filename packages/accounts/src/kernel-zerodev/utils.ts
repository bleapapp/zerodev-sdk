import {
  encodePacked,
  fromBytes,
  toBytes,
  type Hex,
  type WalletClient,
  toHex,
  isHex,
} from "viem";
import type {
  SignTypedDataParams,
  SmartAccountSigner,
  UserOperationCallData,
} from "@alchemy/aa-core";
import { Signer, type TypedDataField } from "@ethersproject/abstract-signer";
import { Wallet } from "@ethersproject/wallet";
import { splitSignature, joinSignature } from "@ethersproject/bytes";
import type { SupportedGasToken } from "./paymaster/types.js";
import { gasTokenChainAddresses } from "./constants.js";

export type UserOperationCallDataWithDelegate = UserOperationCallData & {
  delegateCall?: boolean;
};

export type BatchUserOperationCallDataWithDelegate =
  UserOperationCallDataWithDelegate[];

const encodeCall = (_tx: UserOperationCallDataWithDelegate): string => {
  const data = toBytes(_tx.data);
  const encoded = encodePacked(
    ["uint8", "address", "uint256", "uint256", "bytes"],
    [
      _tx.delegateCall ? 1 : 0,
      _tx.target,
      _tx.value || BigInt(0),
      BigInt(data.length),
      fromBytes(data, "hex"),
    ]
  );
  return encoded.slice(2);
};
export const encodeMultiSend = (
  _txs: BatchUserOperationCallDataWithDelegate
): Hex => {
  return ("0x" + _txs.map((tx) => encodeCall(tx)).join("")) as Hex;
};

export function getGasTokenAddress(
  gasToken: SupportedGasToken,
  chainId: number
): Hex | undefined {
  if (gasToken === "TEST_ERC20") {
    return "0x3870419Ba2BBf0127060bCB37f69A1b1C090992B";
  }
  return gasTokenChainAddresses[gasToken][chainId] || undefined;
}

export const convertWalletClientToAccountSigner = (
  client: WalletClient
): SmartAccountSigner => {
  return {
    getAddress: async () =>
      Promise.resolve((await client.getAddresses())[0] as `0x${string}`),
    signMessage: async (message: Uint8Array | string) =>
      (await client.signMessage({
        account: client.account!,
        message:
          typeof message === "string"
            ? message
            : {
                raw: message,
              },
      })) as `0x${string}`,
    signTypedData: async (params: SignTypedDataParams) =>
      await client.signTypedData({ ...params, account: client.account! }),
  };
};

export const isWallet = (signer: any): signer is Wallet =>
  signer && signer._signTypedData !== undefined;

export const convertEthersSignerToAccountSigner = (
  signer: Signer | Wallet
): SmartAccountSigner => {
  return {
    getAddress: async () =>
      Promise.resolve((await signer.getAddress()) as `0x${string}`),
    signMessage: async (msg: Uint8Array | string) =>
      (await signer.signMessage(msg)) as `0x${string}`,
    signTypedData: async (params: SignTypedDataParams) => {
      if (!isWallet(signer)) {
        throw Error("signTypedData method not implemented in signer");
      }
      return (await signer._signTypedData(
        params.domain!,
        params.types as unknown as Record<string, TypedDataField[]>,
        params.message
      )) as Hex;
    },
  };
};

export const randomHexString = (length: number): Hex =>
  toHex(
    Array.from({ length }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")
  );

export const fixSignedData = (sig: Hex): Hex => {
  let signature = sig;
  if (!isHex(signature)) {
    signature = `0x${signature}`;
    if (!isHex(signature)) {
      throw new Error("Invalid signed data " + sig);
    }
  }
  let { r, s, v } = splitSignature(signature);
  if (v === 0) v = 27;
  if (v === 1) v = 28;
  const joined = joinSignature({ r, s, v });
  return joined as Hex;
};
