const {listProfiles} = require("../../../Utils/HRemoteProfiles");
const {downloadServerInstance, verifyInstanceFromRemote} = require("../../../App/ServerInstances");
const DownloadInstances = require("../../../App/DownloadInstances");
const ServerInstances = require("../../../App/ServerInstances");
const {startMinecraft, killGame} = require("../../../App/StartMinecraft");
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

    await listProfiles().then(async (profile) => {

        DownloadInstances.updateInstanceState(currentInstanceOpened, DownloadInstances.InstanceState.Loading)

        await downloadServerInstance({
            name: currentInstanceOpened,
            thumbnailPath: profile[currentInstanceOpened]["thumbnailUrl"],
            logoPath: profile[currentInstanceOpened]["brandLogoUrl"],
            version: profile[currentInstanceOpened]["version"]
        }).then(() => {
            DownloadInstances.updateInstanceState(currentInstanceOpened, DownloadInstances.InstanceState.Owned)
        }).catch((err) => {
            console.error(`Une erreur est survenue lors du téléchargement de l'instance pour ${currentInstanceOpened}: ${err}`)
            DownloadInstances.updateInstanceState(currentInstanceOpened, DownloadInstances.InstanceState.ToDownload)
        })
    }).catch((err) => {
        console.error(`Une erreur est survenue lors de la récupération des profiles sur les serveurs de Github: ${err}`)
    })
}

const serverInstanceAction = document.getElementById("server-instance-action")

serverInstanceAction.onclick = async () => {
    const currentInstanceOpened = ServerInstances.currentInstanceOpened
    const currentState = ServerInstances.instancesStates[currentInstanceOpened]

    switch (currentState) {
        case ServerInstances.InstanceState.NeedUpdate:
            // Update
            return;
        case ServerInstances.InstanceState.Playing:
            if(killGame(currentInstanceOpened)) {
                ServerInstances.updateInstanceState(currentInstanceOpened, ServerInstances.InstanceState.Playable)
            } else {
                console.error(`Impossible de forcer l'arrêt du jeu`)
            }
            return;
        case ServerInstances.InstanceState.Loading:
            // Do nothing
            return
    }

    ServerInstances.updateInstanceState(currentInstanceOpened, ServerInstances.InstanceState.Loading)

    await getActiveAccount().then(async (acc) => {
        await ServerInstances.getInstanceData(currentInstanceOpened).then(async (data) => {
            await verifyInstanceFromRemote(currentInstanceOpened).then(async () => {
                await startMinecraft(currentInstanceOpened, {
                    version: data["data"]["game"]["version"],
                    accessToken: acc["access_token"],
                    username: acc["username"],
                    uuid: acc["uuid"]
                }, (err) => {
                    ServerInstances.updateInstanceState(currentInstanceOpened, ServerInstances.InstanceState.Playable)
                    console.log(`Le jeu de l'instance ${currentInstanceOpened} a été/s'est arrêté en renvoyant le message suivant: ${err}`)
                }, data["data"]["loader"]["id"]).then(() => {
                    ServerInstances.updateInstanceState(currentInstanceOpened, ServerInstances.InstanceState.Playing)
                }).catch((err) => {
                    ServerInstances.updateInstanceState(currentInstanceOpened, ServerInstances.InstanceState.Playable)
                    console.error(`Impossible de lancer le jeu pour ${currentInstanceOpened}: ${err}`)
                })
            }).catch((err) => {
                ServerInstances.updateInstanceState(currentInstanceOpened, ServerInstances.InstanceState.Playable)
                console.error(`Impossible de mettre à jour l'instance: ${err}`)
            })
        }).catch((err) => {
            ServerInstances.updateInstanceState(currentInstanceOpened, ServerInstances.InstanceState.Playable)
            console.error(`Une erreur est survenue lors de la récupération des informations de l'instance ${currentInstanceOpened}: ${err}`)
        })
    }).catch((err) => {
        ServerInstances.updateInstanceState(currentInstanceOpened, ServerInstances.InstanceState.Playable)
        console.error(`Aucun compte actif trouvé, connectez vous à votre compte Microsoft pour jouer: ${err}`)
    })
}

exports.refreshConsole = () => {

}