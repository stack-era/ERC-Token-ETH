import express, { Response, Request } from "express";
const router = express.Router();
import axios from "axios";
import { moralisAPIConfig } from "../config/moralisAPI";

// End Point to find the content of a transaction using transaction hash
// Format - /transaction/{transactionHash}

router.get("/:transactionHash", async (req: Request, res: Response) => {
  // console.log(moralisAPI.headers);
  let transactionsHash = req.params.transactionHash;
  let transactionContent = await axios(
    `https://deep-index.moralis.io/api/v2/transaction/${transactionsHash}?chain=eth`,
    moralisAPIConfig
  );
  res.status(200).json(transactionContent.data);
});

export default router;
