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
exports.downloadAsync = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const HFileManagement_1 = require("./HFileManagement");
const checksum_1 = __importDefault(require("checksum"));
const fs_extra_1 = require("fs-extra");
// @ts-ignore
const Debug_1 = require("./Debug");
// Download url async
function downloadAsync(url, dest, callback, opt) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const destDir = dest.slice(0, dest.lastIndexOf("\\"));
        yield (0, HFileManagement_1.makeDir)(destDir);
        const file = (0, fs_extra_1.createWriteStream)(dest);
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    (0, Debug_1.info)(`Downloading ${dest} from ${url}...`);
                    const responseArrayBuffer = xhr.response;
                    const buffer = Buffer.from(responseArrayBuffer);
                    file.on("finish", () => __awaiter(this, void 0, void 0, function* () {
                        (0, Debug_1.info)(`Downloaded ${dest} from ${url}!`);
                        if (opt && opt["decompress"] == true) {
                            (0, Debug_1.info)(`Extracting ${dest}...`);
                            const destWithoutExt = dest.substring(0, dest.lastIndexOf("."));
                            const zip = new adm_zip_1.default(dest);
                            try {
                                zip.extractAllTo(destWithoutExt, true);
                                yield promises_1.default.rm(dest);
                                (0, Debug_1.info)(`Extracted and deleted ${dest}!`);
                            }
                            catch (e) {
                                if (opt.retry != undefined) {
                                    if (opt.retry > 0) {
                                        (0, Debug_1.error)(`Failed to download ${dest} from ${url}, ${opt.retry} remaining...`);
                                        yield promises_1.default.rm(dest);
                                        yield downloadAsync(url, dest, callback, { retry: opt.retry - 1, hash: opt.hash, headers: opt.headers, decompress: opt.decompress });
                                    }
                                    return;
                                }
                                (0, Debug_1.error)(`Can't download ${dest} from ${url}, skip this file: ${e}`);
                            }
                        }
                    }));
                    file.write(buffer);
                    file.close();
                    file.on("close", () => {
                        if ((opt === null || opt === void 0 ? void 0 : opt.hash) != undefined) {
                            checksum_1.default.file(dest, (err, hash) => __awaiter(this, void 0, void 0, function* () {
                                if (hash !== opt.hash) {
                                    if (opt.retry != undefined) {
                                        if (opt.retry > 0) {
                                            yield promises_1.default.rm(dest);
                                            yield downloadAsync(url, dest, callback, { retry: opt.retry - 1, hash: opt.hash, headers: opt.headers, decompress: opt.decompress });
                                        }
                                    }
                                }
                            }));
                        }
                        resolve(dest);
                    });
                }
                else {
                    (0, Debug_1.error)(`Can't retrieve the URL ${url}, stopped with status code ${xhr.status}.`);
                    reject();
                }
            }
        };
        let lastLoaded = 0;
        xhr.onprogress = (evt) => {
            const loaded = evt.loaded;
            const total = evt.total;
            const percentage = Math.round((loaded / total) * 100);
            if (callback != undefined)
                callback(percentage, loaded - lastLoaded);
            lastLoaded = loaded;
        };
        try {
            xhr.open("GET", url);
            if ((opt === null || opt === void 0 ? void 0 : opt.headers) != undefined) {
                for (const header of opt.headers) {
                    xhr.setRequestHeader(header.name, header.value);
                }
            }
            xhr.responseType = "arraybuffer";
            xhr.send();
        }
        catch (e) {
            (0, Debug_1.error)(`Failed to use XHR object with url ${url}: ${e}`);
        }
    }));
}
exports.downloadAsync = downloadAsync;
