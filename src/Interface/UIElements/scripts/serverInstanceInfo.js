const {listProfiles} = require("../../../Utils/HRemoteProfiles");
const {downloadServerInstance} = require("../../../App/ServerInstances");
const {updateInstanceState, InstanceState, instancesStates} = require("../../../App/DownloadInstances");

const serverInstanceAction = document.getElementById("download-instance-action")

serverInstanceAction.onclick = async () => {
    const currentInstanceOpened = require("../../../App/DownloadInstances").currentInstanceOpened
    const currentState = instancesStates[currentInstanceOpened]

    switch (currentState) {
        case InstanceState.Owned:
            return
        case InstanceState.Loading:
            return
    }

    console.log(currentInstanceOpened)
    const profile = (await listProfiles())[currentInstanceOpened]

    await updateInstanceState(profile["name"], InstanceState.Loading)

    await downloadServerInstance({
        name: profile["name"],
        thumbnailPath: profile["thumbnailUrl"],
        coverPath: profile["coverUrl"],
        version: profile["version"]
    })

    await updateInstanceState(profile["name"], InstanceState.Owned)
}