import type { KernelValidator } from "@zerodev/sdk/types"
import {
    type WebAuthnKey,
    WebAuthnMode,
    toWebAuthnKey
} from "@zerodev/webauthn-key"
import {
    type ApproveUserOperationParameters,
    type ApproveUserOperationReturnType,
    approveUserOperation
} from "./actions/approveUserOperation.js"
import {
    type SendUserOperationWithApprovalsParameters,
    sendUserOperationWithApprovals
} from "./actions/sendUserOperationWithApprovals.js"
import {
    type MultiChainWeightedKernelAccountClientActions,
    multiChainWeightedKernelAccountClientActions
} from "./clients/decorators/multiChainWeightedKernelAccountClient.js"
import {
    type MultiChainWeightedKernelAccountClient,
    createMultiChainWeightedKernelAccountClient
} from "./clients/multiChainWeightedKernelAccountClient.js"
import {
    type ECDSASignerParams,
    toECDSASigner
} from "./signers/toECDSASigner.js"
import {
    type WebAuthnModularSignerParams,
    toWebAuthnSigner
} from "./signers/toWebAuthnSigner.js"
import {
    type WeightedSigner,
    type WeightedValidatorConfig,
    createMultiChainWeightedValidator,
    getCurrentSigners,
    getUpdateConfigCall,
    getValidatorAddress
} from "./toMultiChainWeightedValidatorPlugin.js"

export {
    createMultiChainWeightedValidator,
    getUpdateConfigCall,
    getCurrentSigners,
    type WeightedValidatorConfig,
    type WeightedSigner,
    getValidatorAddress,
    type KernelValidator,
    toECDSASigner,
    type ECDSASignerParams,
    toWebAuthnKey,
    type WebAuthnKey,
    WebAuthnMode,
    type WebAuthnModularSignerParams,
    toWebAuthnSigner,
    type ApproveUserOperationParameters,
    type ApproveUserOperationReturnType,
    approveUserOperation,
    type SendUserOperationWithApprovalsParameters,
    sendUserOperationWithApprovals,
    type MultiChainWeightedKernelAccountClient,
    createMultiChainWeightedKernelAccountClient,
    type MultiChainWeightedKernelAccountClientActions,
    multiChainWeightedKernelAccountClientActions
}
export * from "./constants.js"
export * from "./utils.js"
