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
// Get all Minecraft version with filtering options
function filteredMinecraftVersions(opt) {
    return __awaiter(this, void 0, void 0, function* () {
        var versions = [];
        yield (0, HManifests_1.minecraftManifest)().then((data) => {
            for (var i = 0; i < data["versions"].length; i++) {
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
        });
        // for(let i = 0; i < data["versions"].length; i++){
        //     // Create a version button if filter accept it
        //     if((data["versions"][i]["type"] == "release" && release)
        //     || (data["versions"][i]["type"] == "snapshot" && snapshot)
        //     || (data["versions"][i]["type"] == "old_beta" && beta)
        //     || (data["versions"][i]["type"] == "old_alpha" && alpha)){
        //         // Create version button element
        //         let versionParent = document.createElement("div")
        //         versionParent.id = "vanilla-" + data["versions"][i]["id"]
        //         versionParent.className = "vanillabootloaderinformation bootloaderinformation"
        //         // Create version label for the button element
        //         let version = document.createElement("p")
        //         version.innerText = data["versions"][i]["id"]
        //         // Create version type label for the button element
        //         let versionState = document.createElement("p")
        //         versionState.innerText = data["versions"][i]["type"]
        //         versionParent.appendChild(version)
        //         versionParent.appendChild(versionState)
        //         parentList.appendChild(versionParent)
        //     }
        // }
        // loading.style.display = "none"
        // if(parentList.children.length == 0){
        //     notFound.style.display = "block"
        // }else{
        //     notFound.style.display = "none"
        // }
        return versions;
    });
}
exports.filteredMinecraftVersions = filteredMinecraftVersions;
