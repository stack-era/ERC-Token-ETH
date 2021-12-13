require("dotenv").config();

// Configuration for Moralis API
export const moralisAPIConfig: Object = {
  headers: {
    Accept: "application/json",
    "X-API-Key": process.env.MoralisAPIKey,
  },
};
