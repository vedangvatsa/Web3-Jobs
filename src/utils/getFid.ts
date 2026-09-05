import neynarClient from "@/lib/neynarClient";
import { mnemonicToAccount, privateKeyToAccount } from "viem/accounts";

export const getAccount = () => {
  const mnemonic = process.env.FARCASTER_DEVELOPER_MNEMONIC;
  const privateKey = process.env.FARCASTER_DEVELOPER_PRIVATE_KEY;

  if (privateKey) {
    const formatted = (privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`) as `0x${string}`;
    return privateKeyToAccount(formatted);
  }

  if (mnemonic) {
    return mnemonicToAccount(mnemonic.trim());
  }

  throw new Error("FARCASTER_DEVELOPER_MNEMONIC or FARCASTER_DEVELOPER_PRIVATE_KEY is not set.");
};

export const getFid = async (): Promise<number> => {
  const account = getAccount();

  if (process.env.FARCASTER_FID) {
    return Number(process.env.FARCASTER_FID);
  }
  return 3350013;
};
