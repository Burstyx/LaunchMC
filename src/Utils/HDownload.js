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
const fs_1 = __importDefault(require("fs"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const HFileManagement_1 = require("./HFileManagement");
// Download url async
function downloadAsync(url, dest, callback, opt) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const destDir = dest.slice(0, dest.lastIndexOf("\\"));
        console.log("destDir:", destDir);
        console.log("dest:", dest);
        yield (0, HFileManagement_1.makeDir)(destDir);
        const file = fs_1.default.createWriteStream(dest);
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    const responseArrayBuffer = xhr.response;
                    const buffer = Buffer.from(responseArrayBuffer);
                    file.write(buffer);
                    console.log("téléchargement terminé");
                    if (opt && opt["decompress"] == true) {
                        console.log("décompression....");
                        const destWithoutExt = dest.substring(0, dest.lastIndexOf("."));
                        const zip = new adm_zip_1.default(dest);
                        try {
                            zip.extractAllTo(destWithoutExt, true);
                            console.log("décompressé !");
                        }
                        catch (err) {
                            console.error(err);
                        }
                    }
                    file.close();
                    resolve(dest);
                }
                else {
                    console.log("erreur de téléchargement");
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
        xhr.open("GET", url);
        if ((opt === null || opt === void 0 ? void 0 : opt.headers) != undefined) {
            for (const header of opt.headers) {
                xhr.setRequestHeader(header.name, header.value);
            }
        }
        xhr.responseType = "arraybuffer";
        xhr.send();
    }));
}
exports.downloadAsync = downloadAsync;
