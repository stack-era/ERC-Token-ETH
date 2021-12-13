"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const axios_1 = __importDefault(require("axios"));
require("dotenv").config();
// Configuration for Moralis API
let config = {
    headers: {
        Accept: "application/json",
        "X-API-Key": process.env.MoralisAPIKey,
    },
};
// End Point to find the ERC-20 Token transactions
// Format - /ercTokenTransactions/{tokenAddress}/{tokenExchange}
router.get("/:address/:exchange", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let tokenAddress = req.params.address;
    let tokenExchange = req.params.exchange;
    let tokenData = yield (0, axios_1.default)(`https://deep-index.moralis.io/api/v2/${tokenAddress}/erc20/transfers?chain=${tokenExchange}`, config).then((data) => data.data);
    res.status(200).json(tokenData);
}));
exports.default = router;
