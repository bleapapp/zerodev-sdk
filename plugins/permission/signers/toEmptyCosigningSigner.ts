import { constants } from "@zerodev/sdk"
import type { TypedData } from "abitype"
import type { Address, TypedDataDefinition } from "viem"
import { toAccount } from "viem/accounts"
import type {ModularSigner, ModularSignerParams} from "../types.js"

export type EmptyCosigningSignerParams = ModularSignerParams & {
    signerAddress: Address
}

export function toEmptyCosigningSigner({
    signerAddress,
    signerContractAddress
}: EmptyCosigningSignerParams): ModularSigner {
    const account = toAccount({
        address: signerAddress,
        async signMessage() {
            throw new Error("Method not supported")
        },
        async signTransaction(_, __) {
            throw new Error("Method not supported")
        },
        async signTypedData<
            const TTypedData extends TypedData | Record<string, unknown>,
            TPrimaryType extends
                | keyof TTypedData
                | "EIP712Domain" = keyof TTypedData
        >(_typedData: TypedDataDefinition<TTypedData, TPrimaryType>) {
            //throw new Error("Method not supported")
            return "0x"
        }
    })
    return {
        account,
        signerContractAddress: signerContractAddress!,
        getSignerData: () => {
            return signerAddress
        },
        getDummySignature: () => constants.DUMMY_ECDSA_SIG
    }
}
