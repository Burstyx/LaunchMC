const {listProfiles} = require("../../../Utils/HGitHub");
const convertProfileToInstance = require("../../../Utils/HInstance").convertProfileToInstance;
const getInstanceDataOf = require("../../../Utils/HGitHub").getInstanceDataOf;
const getMetadataOf = require("../../../Utils/HGitHub").getMetadataOf;
const getCurrentServerInstanceId = require("../../../App/ServerInstances").getCurrentServerInstanceId;

const serverInstanceAction = document.getElementById("download-instance-action")

console.log(serverInstanceAction)
console.log(serverInstanceAction.onclick)

serverInstanceAction.onclick = async () => {
    const profile = (await listProfiles())[getCurrentServerInstanceId()]

    await convertProfileToInstance(await getMetadataOf(profile), await getInstanceDataOf(profile))
}

console.log(serverInstanceAction.onclick)