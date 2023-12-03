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
exports.generateProfileBtn = void 0;
const HGitHub_1 = require("./HGitHub");
const HInstance_1 = require("./HInstance");
function generateProfileBtn() {
    return __awaiter(this, void 0, void 0, function* () {
        const profiles = yield (0, HGitHub_1.listProfiles)();
        const profileList = document.getElementById("profile-list");
        profileList.innerHTML = "";
        for (const name in profiles) {
            const profileElement = document.createElement("div");
            profileElement.classList.add("default-btn", "interactable", "profile");
            profileElement.style.width = "200px";
            profileElement.style.height = "100px";
            profileElement.innerText = name;
            profileElement.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
                const metadata = yield (0, HGitHub_1.getMetadataOf)(profiles[name]);
                const instanceData = yield (0, HGitHub_1.getInstanceDataOf)(profiles[name]);
                console.log(metadata);
                console.log(instanceData);
                yield (0, HInstance_1.convertProfileToInstance)(metadata, instanceData);
            }));
            profileList.appendChild(profileElement);
        }
    });
}
exports.generateProfileBtn = generateProfileBtn;
