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
const checksum_1 = __importDefault(require("checksum"));
const fs_extra_1 = require("fs-extra");
const fs_1 = require("fs");
// Download url async
function downloadAsync(url, dest, callback, opt) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        if ((0, fs_1.existsSync)(dest) && (opt === null || opt === void 0 ? void 0 : opt.hash)) {
            checksum_1.default.file(dest, (err, hash) => {
                if (hash === opt.hash) {
                    console.log("Fichier existe déjà et n'est pas corrompu, fichier passé.");
                    resolve(dest);
                }
            });
        }
        const destDir = dest.slice(0, dest.lastIndexOf("\\"));
        yield promises_1.default.mkdir(destDir, { recursive: true }).catch((err) => reject(err));
        const file = (0, fs_extra_1.createWriteStream)(dest);
        const xhr = new XMLHttpRequest();
        file.on("error", (err) => {
            file.close();
            reject(err);
        });
        xhr.onreadystatechange = () => __awaiter(this, void 0, void 0, function* () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    const responseArrayBuffer = xhr.response;
                    const buffer = Buffer.from(responseArrayBuffer);
                    file.on("finish", () => __awaiter(this, void 0, void 0, function* () {
                        if (opt && opt["decompress"] == true) {
                            const destWithoutExt = dest.substring(0, dest.lastIndexOf("."));
                            const zip = new adm_zip_1.default(dest);
                            zip.extractAllTo(destWithoutExt, true); // FIXME: launcher freeze during decompressing
                            yield promises_1.default.rm(dest).catch((err) => {
                                file.close();
                                reject(err);
                            });
                        }
                    }));
                    file.write(buffer, (err) => {
                        if (err) {
                            file.close();
                            reject(err);
                        }
                    });
                    file.close((err) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            // Check file hash
                            if ((opt === null || opt === void 0 ? void 0 : opt.hash) != undefined) {
                                checksum_1.default.file(dest, (err, hash) => __awaiter(this, void 0, void 0, function* () {
                                    console.log(hash + " is a valid hash!");
                                    if (hash !== opt.hash) {
                                        if (opt.retry != undefined) {
                                            if (opt.retry.count > 0) {
                                                yield promises_1.default.rm(dest).catch((err) => {
                                                    reject(err);
                                                });
                                                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                                                    yield downloadAsync(url, dest, callback, { retry: { count: opt.retry.count - 1, timeout: opt.retry.timeout }, hash: opt.hash, headers: opt.headers, decompress: opt.decompress })
                                                        .then((res) => resolve(res))
                                                        .catch((err) => {
                                                        reject(err);
                                                    });
                                                }), opt.retry.timeout);
                                            }
                                            else {
                                                reject(err);
                                            }
                                        }
                                    }
                                    else {
                                        resolve(dest);
                                    }
                                }));
                            }
                            else {
                                resolve(dest);
                            }
                        }
                    });
                }
                else {
                    if ((opt === null || opt === void 0 ? void 0 : opt.retry) != undefined) {
                        if (opt.retry.count > 0) {
                            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                                file.close();
                                yield downloadAsync(url, dest, callback, { retry: { count: opt.retry.count - 1, timeout: opt.retry.timeout }, hash: opt.hash, headers: opt.headers, decompress: opt.decompress })
                                    .then((res) => resolve(res))
                                    .catch((err) => {
                                    reject(err);
                                });
                            }), opt.retry.timeout);
                        }
                        else {
                            file.close();
                            reject();
                        }
                    }
                    else {
                        file.close();
                        reject();
                    }
                }
            }
        });
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
            xhr.setRequestHeader("Cache-Control", "no-cache");
            if ((opt === null || opt === void 0 ? void 0 : opt.headers) != undefined) {
                for (const header of opt.headers) {
                    xhr.setRequestHeader(header.name, header.value);
                }
            }
            xhr.responseType = "arraybuffer";
            xhr.send();
        }
        catch (err) {
            file.close();
            reject(err);
        }
    }));
}
exports.downloadAsync = downloadAsync;
