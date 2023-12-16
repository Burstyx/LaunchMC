const {listProfiles, getInstanceDataOf} = require("../../../Utils/HRemoteProfiles");
const {downloadServerInstance} = require("../../../App/ServerInstances");
const DownloadInstances = require("../../../App/DownloadInstances");
const ServerInstances = require("../../../App/ServerInstances");
const {startMinecraft} = require("../../../App/StartMinecraft");
const {getActiveAccount} = require("../../../Utils/HMicrosoft");

const downloadInstanceAction = document.getElementById("download-instance-action")

downloadInstanceAction.onclick = async () => {
    const currentInstanceOpened = DownloadInstances.currentInstanceOpened
    const currentState = DownloadInstances.instancesStates[currentInstanceOpened]

    switch (currentState) {
        case DownloadInstances.InstanceState.Owned:
            return
        case DownloadInstances.InstanceState.Loading:
            return
    }

    const profile = (await listProfiles())[currentInstanceOpened]

    await DownloadInstances.updateInstanceState(profile["name"], DownloadInstances.InstanceState.Loading)

    await downloadServerInstance({
        name: profile["name"],
        thumbnailPath: profile["thumbnailUrl"],
        logoPath: profile["brandLogoUrl"],
        version: profile["version"]
    })

    await DownloadInstances.updateInstanceState(profile["name"], DownloadInstances.InstanceState.Owned)
}

const serverInstanceAction = document.getElementById("server-instance-action")

serverInstanceAction.onclick = async () => {
    const currentInstanceOpened = ServerInstances.currentInstanceOpened
    const currentState = ServerInstances.instancesStates[currentInstanceOpened]

    switch (currentState) {
        case ServerInstances.InstanceState.NeedUpdate:
            return
        case ServerInstances.InstanceState.Playing:
            return
        case ServerInstances.InstanceState.Loading:
            return
    }

    ServerInstances.updateInstanceState(currentInstanceOpened, ServerInstances.InstanceState.Loading)

    const data = await ServerInstances.getInstanceData(currentInstanceOpened)
    const account = await getActiveAccount()

    await startMinecraft(data["data"]["instance"]["name"], {
        version: data["data"]["game"]["version"],
        accessToken: account["access_token"],
        username: account["username"],
        uuid: account["uuid"]
    }, data["data"]["loader"]["id"])

    await ServerInstances.updateInstanceState(data["data"]["instance"]["name"], ServerInstances.InstanceState.Playing)
}