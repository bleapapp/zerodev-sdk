import { OAuthExtension } from "@magic-ext/oauth";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import type { KernelValidator } from "@zerodev/sdk/types";
import { Magic } from "magic-sdk";
import { providerToSmartAccountSigner } from "permissionless";
import type { EntryPoint } from "permissionless/types/entrypoint";
import { type Chain, type Client, type Transport } from "viem";

export async function isAuthorized(): Promise<boolean> {
  try {
    const magic = getMagic()

    if (!magic) {
      return false
    }

    const isLoggedIn = await magic.user.isLoggedIn()
    if (isLoggedIn) return true

    const result = await magic.oauth.getRedirectResult()
    return result !== null
  } catch {}
  return false
}

export function initiateLogin(socialProvider: 'google' | 'facebook', oauthCallbackUrl?: string) {
  const magic = getMagic()

  if (!magic) {
    throw new Error("Social provider not found");
  }

  magic.oauth.loginWithRedirect({
    provider: socialProvider,
    redirectURI: oauthCallbackUrl ?? window.location.href,
  });
}

export async function getSocialValidator<
  entryPoint extends EntryPoint,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined
>(
  client: Client<TTransport, TChain, undefined>,
  {
    entryPoint: entryPointAddress,
  }: {
    entryPoint: entryPoint;
  }
): Promise<KernelValidator<entryPoint, "SocialValidator">> {
  const magic = getMagic()

  if (!magic) {
    throw new Error("Social provider not found");
  }

  const authorized = isAuthorized()
  if (!authorized) {
    throw new Error("initiateLogin() must be called first.");
  }

  const magicProvider = await magic.wallet.getProvider();
  const smartAccountSigner = await providerToSmartAccountSigner(magicProvider);

  const ecdsaValidator = await signerToEcdsaValidator(client, {
    signer: smartAccountSigner,
    entryPoint: entryPointAddress,
  });

  return {
    ...ecdsaValidator,
    source: "SocialValidator",
  };
}

function getMagic() {
  // TODO: check if ZeroDev user has access to socials

  return (
    typeof window !== "undefined" &&
    new Magic("asdf", {
      extensions: [new OAuthExtension()],
    })
  );
};