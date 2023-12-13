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
exports.mavenToArray = exports.readJarMetaInf = exports.extractSpecificFile = exports.getAllFile = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const fs_extra_1 = require("fs-extra");
const path_1 = __importDefault(require("path"));
const child_process_1 = __importDefault(require("child_process"));
const const_1 = require("./const");
const DownloadGame_1 = require("../App/DownloadGame");
const Utils_1 = require("./Utils");
function getAllFile(pathDir) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let files = [];
            yield promises_1.default.readdir(pathDir, { withFileTypes: true }).then((items) => __awaiter(this, void 0, void 0, function* () {
                if (items === null)
                    return files;
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
                resolve(files);
            })).catch((err) => reject(err));
        }));
    });
}
exports.getAllFile = getAllFile;
function extractSpecificFile(compressedDirPath, filePath, dest) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            filePath = (0, Utils_1.replaceAll)(filePath, "\\", "/");
            yield (0, DownloadGame_1.downloadAndGetJavaVersion)(DownloadGame_1.JavaVersions.JDK17).then((jarPath) => {
                const jar = path_1.default.join(jarPath, `jar`);
                child_process_1.default.exec(jar + ` --list --file ${compressedDirPath}`, (err, stdout) => __awaiter(this, void 0, void 0, function* () {
                    const files = stdout.split("\r\n");
                    if (err) {
                        reject(err);
                    }
                    for (const n of files) {
                        if (n == filePath) {
                            const proc = child_process_1.default.exec(`"${jar}" xf ${compressedDirPath} ${n}`, { cwd: path_1.default.dirname(compressedDirPath) });
                            proc.on("close", () => __awaiter(this, void 0, void 0, function* () {
                                if (dest != undefined) {
                                    yield (0, fs_extra_1.move)(path_1.default.join(path_1.default.dirname(compressedDirPath), filePath), dest, { overwrite: true }).catch((err) => reject(err));
                                }
                                resolve();
                            }));
                            proc.on("error", (err) => {
                                reject(err);
                            });
                        }
                    }
                }));
            }).catch((err) => reject(err));
            reject(Error(`${filePath} don't exist in ${compressedDirPath}`));
        }));
    });
}
exports.extractSpecificFile = extractSpecificFile;
function readJarMetaInf(jar, attribute) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield extractSpecificFile(jar, "META-INF/MANIFEST.MF", path_1.default.join(const_1.tempPath, "MANIFEST.MF"));
            yield promises_1.default.readFile(path_1.default.join(const_1.tempPath, "MANIFEST.MF"), "utf-8").then((manifest) => __awaiter(this, void 0, void 0, function* () {
                yield promises_1.default.unlink(path_1.default.join(const_1.tempPath, "MANIFEST.MF"));
                const lines = manifest.split("\n");
                const mainClassLine = lines.find((line) => line.startsWith(`${attribute}: `));
                if (mainClassLine === undefined)
                    reject(Error(`Method returned undefined value while retrieving ${attribute} from ${jar}`));
                // @ts-ignore
                resolve(mainClassLine.substring(`${attribute}: `.length));
            })).catch((err) => reject(err));
        }));
    });
}
exports.readJarMetaInf = readJarMetaInf;
function mavenToArray(maven, native, ext) {
    if (!maven.includes(":"))
        return [maven];
    const pathSplit = maven.split(':');
    const fileName = pathSplit[3]
        ? `${pathSplit[2]}-${pathSplit[3]}`
        : pathSplit[2];
    const finalFileName = fileName.includes('@')
        ? fileName.replace('@', '.')
        : `${fileName}${native || ''}.${ext || 'jar'}`;
    return pathSplit[0]
        .split('.')
        .concat(pathSplit[1])
        .concat(pathSplit[2].split('@')[0])
        .concat(`${pathSplit[1]}-${finalFileName}`);
}
exports.mavenToArray = mavenToArray;
