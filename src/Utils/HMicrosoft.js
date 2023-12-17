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
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
function accountList() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (!(0, fs_1.existsSync)(path_1.default.join(const_1.gamePath, "microsoft_account.json"))) {
                reject();
            }
            yield promises_1.default.readFile(path_1.default.join(const_1.gamePath, "microsoft_account.json"), "utf-8").then((file) => {
                const data = JSON.parse(file);
                let accounts = [];
                for (const account of data["accounts"]) {
                    accounts.push(account);
                }
                resolve(accounts);
            }).catch((err) => {
                reject(err);
            });
        }));
    });
}
exports.accountList = accountList;
function addAccount(opt) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let data = { "accounts": [] };
            if ((0, fs_1.existsSync)(path_1.default.join(const_1.gamePath, "microsoft_account.json"))) {
                yield promises_1.default.readFile(path_1.default.join(const_1.gamePath, "microsoft_account.json"), "utf-8").then((res) => {
                    data = JSON.parse(res);
                }).catch((err) => {
                    reject(err);
                });
            }
            console.log("la");
            let activeAccount = undefined;
            yield getActiveAccount().then((res) => __awaiter(this, void 0, void 0, function* () {
                activeAccount = res;
            })).catch((err) => { });
            console.log("la");
            data["accounts"].push({ "access_token": opt.accessToken, "refresh_token": opt.refreshToken, "username": opt.username, "usertype": opt.usertype, "uuid": opt.uuid, "active": activeAccount === undefined });
            yield promises_1.default.writeFile(path_1.default.join(const_1.gamePath, "microsoft_account.json"), JSON.stringify(data)).then(() => {
                console.log("la");
                resolve();
            }).catch((err) => reject(err));
        }));
    });
}
exports.addAccount = addAccount;
function getAccount(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield promises_1.default.readFile(path_1.default.join(const_1.gamePath, "microsoft_account.json"), "utf8").then((res) => {
                const data = JSON.parse(res);
                for (const e in data["accounts"]) {
                    if (data["accounts"][e]["uuid"] == uuid) {
                        resolve(data["accounts"][e]);
                    }
                }
            }).catch((err) => {
                reject(err);
            });
        }));
    });
}
exports.getAccount = getAccount;
function changeAccountProperty(uuid, property, newValue) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield promises_1.default.readFile(path_1.default.join(const_1.gamePath, "microsoft_account.json"), "utf8").then((res) => __awaiter(this, void 0, void 0, function* () {
                const data = JSON.parse(res);
                for (const e in data["accounts"]) {
                    if (data["accounts"][e]["uuid"] == uuid) {
                        if (!data["accounts"][e].hasOwnProperty(property)) {
                            reject();
                        }
                        data["accounts"][e][property] = newValue;
                    }
                }
                yield promises_1.default.writeFile(path_1.default.join(const_1.gamePath, "microsoft_account.json"), JSON.stringify(data)).catch((err) => {
                    reject(err);
                });
                resolve();
            })).catch((err) => {
                reject(err);
            });
        }));
    });
}
exports.changeAccountProperty = changeAccountProperty;
function getActiveAccount() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (!(0, fs_1.existsSync)(path_1.default.join(const_1.gamePath, "microsoft_account.json"))) {
                reject();
            }
            yield promises_1.default.readFile(path_1.default.join(const_1.gamePath, "microsoft_account.json"), "utf8").then((res) => {
                const data = JSON.parse(res);
                for (const e in data["accounts"]) {
                    if (data["accounts"][e]["active"] == true) {
                        resolve(data["accounts"][e]);
                    }
                }
                reject();
            }).catch((err) => {
                reject(err);
            });
        }));
    });
}
exports.getActiveAccount = getActiveAccount;
