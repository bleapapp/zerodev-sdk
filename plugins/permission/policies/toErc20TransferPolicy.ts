import { type Hex, concatHex, encodeAbiParameters } from "viem"
import { ERC20_TRANSFER_POLICY_CONTRACT, PolicyFlags } from "../constants.js"
import type { Policy, PolicyParams } from "../types.js"
import type { SpendLimitsRequest } from "./types.js"

export type Erc20TransferPolicyParams = PolicyParams & {
    spendLimitsRequest: SpendLimitsRequest
}

export function toErc20TransferPolicy({
    policyAddress = ERC20_TRANSFER_POLICY_CONTRACT,
    policyFlag = PolicyFlags.FOR_ALL_VALIDATION,
    spendLimitsRequest
}: Erc20TransferPolicyParams): Policy {
    return {
        getPolicyData: () => {
            return encodeSpendLimitsRequestData(spendLimitsRequest)
        },
        getPolicyInfoInBytes: () => {
            return concatHex([policyFlag, policyAddress])
        },
        policyParams: {
            type: "erc20-transfer",
            policyAddress,
            policyFlag,
            spendLimitsRequest
        } as unknown as Erc20TransferPolicyParams & { type: "erc20-transfer" }
    }
}

export const encodeSpendLimitsRequestData = (
    spendLimitsRequest: SpendLimitsRequest
): Hex => {
    const spendLimitsRequestParam = [
        {
            name: "tokenCategory",
            type: "uint256"
        },
        {
            name: "allowedDestinationAddresses",
            type: "address[]"
        },
        {
            components: [
                {
                    name: "valueLimit",
                    type: "uint256"
                },
                {
                    name: "periodInSeconds",
                    type: "uint256"
                }
            ],
            name: "limits",
            type: "tuple[]"
        }
    ]

    const values = [
        spendLimitsRequest.tokenCategory,
        spendLimitsRequest.allowedDestinationAddresses,
        spendLimitsRequest.limits
    ]
    return encodeAbiParameters(spendLimitsRequestParam, values)
}
