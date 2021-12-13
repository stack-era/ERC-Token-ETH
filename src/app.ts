import express, { Application } from "express";
import ercTokenTransactionsRouter from "./routes/ercTokenTransactions";
import blockByTransactionHashRouter from "./routes/blockByTransactionHash";

let app: Application = express();

// Routers
app.use("/ercTokenTransactions", ercTokenTransactionsRouter);
app.use("/transaction", blockByTransactionHashRouter);

app.listen(3000, () => {
  console.log("Server is running at port 3000");
});
