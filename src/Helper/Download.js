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
// Download url async
function downloadAsync(url, dest) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const file = fs_1.default.createWriteStream(dest);
            // Download the file with fetch and resolve response
            fetch(url).then((res) => __awaiter(this, void 0, void 0, function* () {
                // Get buffer
                const arrayBuffer = yield res.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                console.log(arrayBuffer.byteLength);
                // Write buffer
                file.write(buffer);
                file.close((err) => reject(err));
                resolve(res);
            })).catch((err) => reject(err));
        });
    });
}
exports.downloadAsync = downloadAsync;
