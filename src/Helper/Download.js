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
const HDirectoryManager_1 = require("./HDirectoryManager");
// Download url async
function downloadAsync(url, dest, opt) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const destDir = dest.slice(0, dest.lastIndexOf("\\"));
        console.log("destDir:", destDir);
        yield (0, HDirectoryManager_1.makeDir)(destDir);
        const file = fs_1.default.createWriteStream(dest);
        // https.get(url, {headers: {"Content-Type": "application/octet-stream"}}, (res) => {
        //     res.pipe(file)
        //     let len = parseInt(res.headers["content-length"]!, 10);
        //     let cur = 0;
        //     let total = len / 1048576
        //     res.on("data", (chunk) => {                
        //         cur += chunk.length
        //         console.log(100.0 * cur / len);
        //     })
        //     file.on("error", (err) => {
        //         console.error(err);
        //     })
        //     file.on("finish", async () => {
        //         if(opt && opt["decompress"] == true){
        //             const destWithoutExt = dest.substring(0, dest.lastIndexOf("."))
        //             console.log(destWithoutExt);
        //             const zip = new AdmZip(dest)
        //             try{
        //                 zip.extractAllTo(destWithoutExt, true)
        //             }catch(err){
        //                 console.error(err);
        //             }
        //             file.close()
        //             resolve(dest)
        //         }else{
        //             file.close()
        //             resolve(dest)
        //         }
        //     })
        // })
        fetch(url).then(res => {
            res.arrayBuffer().then(arrayBuffer => {
                const buffer = Buffer.from(arrayBuffer);
                fs_1.default.writeFile(dest, buffer, err => {
                    if (err) {
                        console.error(err);
                    }
                    else {
                        console.log("téléchargement parfait");
                        if (opt && opt["decompress"] == true) {
                            const destWithoutExt = dest.substring(0, dest.lastIndexOf("."));
                            const zip = new adm_zip_1.default(dest);
                            try {
                                zip.extractAllTo(destWithoutExt, true);
                            }
                            catch (err) {
                                console.error(err);
                            }
                            file.close();
                            resolve(dest);
                        }
                        else {
                            file.close();
                            resolve(dest);
                        }
                    }
                });
            });
        });
        // Download the file with fetch and resolve response
        // const response = await fetch(url)
        // // Get buffer
        // const arrayBuffer = await response.arrayBuffer()
        // const buffer = Buffer.from(arrayBuffer)
        // const interval = setInterval(async () => {
        //     const reader = await res.body!.getReader().read()
        //     response..on("data", (chunk) => {
        //     })
        //     const sizeToDownload = opt!.size;
        //     const sizeDownloaded = reader!.value?.length
        //     if(reader!.done){
        //         clearInterval(interval)
        //     }
        //     console.log((sizeDownloaded! * 100)/sizeToDownload!);
        // }, 1000)
        // file.write(buffer)   
        // Write buffer
    }));
}
exports.downloadAsync = downloadAsync;
