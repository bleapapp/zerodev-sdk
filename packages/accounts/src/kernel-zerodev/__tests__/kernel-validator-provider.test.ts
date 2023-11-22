import { createPublicClient, http, type Hex } from "viem";
import { polygonMumbai } from "viem/chains";
import { ECDSAValidatorAbi } from "../abis/ESCDAValidatorAbi.js";
import { config } from "./config/index.js";
import { LocalAccountSigner } from "@alchemy/aa-core";
import { generatePrivateKey } from "viem/accounts";
import { ECDSAProvider } from "../validator-provider/index.js";
import { CHAIN_ID_TO_NODE } from "../constants.js";

// [TODO] - Organize the test code properly
describe("Kernel Validator Provider Test", async () => {
  const owner = LocalAccountSigner.privateKeyToAccountSigner(config.privateKey);
  const secondOwner = LocalAccountSigner.privateKeyToAccountSigner(
    generatePrivateKey()
  );

  const client = createPublicClient({
    chain: polygonMumbai,
    transport: http(CHAIN_ID_TO_NODE[polygonMumbai.id]),
  });

  let accountAddress: Hex = "0x";

  it(
    "should change owner in ECDSAValidator plugin to new owner",
    async () => {
      const ecdsaProvider = await ECDSAProvider.init({
        projectId: "c73037ef-8c0b-48be-a581-1f3d161151d3",
        owner,
        opts: {
          accountConfig: {
            index: 10050n,
          },
          providerConfig: {
            opts: {
              txMaxRetries: 10,
              txRetryIntervalMs: 2000,
            },
          },
          paymasterConfig: {
            policy: "VERIFYING_PAYMASTER",
          },
        },
      });

      await ecdsaProvider.getAccount().getInitCode();
      let currentOwner = await client.readContract({
        functionName: "ecdsaValidatorStorage",
        args: [await ecdsaProvider.getAccount().getAddress()],
        abi: ECDSAValidatorAbi,
        address: config.validatorAddress,
      });
      console.log(`Owner before: ${currentOwner}`);
      accountAddress = await ecdsaProvider.getAccount().getAddress();
      const resp = await ecdsaProvider.changeOwner(
        await secondOwner.getAddress()
      );
      await ecdsaProvider.waitForUserOperationTransaction(resp.hash as Hex);
      let currentOwnerNow = await client.readContract({
        functionName: "ecdsaValidatorStorage",
        args: [await ecdsaProvider.getAccount().getAddress()],
        abi: ECDSAValidatorAbi,
        address: config.validatorAddress,
      });
      expect(currentOwnerNow).to.equal(await secondOwner.getAddress());
      console.log(
        `Owner changed from ${await owner.getAddress()} to ${currentOwnerNow}`
      );
    },
    { timeout: 1000000 }
  );

  it(
    "should change owner back to original owner in ECDSAValidator plugin",
    async () => {
      const ecdsaProvider = await ECDSAProvider.init({
        projectId: "c73037ef-8c0b-48be-a581-1f3d161151d3",
        owner: secondOwner,
        opts: {
          accountConfig: {
            accountAddress,
          },
          providerConfig: {
            opts: {
              txMaxRetries: 15,
              txRetryIntervalMs: 2000,
            },
          },
          paymasterConfig: {
            policy: "VERIFYING_PAYMASTER",
          },
        },
      });

      await ecdsaProvider.getAccount().getInitCode();
      let currentOwner = await client.readContract({
        functionName: "ecdsaValidatorStorage",
        args: [await ecdsaProvider.getAccount().getAddress()],
        abi: ECDSAValidatorAbi,
        address: config.validatorAddress,
      });
      console.log(`Owner before: ${currentOwner}`);

      const resp2 = await ecdsaProvider.changeOwner(await owner.getAddress());
      await ecdsaProvider.waitForUserOperationTransaction(resp2.hash as Hex);
      let currentOwnerNow = await client.readContract({
        functionName: "ecdsaValidatorStorage",
        args: [accountAddress],
        abi: ECDSAValidatorAbi,
        address: config.validatorAddress,
      });
      expect(currentOwnerNow).to.equal(await owner.getAddress());
      console.log(
        `Owner changed back to ${currentOwnerNow} from ${await secondOwner.getAddress()}`
      );
    },
    { timeout: 1000000 }
  );
});
