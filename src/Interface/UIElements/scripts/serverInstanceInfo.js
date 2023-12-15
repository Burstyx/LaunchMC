const {listProfiles} = require("../../../Utils/HRemoteProfiles");
const {refreshServerInstanceList, updateInstanceDlState, InstanceState, updateDlServerInstanceState} = require("../../../Utils/HInstance");
const convertProfileToInstance = require("../../../Utils/HInstance").convertProfileToInstance;
const getInstanceDataOf = require("../../../Utils/HRemoteProfiles").getInstanceDataOf;
const getMetadataOf = require("../../../Utils/HRemoteProfiles").getMetadataOf;
const getCurrentServerInstanceId = require("../../../App/ServerInstances").getCurrentServerInstanceId;

const serverInstanceAction = document.getElementById("download-instance-action")

console.log(serverInstanceAction)
console.log(serverInstanceAction.onclick)

serverInstanceAction.onclick = async () => {
    const profile = (await listProfiles())[getCurrentServerInstanceId()]
    await updateDlServerInstanceState(profile["name"], InstanceState.Loading)

    await convertProfileToInstance(await getMetadataOf(profile), await getInstanceDataOf(profile))
}

console.log(serverInstanceAction.onclick)