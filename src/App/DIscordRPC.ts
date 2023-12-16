import RPC from "discord-rpc"

export enum DiscordRPCState{
    InLauncher,
    InGame
}


let client: RPC.Client
const clientId = "1116091725061046353"

export function initDiscordRPC(){
    client = new RPC.Client({transport: "ipc"})

    client.on("ready", async () => {
        await switchDiscordRPCState(DiscordRPCState.InLauncher)
    })

    client.login({clientId}).catch((err) => err)
}

export async function switchDiscordRPCState(newState: DiscordRPCState){
    switch(newState){
        case DiscordRPCState.InLauncher:
            await client.setActivity({
                details: "In Launcher",
                largeImageKey: "icon"
            })
            return
        case DiscordRPCState.InGame:
            await client.setActivity({
                details: "In Minecraft",
                largeImageKey: "icon",
                startTimestamp: Date.now()
            })
            return
        default:
            console.log("State doesn't exist");
            return
    }
}