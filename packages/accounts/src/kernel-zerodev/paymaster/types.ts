import type { Hex } from "viem";
import type { Paymaster } from "./base.js";
import type { ZeroDevProvider } from "../provider.js";

export type PaymasterAndBundlerProviders =
  | "ALCHEMY"
  | "STACKUP"
  | "PIMLICO"
  | "GELATO";

export type SupportedGasToken = "USDC" | "PEPE" | "TEST_ERC20";

export type PaymasterPolicy = "VERIFYING_PAYMASTER" | "TOKEN_PAYMASTER";

interface PaymasterConfigOptions {
  VERIFYING_PAYMASTER: {};
  TOKEN_PAYMASTER: { gasToken: SupportedGasToken };
}

export type PaymasterConfig<T extends PaymasterPolicy> = {
  policy: T;
  paymasterProvider?: PaymasterAndBundlerProviders;
  onlySendSponsoredTransaction?: boolean;
} & PaymasterConfigOptions[T];
export interface IGasTokenAddresses {
  [key: string]: {
    [chainId: number]: Hex;
  };
}

export interface IPaymaster<
  Provider extends ZeroDevProvider,
  P extends PaymasterPolicy
> {
  new (provider: Provider, paymasterConfig: PaymasterConfig<P>): Paymaster;
}

export type PaymasterMap<Provider extends ZeroDevProvider> = {
  [P in PaymasterPolicy]: IPaymaster<Provider, P>;
};
