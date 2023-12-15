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
exports.addInstanceElement = exports.generateInstanceBtn = void 0;
const { openPopup } = require("../Interface/UIElements/scripts/window.js");
function generateInstanceBtn(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const instanceElement = document.createElement("div");
        const textElement = document.createElement("p");
        textElement.innerText = opts.name;
        instanceElement.append(textElement);
        instanceElement.id = opts.name;
        instanceElement.classList.add("instance");
        return instanceElement;
    });
}
exports.generateInstanceBtn = generateInstanceBtn;
function addInstanceElement(instanceOpts, parentDiv) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield generateInstanceBtn(instanceOpts).then((instanceElement) => {
                parentDiv.appendChild(instanceElement);
                resolve(instanceElement);
            }).catch((err) => reject(err));
        }));
    });
}
exports.addInstanceElement = addInstanceElement;
/*export function updateInstanceDlProgress(instanceId: string, progress: number) {
    const instance = document.getElementById(instanceId)

    const dlTracker = instance?.firstElementChild

    if(dlTracker == null) {
        return
    }

    console.log(progress);



    //@ts-ignore
    dlTracker.style.left = `${progress}%`;
    //@ts-ignore
    dlTracker.style.width = 100 - Number(dlTracker.style.left.substring(0, dlTracker.style.left.length - 1)) + '%';

}*/
/*export async function checkForUpdate(instanceId: string) {
    await updateInstanceDlState(instanceId, InstanceState.Loading)

    let updateFound = false

    // Check difference between this instance version and the serverside instance version
    // If version is different, delete game files and replace them and update instance properties

    if(updateFound) await updateInstanceDlState(instanceId, InstanceState.Update)

    await updateInstanceDlState(instanceId, InstanceState.Playable)
}*/
/*export async function checkInstanceIntegrity(instanceId: string) {
    await updateInstanceDlState(instanceId, InstanceState.Verification)

    // TODO: Code

    await updateInstanceDlState(instanceId, InstanceState.Playable)
}*/
/*
export async function verifyInstanceFromRemote(name: string) {
    const profiles = await listProfiles()

    console.log(profiles)// @ts-ignore// @ts-ignore
    console.log(profiles.hasOwnProperty(name))

    // @ts-ignore
    if(!profiles.hasOwnProperty(name)) return;

    const metadata = await getMetadataOf(profiles![name])

    console.log(metadata)

    // Delete files not in server side
    const folders = metadata["folders"]
    for (const folder of folders) {
        await fs.rmdir(path.join(instancesPath, name, folder), {recursive: true})
    }

    // Download files not in the local side
    for (const fileData of metadata["files"]) {
        if(!existsSync(path.join(instancesPath, name, fileData["path"]))) {
            await downloadAsync(fileData["url"], path.join(instancesPath, name, fileData["path"]))
            console.log("downloaded: " + fileData["path"] + " from " + fileData["url"])
        }
    }
}*/
