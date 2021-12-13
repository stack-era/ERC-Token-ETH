import express, { Response, Request } from "express";
const router = express.Router();
import axios from "axios";
import { moralisAPIConfig } from "../config/moralisAPI";
const Web3 = require("web3");
const web3 = new Web3(Web3.givenProvider);

// async function ayush() {
//   let kamboj = await web3.eth.abi.decodeLog(
//     // Event Parameter from Smart Contract (First Paramerter)
//     [
//       {
//         type: "address",
//         name: "from",
//         indexed: true,
//       },
//       {
//         type: "address",
//         name: "to",
//         indexed: true,
//       },
//       {
//         type: "uint",
//         name: "value",
//       },
//     ],
//     // Second parameter is the data in the logs of the transaction
//     "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000",
//     // Third parameter contains all topics except topic 0
//     [
//       "0x000000000000000000000000bd39f80e400ed14a341dc2e6ec182ebbabf38662",
//       "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
//     ]
//   );

//   console.log(kamboj);
// }

// ayush();

// Array contains transaction Logs

let transactionLogsArray: any[] = [];

// Counter to put transaction hash one by one in api end point to fetch logs
let counterForMakingAsyncFetching = 0;

// Default limit of logs
let defaultLimit = 20;

// Function to fetch transaction logs and pushing that data into array
async function transactionsLogsUsingHash(singleTransactionHash: any) {
  await axios(
    `https://deep-index.moralis.io/api/v2/transaction/${singleTransactionHash}?chain=eth`,
    moralisAPIConfig
  ).then((response) => transactionLogsArray.push(response.data.logs));
}

// End Point to find the ERC-20 Token transactions
// Format - /ercTokenTransactions/{tokenAddress}/{tokenExchange}
// Can provide limit as query to increase the default limit
router.get("/:address/:exchange", async (req: Request, res: Response) => {
  let tokenAddress = req.params.address;
  let tokenExchange = req.params.exchange;
  let limit = req.query.limit;

  // Getting Token data by using token address
  await axios(
    `https://deep-index.moralis.io/api/v2/${tokenAddress}/erc20/transfers?chain=${tokenExchange}`,
    moralisAPIConfig
  )
    .then((data) => data.data.result)
    .then(async (singleTransaction) => {
      // Adding interval (100 ms) to avoid 429 status error
      let interval = setInterval(() => {
        if (counterForMakingAsyncFetching < (limit || defaultLimit)) {
          transactionsLogsUsingHash(
            singleTransaction[counterForMakingAsyncFetching].transaction_hash
          );
          counterForMakingAsyncFetching++;
        } else {
          clearInterval(interval);
          res.send(transactionLogsArray);
        }
      }, 200);
    });
});

export default router;
