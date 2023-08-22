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
exports.readJarMetaInf = exports.mavenToArray = exports.extractAll = exports.extractFilesWithExt = exports.extractSpecificFile = exports.getAllFile = exports.makeDir = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const child_process_1 = __importDefault(require("child_process"));
const fs_1 = require("fs");
const const_1 = require("./const");
const DownloadGame_1 = require("../App/DownloadGame");
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
function extractSpecificFile(compressedDirPath, filePath, dest) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
            const jar = path_1.default.join(yield (0, DownloadGame_1.downloadAndGetJavaVersion)(DownloadGame_1.JavaVersions.JDK17), "jar");
            console.log(`Extracting ${filePath} from ${compressedDirPath}...`);
            child_process_1.default.exec(jar + ` --list --file ${compressedDirPath}`, (err, stdout) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const files = stdout.split("\r\n");
                for (const n of files) {
                    if (err != null) {
                        console.error(err);
                        rej();
                    }
                    if (n == filePath) {
                        const proc = child_process_1.default.exec(`"${jar}" xf ${compressedDirPath} ${n}`, { cwd: path_1.default.dirname(compressedDirPath) });
                        proc.on("close", (code) => __awaiter(this, void 0, void 0, function* () {
                            console.log("Exited with code " + code);
                            if (dest != undefined) {
                                yield fs_extra_1.default.move(path_1.default.join(path_1.default.dirname(compressedDirPath), filePath), dest, { overwrite: true });
                            }
                            res();
                        }));
                        (_a = proc.stderr) === null || _a === void 0 ? void 0 : _a.on("data", (data) => console.error(data));
                    }
                }
            }));
        }));
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
function mavenToArray(maven, native, ext) {
    // let mavenArray: string[] = []
    // console.log("Here maven to array way");
    // const mavenExt = maven.split("@")[1]
    // console.log("mavenExt: " + mavenExt);
    // maven = maven.split("@")[0]
    // console.log("maven: " + maven);
    // const mavenParts = maven.split(":")
    // console.log("mavenParts: " + mavenParts);
    // const linkParts = mavenParts[0].split(".")
    // console.log("linkParts: " + linkParts);
    // mavenArray = linkParts.concat(mavenParts.slice(1))
    // console.log("mavenArray: " + mavenArray);
    // mavenArray.push(`${mavenParts[mavenParts.length - 2]}-${mavenParts[mavenParts.length - 1]}${native ? `-${native}` : ""}.${ext != undefined ? ext : mavenExt != undefined ? mavenExt : "jar"}`)
    // console.log("mavenArray: " + mavenArray);
    // return mavenArray
    const pathSplit = maven.split(':');
    const fileName = pathSplit[3]
        ? `${pathSplit[2]}-${pathSplit[3]}`
        : pathSplit[2];
    const finalFileName = fileName.includes('@')
        ? fileName.replace('@', '.')
        : `${fileName}${native || ''}${ext || '.jar'}`;
    const initPath = pathSplit[0]
        .split('.')
        .concat(pathSplit[1])
        .concat(pathSplit[2].split('@')[0])
        .concat(`${pathSplit[1]}-${finalFileName}`);
    return initPath;
}
exports.mavenToArray = mavenToArray;
function readJarMetaInf(jar, attribute) {
    return __awaiter(this, void 0, void 0, function* () {
        yield extractSpecificFile(jar, "META-INF/MANIFEST.MF", path_1.default.join(const_1.tempPath, "MANIFEST.MF"));
        const manifest = yield promises_1.default.readFile(path_1.default.join(const_1.tempPath, "MANIFEST.MF"), "utf-8");
        yield promises_1.default.unlink(path_1.default.join(const_1.tempPath, "MANIFEST.MF"));
        const lines = manifest.split("\n");
        const mainClassLine = lines.find((line) => line.startsWith(`${attribute}: `));
        return mainClassLine === null || mainClassLine === void 0 ? void 0 : mainClassLine.substring(`${attribute}: `.length);
    });
}
exports.readJarMetaInf = readJarMetaInf;
