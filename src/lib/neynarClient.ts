import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

const apiKey = process.env.NEYNAR_API_KEY || "";

const config = new Configuration({
  apiKey,
});

const neynarClient = new NeynarAPIClient(config);

export default neynarClient;
