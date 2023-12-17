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
exports.filteredMinecraftVersions = void 0;
const HManifests_1 = require("./HManifests");
function filteredMinecraftVersions(opt) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let versions = [];
            yield (0, HManifests_1.minecraftManifest)().then((data) => {
                for (let i = 0; i < data["versions"].length; i++) {
                    if ((data["versions"][i]["type"] == "release" && opt["filterOptions"]["release"])
                        || (data["versions"][i]["type"] == "snapshot" && opt["filterOptions"]["snapshot"])
                        || (data["versions"][i]["type"] == "old_beta" && opt["filterOptions"]["beta"])
                        || (data["versions"][i]["type"] == "old_alpha" && opt["filterOptions"]["alpha"])) {
                        versions.push({
                            id: data["versions"][i]["id"],
                            type: data["versions"][i]["type"],
                            sha1: data["versions"][i]["sha1"],
                            complianceLevel: data["versions"][i]["complianceLevel"]
                        });
                    }
                }
            }).catch((err) => reject(err));
            return versions;
        }));
    });
}
exports.filteredMinecraftVersions = filteredMinecraftVersions;
