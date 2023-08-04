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
exports.getActiveAccount = exports.changeAccountProperty = exports.getAccount = exports.addAccount = exports.accountList = void 0;
const const_1 = require("./const");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
function accountList() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = JSON.parse(yield promises_1.default.readFile(path_1.default.join(const_1.gamePath, "microsoft_account.json"), "utf-8"));
        let accounts = [];
        for (const account of data["accounts"]) {
            accounts.push(account);
        }
        return accounts;
    });
}
exports.accountList = accountList;
function addAccount(opt) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = { "accounts": [] };
        data["accounts"].push({ "access_token": opt["accesstoken"], "username": opt["username"], "usertype": opt["usertype"], "uuid": opt["uuid"], "active": true });
        yield promises_1.default.writeFile(path_1.default.join(const_1.gamePath, "microsoft_account.json"), JSON.stringify(data));
    });
}
exports.addAccount = addAccount;
function getAccount(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = JSON.parse(yield promises_1.default.readFile(path_1.default.join(const_1.gamePath, "microsoft_account.json"), "utf-8"));
        for (const e in data["accounts"]) {
            if (data["accounts"][e]["uuid"] == uuid) {
                return data["accounts"][e];
            }
        }
    });
}
exports.getAccount = getAccount;
function changeAccountProperty(uuid, property, newValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = JSON.parse(yield promises_1.default.readFile(path_1.default.join(const_1.gamePath, "microsoft_account.json"), "utf-8"));
        console.log("current");
        console.log(JSON.stringify(data));
        for (const e in data["accounts"]) {
            if (data["accounts"][e]["uuid"] == uuid) {
                if (!data["accounts"][e].hasOwnProperty(property)) {
                    console.log("Property doesn't exist");
                    return;
                }
                data["accounts"][e][property] = newValue;
            }
        }
        console.log("modified");
        console.log(data);
        yield promises_1.default.writeFile(path_1.default.join(const_1.gamePath, "microsoft_account.json"), JSON.stringify(data));
    });
}
exports.changeAccountProperty = changeAccountProperty;
function getActiveAccount() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = JSON.parse(yield promises_1.default.readFile(path_1.default.join(const_1.gamePath, "microsoft_account.json"), "utf-8"));
        for (const e in data["accounts"]) {
            if (data["accounts"][e]["active"] == true) {
                console.log(data["accounts"][e]);
                return data["accounts"][e];
            }
        }
    });
}
exports.getActiveAccount = getActiveAccount;
