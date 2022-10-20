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
exports.getVersionManifest = void 0;
const fs_1 = __importDefault(require("fs"));
const const_1 = require("../utils/const");
const https_1 = __importDefault(require("https"));
const path_1 = __importDefault(require("path"));
function getVersionManifest(version) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new Promise((resolve, reject) => {
            if (!fs_1.default.existsSync(path_1.default.join(const_1.minecraftVersionPath, version))) {
                fs_1.default.mkdirSync(path_1.default.join(const_1.minecraftVersionPath, version), { recursive: true });
            }
            if (!fs_1.default.existsSync(path_1.default.join(const_1.minecraftVersionPath, version, version + ".json"))) {
                fetch(const_1.versionsManifest).then((res) => {
                    res.json().then((data) => {
                        for (let i = 0; i < data["versions"].length; i++) {
                            if (data["versions"][i]["id"] == version) {
                                const indexFile = fs_1.default.createWriteStream(path_1.default.join(const_1.minecraftVersionPath, version, version + ".json"));
                                https_1.default.get(data["versions"][i]["url"], (data) => {
                                    data.pipe(indexFile);
                                    data.on("end", () => {
                                        console.log("aaa");
                                        resolve(JSON.parse(fs_1.default.readFileSync(path_1.default.join(const_1.minecraftVersionPath, version, version + ".json"), "utf-8")));
                                    });
                                });
                            }
                        }
                    });
                });
            }
            else {
                resolve(JSON.parse(fs_1.default.readFileSync(path_1.default.join(const_1.minecraftVersionPath, version, version + ".json"), "utf-8")));
            }
        });
    });
}
exports.getVersionManifest = getVersionManifest;
