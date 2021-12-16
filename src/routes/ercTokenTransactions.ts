import express, { Response, Request } from "express";
const router = express.Router();
import axios from "axios";
import { moralisAPIConfig } from "../config/moralisAPI";
const Web3 = require("web3");
const web3 = new Web3(Web3.givenProvider);

// Array contains transaction Logs
let transactionLogsArray: any[] = [];

// Counter to put transaction hash one by one in api end point to fetch logs
let counterForMakingAsyncFetching = 0;

// Default limit of logs
let defaultLimit = 100;

// Array which contains decoded Log data
let decodedLogData: any = [];

// Function to decode log data
async function decodingLogData(dataToBeDecoded: any, topic1: any, topic2: any) {
  let decodedData = await web3.eth.abi.decodeLog(
    // Event Parameter from Smart Contract (First Paramerter)
    [
      {
        type: "address",
        name: "sender",
        indexed: true,
      },
      {
        type: "uint",
        name: "amount0In",
      },
      {
        type: "uint",
        name: "amount1In",
      },
      {
        type: "uint",
        name: "amount0Out",
      },
      {
        type: "uint",
        name: "amount1Out",
      },
      {
        type: "address",
        name: "to",
        indexed: true,
      },
    ],
    // Second parameter is the data in the logs of the transaction
    `${dataToBeDecoded}`,

    // Third parameter contains all topics except topic 0
    [`${topic1}`, `${topic2}`]
  );
  decodedLogData.push(decodedData);
}

// decodingLogData(
//   "0x00000000000000000000000000000000000000000000096905557363c5c3741100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008c4d90095d9c00",
//   "0x0000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d",
//   "0x0000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d"
// );

// Function to fetch transaction logs and pushing that data into array
async function transactionsLogsUsingHash(singleTransactionHash: any) {
  await axios(
    `https://deep-index.moralis.io/api/v2/transaction/${singleTransactionHash}?chain=eth`,
    moralisAPIConfig
  ).then(
    (response) =>
      response.data.logs.map(async (singleLog: any) => {
        // Checking if any topic of a log have 0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822 one, then only we push it to the array
        if (
          singleLog.topic0 ===
            "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822" ||
          singleLog.topic1 ===
            "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822" ||
          singleLog.topic2 ===
            "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822"
        ) {
          await transactionLogsArray.push(singleLog);
          console.log("Pushed");
        }
      })
    // transactionLogsArray.push(response.data.logs)
  );
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
    `https://deep-index.moralis.io/api/v2/${tokenAddress}/erc20/transfers?chain=${tokenExchange}&limit=${
      limit || defaultLimit
    }`,
    moralisAPIConfig
  )
    .then((data) => data.data.result)
    .then(async (transactions) => {
      // Adding interval (100 ms) to avoid 429 status error

      let interval = setInterval(async () => {
        if (counterForMakingAsyncFetching < (limit || defaultLimit)) {
          transactionsLogsUsingHash(
            transactions[counterForMakingAsyncFetching].transaction_hash
          );
          counterForMakingAsyncFetching++;
        } else {
          clearInterval(interval);
          counterForMakingAsyncFetching = 0;
          await transactionLogsArray.map((singleLog: any) => {
            decodingLogData(singleLog.data, singleLog.topic1, singleLog.topic2);
          });
          res.send(decodedLogData);
          decodedLogData = [];
          transactionLogsArray = [];
        }
      }, 100);
    });
});

export default router;
