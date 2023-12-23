const {listProfiles} = require("../../../Utils/HRemoteProfiles");
const {downloadServerInstance, verifyInstanceFromRemote} = require("../../../App/ServerInstances");
const DownloadInstances = require("../../../App/DownloadInstances");
const ServerInstances = require("../../../App/ServerInstances");
const {startMinecraft, killGame} = require("../../../App/StartMinecraft");
const {getActiveAccount} = require("../../../Utils/HMicrosoft");
const {InstanceState, instancesStates, currentOpenedInstance} = require("../../../Utils/HInstance");
const {clearConsole, copyConsoleToClipboard} = require("../../../App/GameConsole");

const instanceAction = document.getElementById("instance-action")

instanceAction.onclick = async () => {
    const currentOpenedInstance = require("../../../Utils/HInstance").currentOpenedInstance
    const currentState = instancesStates[currentOpenedInstance]

    switch (currentState) {
        case InstanceState.NeedUpdate:
            // Update
            return;
        case InstanceState.Playing:
            if(killGame(currentOpenedInstance)) {
                ServerInstances.updateInstanceState(currentOpenedInstance, InstanceState.Playable)
            } else {
                console.error(`Impossible de forcer l'arrêt du jeu`)
            }
            return;
        case InstanceState.ToDownload:
            await listProfiles().then(async (profile) => {

                DownloadInstances.updateInstanceState(currentOpenedInstance, InstanceState.Loading)

                await downloadServerInstance({
                    name: currentOpenedInstance,
                    thumbnailPath: profile[currentOpenedInstance]["thumbnailUrl"],
                    logoPath: profile[currentOpenedInstance]["brandLogoUrl"],
                    version: profile[currentOpenedInstance]["version"]
                }).then(async () => {
                    await ServerInstances.refreshInstanceList().catch((err) => console.error(`Impossible de mettre à jour la liste des instances de serveurs : ${err}`))
                    await DownloadInstances.refreshInstanceList().catch((err) => console.error(`Impossible de mettre à jour la liste des instances disponible au téléchargement : ${err}`))

                    DownloadInstances.updateInstanceState(currentOpenedInstance, InstanceState.Owned)
                }).catch((err) => {
                    console.error(`Une erreur est survenue lors du téléchargement de l'instance pour ${currentOpenedInstance}: ${err}`)
                    DownloadInstances.updateInstanceState(currentOpenedInstance, InstanceState.ToDownload)
                })
            }).catch((err) => {
                console.error(`Une erreur est survenue lors de la récupération des profiles sur les serveurs de Github: ${err}`)
            })
            return;
        case InstanceState.Playable:
            ServerInstances.updateInstanceState(currentOpenedInstance, InstanceState.Loading)

            await getActiveAccount().then(async (acc) => {
                await ServerInstances.getInstanceData(currentOpenedInstance).then(async (data) => {
                    await verifyInstanceFromRemote(currentOpenedInstance).then(async () => {
                        await startMinecraft(currentOpenedInstance, {
                            version: data["data"]["game"]["version"],
                            accessToken: acc["access_token"],
                            username: acc["username"],
                            uuid: acc["uuid"]
                        }, (err) => {
                            ServerInstances.updateInstanceState(currentOpenedInstance, InstanceState.Playable)
                            console.log(`Le jeu de l'instance ${currentOpenedInstance} a été/s'est arrêté en renvoyant le message suivant: ${err}`)
                        }, data["data"]["loader"]["id"]).then(() => {
                            clearConsole(currentOpenedInstance)
                            ServerInstances.updateInstanceState(currentOpenedInstance, InstanceState.Playing)
                        }).catch((err) => {
                            ServerInstances.updateInstanceState(currentOpenedInstance, InstanceState.Playable)
                            console.error(`Impossible de lancer le jeu pour ${currentOpenedInstance}: ${err}`)
                        })
                    }).catch((err) => {
                        ServerInstances.updateInstanceState(currentOpenedInstance, InstanceState.Playable)
                        console.error(`Impossible de mettre à jour l'instance: ${err}`)
                    })
                }).catch((err) => {
                    ServerInstances.updateInstanceState(currentOpenedInstance, InstanceState.Playable)
                    console.error(`Une erreur est survenue lors de la récupération des informations de l'instance ${currentOpenedInstance}: ${err}`)
                })
            }).catch((err) => {
                ServerInstances.updateInstanceState(currentOpenedInstance, InstanceState.Playable)
                console.error(`Aucun compte actif trouvé, connectez vous à votre compte Microsoft pour jouer: ${err}`)
            })
            return;
    }
}

const copyConsoleElement = document.getElementById("console-copy")
copyConsoleElement.addEventListener("click", async () => {
    await copyConsoleToClipboard(currentOpenedInstance).then(() => {
        console.log(`Contenu de la console copié avec succès!`)
    }).catch((err) => {
        console.error(`Une erreur est survenue en copiant le contenu de la console dans le presse papier: ${err}`)
    })
})

const clearConsoleElement = document.getElementById("console-clear")
clearConsoleElement.addEventListener("click", () => {
    clearConsole(currentOpenedInstance)
})