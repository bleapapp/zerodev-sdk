export const ECDSA_SIGNER_CONTRACT =
    "0x2636b20d65A248868B351BC98CBed215648aeab7"
export const GAS_POLICY_CONTRACT = "0x7FCe06c39E7e85c25164BfB2AC1B7D04626147df"
export const SUDO_POLICY_CONTRACT = "0xe20Bc90E5d8b4276F073F8604b69AbE446Fb68d6"
export enum PolicyFlags {
    FOR_ALL_VALIDATION = "0x0000",
    NOT_FOR_VALIDATE_USEROP = "0x0001",
    NOT_FOR_VALIDATE_SIG = "0x0002"
}