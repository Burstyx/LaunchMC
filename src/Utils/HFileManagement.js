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
exports.mavenToArray = exports.extractAll = exports.extractFilesWithExt = exports.extractSpecificFile = exports.getAllFile = exports.makeDir = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const child_process_1 = __importDefault(require("child_process"));
const fs_1 = require("fs");
const const_1 = require("./const");
function makeDir(path) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(0, fs_1.existsSync)(path))
            yield promises_1.default.mkdir(path, { recursive: true });
        return path;
    });
}
exports.makeDir = makeDir;
function getAllFile(pathDir) {
    return __awaiter(this, void 0, void 0, function* () {
        let files = [];
        const items = yield promises_1.default.readdir(pathDir, { withFileTypes: true });
        for (const item of items) {
            if (item.isDirectory()) {
                files = [
                    ...files,
                    ...(yield getAllFile(path_1.default.join(pathDir, item.name)))
                ];
            }
            else {
                files.push(path_1.default.join(pathDir, item.name));
            }
        }
        return files;
    });
}
exports.getAllFile = getAllFile;
function extractSpecificFile(compressedDirPath, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((res, rej) => {
            const jar = path_1.default.join(const_1.javaPath, const_1.java17Version, const_1.java17Name, "bin", "jar");
            child_process_1.default.exec(jar + ` --list --file ${compressedDirPath}`, (err, stdout) => __awaiter(this, void 0, void 0, function* () {
                const files = stdout.split("\r\n");
                console.log(files);
                for (const n of files) {
                    if (err != null) {
                        console.error(err);
                        rej();
                    }
                    if (n == filePath) {
                        child_process_1.default.exec(`${jar} xf ${compressedDirPath} ${n}`, { cwd: const_1.gamePath }).addListener("close", (code) => { console.log(code); res(); });
                    }
                }
            }));
        });
    });
}
exports.extractSpecificFile = extractSpecificFile;
function extractFilesWithExt(compressedDirPath, ext) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
exports.extractFilesWithExt = extractFilesWithExt;
function extractAll(compressedDirPath, dest) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
exports.extractAll = extractAll;
function mavenToArray(maven, ext) {
    return __awaiter(this, void 0, void 0, function* () {
        let mavenArray = [];
        const mavenParts = maven.split(":");
        const linkParts = mavenParts[0].split(".");
        mavenArray = linkParts.concat(mavenParts.slice(1));
        mavenArray.push(`${mavenParts[mavenParts.length - 2]}-${mavenParts[mavenParts.length - 1]}.${ext != undefined ? ext : "jar"}`);
        return mavenArray;
    });
}
exports.mavenToArray = mavenToArray;
