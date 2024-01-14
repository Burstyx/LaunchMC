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
exports.getSetting = exports.setSetting = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = __importDefault(require("path"));
const const_1 = require("./const");
const fs_1 = require("fs");
function setSetting(property, value) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            console.log(`call: ${property} with ${value}`);
            const settingsPath = path_1.default.join(const_1.gamePath, "settings.json");
            let data = {};
            if ((0, fs_1.existsSync)(settingsPath)) {
                yield (0, fs_extra_1.readFile)(settingsPath, "utf8").then((val) => {
                    data = JSON.parse(val);
                }).catch((err) => reject(err));
            }
            data[property] = value;
            yield (0, fs_extra_1.writeFile)(path_1.default.join(const_1.gamePath, "settings.json"), JSON.stringify(data)).then(() => resolve()).catch((err) => reject(err));
        }));
    });
}
exports.setSetting = setSetting;
function getSetting(property, propertyNullVal) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const settingsPath = path_1.default.join(const_1.gamePath, "settings.json");
            if ((0, fs_1.existsSync)(settingsPath)) {
                yield (0, fs_extra_1.readFile)(settingsPath, "utf8").then((val) => {
                    const data = JSON.parse(val);
                    if (data.hasOwnProperty(property)) {
                        resolve(data[property]);
                    }
                    else {
                        resolve(propertyNullVal);
                    }
                }).catch((err) => reject(err));
            }
            else {
                resolve(propertyNullVal);
            }
        }));
    });
}
exports.getSetting = getSetting;
