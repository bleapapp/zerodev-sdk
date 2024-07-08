import { constants, fixSignedData } from "@zerodev/sdk"
import type { TypedData } from "abitype"
import {
    SignTransactionNotSupportedBySmartAccount,
    type SmartAccountSigner
} from "permissionless/accounts"
import type { Address, LocalAccount, TypedDataDefinition } from "viem"
import { toAccount } from "viem/accounts"
import type { ModularSigner, ModularSignerParams } from "../types.js"

export type CosigningModularSignerParams<
    TSource extends string = "custom",
    TAddress extends Address = Address
> = ModularSignerParams & {
    signer: SmartAccountSigner<TSource, TAddress>
}

export function toCosigningSigner<
    TSource extends string = "custom",
    TAddress extends Address = Address
>({
    signer,
    signerContractAddress
}: CosigningModularSignerParams<TSource, TAddress>): ModularSigner {
    const viemSigner: LocalAccount = {
        ...signer,
        signTransaction: (_, __) => {
            throw new SignTransactionNotSupportedBySmartAccount()
        }
    } as LocalAccount
    const account = toAccount({
        address: viemSigner.address,
        async signMessage({ message }) {
            return fixSignedData(await viemSigner.signMessage({ message }))
        },
        async signTransaction(_, __) {
            throw new SignTransactionNotSupportedBySmartAccount()
        },
        async signTypedData<
            const TTypedData extends TypedData | Record<string, unknown>,
            TPrimaryType extends
                | keyof TTypedData
                | "EIP712Domain" = keyof TTypedData
        >(typedData: TypedDataDefinition<TTypedData, TPrimaryType>) {
            return fixSignedData(
                await viemSigner.signTypedData<TTypedData, TPrimaryType>({
                    ...typedData
                })
            )
        }
    })
    if (!signerContractAddress)
        throw new Error("signerContractAddress is required")
    return {
        account,
        signerContractAddress: signerContractAddress as Address,
        getSignerData: () => {
            return viemSigner.address
        },
        getDummySignature: () => constants.DUMMY_ECDSA_SIG
    }
}
