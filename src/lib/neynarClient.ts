import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

export function getNeynarClient() {
  const apiKey = process.env.NEYNAR_API_KEY || "E0EFCCD0-F3EE-4589-88FF-AC1478DF2FC1";
  const config = new Configuration({
    apiKey,
    baseOptions: {
      headers: {
        "x-api-key": apiKey,
        "api_key": apiKey,
      },
    },
  });
  return new NeynarAPIClient(config);
}

const neynarClient = getNeynarClient();
export default neynarClient;
