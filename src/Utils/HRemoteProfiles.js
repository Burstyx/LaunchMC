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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstanceDataOf = exports.getMetadataOf = exports.listProfiles = exports.getLatestRelease = void 0;
function getLatestRelease() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const myHeaders = new Headers();
            myHeaders.append("Accept", "application/vnd.github+json");
            myHeaders.append("X-GitHub-Api-Version", "2022-11-28");
            yield fetch("https://api.github.com/repos/tonityg/RubyClientReleases/releases/latest", {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow'
            })
                .then((response) => __awaiter(this, void 0, void 0, function* () { return yield response.json().then((data) => resolve(data)); }))
                .catch((err) => {
                reject(err);
            });
        }));
    });
}
exports.getLatestRelease = getLatestRelease;
function listProfiles() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const myHeaders = new Headers();
            myHeaders.append("Accept", "application/vnd.github+json");
            myHeaders.append("X-GitHub-Api-Version", "2022-11-28");
            yield fetch("https://raw.githubusercontent.com/tonityg/RubyClientReleases/main/profiles.json", {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow'
            })
                .then((response) => __awaiter(this, void 0, void 0, function* () { return yield response.json().then((data) => resolve(data)); }))
                .catch((err) => {
                reject(err);
            });
        }));
    });
}
exports.listProfiles = listProfiles;
function getMetadataOf(name) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield listProfiles().then((res) => __awaiter(this, void 0, void 0, function* () {
                yield fetch(res[name]["metadataUrl"]).then((res) => {
                    res.json().then((json) => {
                        resolve(json);
                    }).catch((err) => {
                        reject(err);
                    });
                }).catch((err) => {
                    reject(err);
                });
            })).catch((err) => reject(err));
        }));
    });
}
exports.getMetadataOf = getMetadataOf;
function getInstanceDataOf(name) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield listProfiles().then((res) => __awaiter(this, void 0, void 0, function* () {
                yield fetch(res[name]["instanceUrl"]).then((res) => {
                    res.json().then((json) => {
                        resolve(json);
                    }).catch((err) => {
                        reject(err);
                    });
                }).catch((err) => {
                    reject(err);
                });
            })).catch((err) => reject(err));
        }));
    });
}
exports.getInstanceDataOf = getInstanceDataOf;
