import neynarClient from "@/lib/neynarClient";
import { ViemLocalEip712Signer } from "@farcaster/hub-nodejs";
import { bytesToHex, hexToBytes } from "viem";
import { getAccount, getFid } from "./getFid";

export const getSignedKey = async () => {
  const createSigner = await neynarClient.createSigner();
  const { deadline, signature } = await generateSignature(createSigner.public_key);

  if (deadline === 0 || signature === "") {
    throw new Error("Failed to generate signature");
  }

  const fid = await getFid();

  const signedKey = await neynarClient.registerSignedKey({
    signerUuid: createSigner.signer_uuid,
    appFid: fid,
    deadline,
    signature,
    sponsor: {
      sponsored_by_neynar: true,
    },
  });

  return signedKey;
};

const generateSignature = async function (publicKey: string) {
  const account = getAccount();
  const fid = await getFid();

  const appAccountKey = new ViemLocalEip712Signer(account as any);

  const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours
  const uintAddress = hexToBytes(publicKey as `0x${string}`);

  const signature = await appAccountKey.signKeyRequest({
    requestFid: BigInt(fid),
    key: uintAddress,
    deadline: BigInt(deadline),
  });

  if (signature.isErr()) {
    return {
      deadline,
      signature: "",
    };
  }

  const sigHex = bytesToHex(signature.value);

  return { deadline, signature: sigHex };
};
