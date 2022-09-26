"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMinecraftVersions = void 0;
function getMinecraftVersions(parentList, loading, release, snapshot, beta, alpha) {
    //@ts-ignore
    loading.style.display = "block";
    fetch("https://piston-meta.mojang.com/mc/game/version_manifest.json").then((res) => {
        res.json().then((data) => {
            let i = 0;
            for (let i = 0; i < data["versions"].length; i++) {
                if ((data["versions"][i]["type"] == "release" && release)
                    || (data["versions"][i]["type"] == "snapshot" && snapshot)
                    || (data["versions"][i]["type"] == "old_beta" && beta)
                    || (data["versions"][i]["type"] == "old_alpha" && alpha)) {
                    let versionParent = document.createElement("p");
                    versionParent.id = "vanillaversion" + i;
                    versionParent.className = "bootloaderinformation";
                    let version = document.createElement("p");
                    version.innerText = data["versions"][i]["id"];
                    let versionState = document.createElement("p");
                    versionState.innerText = data["versions"][i]["type"];
                    versionParent.appendChild(version);
                    versionParent.appendChild(versionState);
                    parentList.appendChild(versionParent);
                    i++;
                }
            }
        }).then(() => {
            //@ts-ignore
            loading.style.display = "none";
        });
    });
}
exports.getMinecraftVersions = getMinecraftVersions;
