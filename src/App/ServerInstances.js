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
exports.addServerInstancesTo = void 0;
const HGitHub_1 = require("../Utils/HGitHub");
const HInstance_1 = require("../Utils/HInstance");
function addServerInstancesTo() {
    return __awaiter(this, void 0, void 0, function* () {
        const profileList = yield (0, HGitHub_1.listProfiles)();
        console.log(profileList);
        const thumbnailImage = profileList["thumbnailUrl"];
        const name = profileList["name"];
        yield (0, HInstance_1.addInstanceElement)(thumbnailImage, name, document.getElementById("avail-servers"));
    });
}
exports.addServerInstancesTo = addServerInstancesTo;
