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
exports.getAccount = exports.addAccount = exports.accountList = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const const_1 = require("./const");
const fs_1 = __importDefault(require("fs"));
function accountList() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
exports.accountList = accountList;
function addAccount(opt) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = JSON.parse("{ 'account' : {} }}");
        data["account"][opt["uuid"]] = {};
        data["account"][opt["uuid"]]["access_token"] = opt["accesstoken"];
        data["account"][opt["uuid"]]["username"] = opt["username"];
        data["account"][opt["uuid"]]["xuid"] = opt["xuid"];
        data["account"][opt["uuid"]]["usertype"] = opt["usertype"];
        fs_1.default.writeFileSync(const_1.gamePath, crypto_js_1.default.AES.encrypt(JSON.stringify(data), "a").toString(crypto_js_1.default.format.Hex));
    });
}
exports.addAccount = addAccount;
function getAccount(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
exports.getAccount = getAccount;
