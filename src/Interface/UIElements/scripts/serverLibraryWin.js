const {listProfiles} = require("../../../Utils/HRemoteProfiles");
const {downloadServerInstance, verifyInstanceFromRemote} = require("../../../App/ServerInstances");
const DownloadInstances = require("../../../App/DownloadInstances");
const ServerInstances = require("../../../App/ServerInstances");
const {startMinecraft, killGame} = require("../../../App/StartMinecraft");
const {getActiveAccount} = require("../../../Utils/HMicrosoft");
const {InstanceState, instancesStates, currentOpenedInstance} = require("../../../Utils/HInstance");
const {clearConsole, copyConsoleToClipboard} = require("../../../App/GameConsole");
const {addNotification} = require("./notification");
const {switchDiscordRPCState, DiscordRPCState} = require("../../../App/DiscordRPC");

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
                addNotification(`Impossible de forcer l'arrêt du jeu.`, "error", undefined)
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
                    addNotification(`L'instance ${currentOpenedInstance} a été installée.`, "info", undefined)
                    DownloadInstances.updateInstanceState(currentOpenedInstance, InstanceState.Owned)

                    delete instancesStates[currentOpenedInstance]

                    await DownloadInstances.refreshInstanceList().catch((err) => addNotification(`Impossible de mettre à jour la liste des instances disponible.`, "error", err))
                    await ServerInstances.refreshInstanceList().catch((err) => addNotification(`Impossible de mettre à jour la liste des instances possédées.`, "error", err))
                }).catch((err) => {
                    addNotification(`Une erreur est survenue lors du téléchargement de l'instance ${currentOpenedInstance}.`, "error", err)
                    DownloadInstances.updateInstanceState(currentOpenedInstance, InstanceState.ToDownload)
                })
            }).catch((err) => {
                addNotification(`Une erreur est survenue lors de la récupération des profiles sur les serveurs de Github.`, "error", err)
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
                            switchDiscordRPCState(DiscordRPCState.InLauncher)
                        }, data["data"]["loader"]["id"]).then(() => {
                            clearConsole(currentOpenedInstance)
                            ServerInstances.updateInstanceState(currentOpenedInstance, InstanceState.Playing)
                            addNotification(`Une instance de Minecraft vient d'être lancé.`, "info", undefined)
                            switchDiscordRPCState(DiscordRPCState.InGameServer, currentOpenedInstance)
                        }).catch((err) => {
                            ServerInstances.updateInstanceState(currentOpenedInstance, InstanceState.Playable)
                            addNotification(`Impossible de lancer le jeu pour ${currentOpenedInstance}.`, "error", err)
                        })
                    }).catch((err) => {
                        ServerInstances.updateInstanceState(currentOpenedInstance, InstanceState.Playable)
                        addNotification(`Impossible de mettre à jour l'instance.`, "error", err)
                    })
                }).catch((err) => {
                    ServerInstances.updateInstanceState(currentOpenedInstance, InstanceState.Playable)
                    addNotification(`Une erreur est survenue lors de la récupération des informations de l'instance ${currentOpenedInstance}.`, "error", err)
                })
            }).catch((err) => {
                ServerInstances.updateInstanceState(currentOpenedInstance, InstanceState.Playable)
                addNotification(`Aucun compte actif trouvé, connectez-vous à votre compte Microsoft pour jouer.`, "error", err)
            })
            return;
    }
}

const copyConsoleElement = document.getElementById("console-copy")
copyConsoleElement.addEventListener("click", async () => {
    await copyConsoleToClipboard(currentOpenedInstance).then(() => {
        addNotification(`La console a été copié dans le presse papier.`, "info", undefined)
    }).catch((err) => {
        addNotification(`Une erreur est survenue en copiant le contenu de la console dans le presse papier.`, "error", err)
    })
})

const clearConsoleElement = document.getElementById("console-clear")
clearConsoleElement.addEventListener("click", () => {
    clearConsole(currentOpenedInstance)
})