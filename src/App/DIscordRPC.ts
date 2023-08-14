import RPC from "discord-rpc"

export enum DiscordRPCState{
    InLauncher,
    InGame
}

let client: RPC.Client
const clientId = "1116091725061046353"

export function initDiscordRPC(){
    client = new RPC.Client({transport: "ipc"})

    client.on("ready", () => {
        switchDiscordRPCState(DiscordRPCState.InLauncher)
    })

    client.login({clientId})
}

function switchDiscordRPCState(newState: DiscordRPCState){
    switch(newState){
        case DiscordRPCState.InLauncher:
            client.setActivity({
                details: "In Launcher",
                largeImageKey: "icon"
            })
            break
        case DiscordRPCState.InGame:
            client.setActivity({
                details: "In Minecraft",
                startTimestamp: Date.now()
            })
            break
    }
}