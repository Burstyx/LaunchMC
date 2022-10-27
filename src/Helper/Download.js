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
const fs_1 = require("fs");
const extract_zip_1 = __importDefault(require("extract-zip"));
// Download url async
function downloadAsync(url, dest, opt) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const file = (0, fs_1.createWriteStream)(dest);
        // Download the file with fetch and resolve response
        yield fetch(url).then((res) => __awaiter(this, void 0, void 0, function* () {
            // Get buffer
            const arrayBuffer = yield res.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            console.log(arrayBuffer.byteLength);
            // Write buffer
            file.write(buffer);
            if (opt && opt["decompress"] == true) {
                const destWithoutExt = dest.substring(0, dest.lastIndexOf("."));
                console.log(destWithoutExt);
                yield (0, extract_zip_1.default)(dest, { dir: destWithoutExt });
                resolve(res);
                0;
            }
            else {
                resolve(res);
            }
        })).catch((err) => reject(err));
    }));
}
exports.downloadAsync = downloadAsync;
