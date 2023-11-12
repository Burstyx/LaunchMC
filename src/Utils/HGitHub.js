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
exports.getLatestRelease = void 0;
function getLatestRelease() {
    return __awaiter(this, void 0, void 0, function* () {
        var myHeaders = new Headers();
        myHeaders.append("Accept", "application/vnd.github+json");
        myHeaders.append("X-GitHub-Api-Version", "2022-11-28");
        let latestRelease = null;
        yield fetch("https://api.github.com/repos/tonityg/RubyClientReleases/releases/latest", {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        })
            .then((response) => __awaiter(this, void 0, void 0, function* () {
            return yield response.json().then((data) => {
                latestRelease = data;
            });
        }))
            .catch(error => console.log("Can't retrieve latest release on GitHub... Can't check for update."));
        return latestRelease;
    });
}
exports.getLatestRelease = getLatestRelease;
