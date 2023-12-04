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
exports.readJarMetaInf = exports.mavenToArray = exports.extractSpecificFile = exports.getAllFile = exports.readDir = exports.makeDir = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const child_process_1 = __importDefault(require("child_process"));
const const_1 = require("./const");
const DownloadGame_1 = require("../App/DownloadGame");
const Utils_1 = require("./Utils");
const Debug_1 = require("./Debug");
function makeDir(path, options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield promises_1.default.mkdir(path, { mode: options === null || options === void 0 ? void 0 : options.mode, recursive: (options === null || options === void 0 ? void 0 : options.recursive) === undefined ? true : options.recursive });
            (0, Debug_1.info)(`Created folder in ${path}...`);
        }
        catch (e) {
            (0, Debug_1.error)(`Failed to create folder ${path} : ${e}`);
        }
        return path;
    });
}
exports.makeDir = makeDir;
function readDir(path, options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const dir = yield promises_1.default.readdir(path, { recursive: options === null || options === void 0 ? void 0 : options.recursive, withFileTypes: true, encoding: options === null || options === void 0 ? void 0 : options.encoding });
            (0, Debug_1.info)(`Reading directory ${path}...`);
            return dir;
        }
        catch (e) {
            (0, Debug_1.error)(`Failed to read directory ${path}: ${e}`);
        }
        return null;
    });
}
exports.readDir = readDir;
function getAllFile(pathDir) {
    return __awaiter(this, void 0, void 0, function* () {
        let files = [];
        const items = yield readDir(pathDir);
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
        return files;
    });
}
exports.getAllFile = getAllFile;
function extractSpecificFile(compressedDirPath, filePath, dest) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            (0, Debug_1.info)(`Extracting ${filePath} from ${compressedDirPath}...`);
            filePath = (0, Utils_1.replaceAll)(filePath, "\\", "/");
            const jar = path_1.default.join(yield (0, DownloadGame_1.downloadAndGetJavaVersion)(DownloadGame_1.JavaVersions.JDK17), "jar");
            child_process_1.default.exec(jar + ` --list --file ${compressedDirPath}`, (err, stdout) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const files = stdout.split("\r\n");
                for (const n of files) {
                    if (err != null) {
                        (0, Debug_1.error)(`Can't list files in ${compressedDirPath}: ${err}`);
                        reject();
                    }
                    if (n == filePath) {
                        const proc = child_process_1.default.exec(`"${jar}" xf ${compressedDirPath} ${n}`, { cwd: path_1.default.dirname(compressedDirPath) });
                        proc.on("close", (code) => __awaiter(this, void 0, void 0, function* () {
                            if (dest != undefined) {
                                yield fs_extra_1.default.move(path_1.default.join(path_1.default.dirname(compressedDirPath), filePath), dest, { overwrite: true });
                            }
                            (0, Debug_1.info)(`Extracted ${filePath} from ${compressedDirPath}.`);
                            resolve();
                        }));
                        (_a = proc.stderr) === null || _a === void 0 ? void 0 : _a.on("data", (data) => (0, Debug_1.error)(`An error occurred while extracting ${filePath} from ${compressedDirPath}: ${data}`));
                    }
                }
            }));
        }));
    });
}
exports.extractSpecificFile = extractSpecificFile;
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
function readJarMetaInf(jar, attribute) {
    return __awaiter(this, void 0, void 0, function* () {
        yield extractSpecificFile(jar, "META-INF/MANIFEST.MF", path_1.default.join(const_1.tempPath, "MANIFEST.MF"));
        try {
            const manifest = yield promises_1.default.readFile(path_1.default.join(const_1.tempPath, "MANIFEST.MF"), "utf-8");
            yield promises_1.default.unlink(path_1.default.join(const_1.tempPath, "MANIFEST.MF"));
            const lines = manifest.split("\n");
            const mainClassLine = lines.find((line) => line.startsWith(`${attribute}: `));
            return mainClassLine === null || mainClassLine === void 0 ? void 0 : mainClassLine.substring(`${attribute}: `.length);
        }
        catch (e) {
            (0, Debug_1.error)(`Failed to read MANIFEST file of ${jar}: ${e}`);
        }
        return null;
    });
}
exports.readJarMetaInf = readJarMetaInf;
