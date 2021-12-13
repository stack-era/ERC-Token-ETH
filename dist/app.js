"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ercTokenTransactions_1 = __importDefault(require("./routes/ercTokenTransactions"));
let app = (0, express_1.default)();
app.use("/ercTokenTransactions", ercTokenTransactions_1.default);
app.listen(3000, () => {
    console.log("Server is running at port 3000");
});
