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
exports.getCurrentServerInstanceId = exports.addServerInstancesTo = void 0;
const HGitHub_1 = require("../Utils/HGitHub");
const HInstance_1 = require("../Utils/HInstance");
const { openPopup } = require("../Interface/UIElements/scripts/window.js");
let currentServerInstanceId = "";
function addServerInstancesTo() {
    return __awaiter(this, void 0, void 0, function* () {
        const availServerDiv = document.getElementById("avail-servers");
        const profileList = yield (0, HGitHub_1.listProfiles)();
        availServerDiv.innerHTML = "";
        // @ts-ignore
        for (const profile in profileList) {
            const element = yield (0, HInstance_1.addInstanceElement)(profileList[profile]["thumbnailUrl"], profile, availServerDiv);
            element.addEventListener("click", () => {
                openPopup("download-instance-info");
                currentServerInstanceId = profileList[profile]["name"];
            });
        }
    });
}
exports.addServerInstancesTo = addServerInstancesTo;
function getCurrentServerInstanceId() {
    return currentServerInstanceId;
}
exports.getCurrentServerInstanceId = getCurrentServerInstanceId;
