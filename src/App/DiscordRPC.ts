import RPC from "discord-rpc"

export enum DiscordRPCState{
    InLauncher,
    InGameLocal,
    InGameServer
}


let client: RPC.Client
const clientId = "1116091725061046353"
let rpcEnable = false;

export async function initDiscordRPC(){
    return new Promise<void>(async (resolve, reject) => {
        client = new RPC.Client({transport: "ipc"})

        client.on("ready", async () => {
            rpcEnable = true
            await switchDiscordRPCState(DiscordRPCState.InLauncher)
        })

        await client.login({clientId}).then(() => {
            resolve()
        }).catch((err) => reject(err))
    })
}

export async function stopDiscordRPC() {
    return new Promise<void>(async (resolve, reject) => await client.destroy().then(() => {
        rpcEnable = false
        resolve()
    }).catch((err) => reject(err)))
}

export async function switchDiscordRPCState(newState: DiscordRPCState, name?: string){
    return new Promise<void>(async (resolve, reject) => {
        console.log(rpcEnable)
        if(rpcEnable) {
            switch(newState){
                case DiscordRPCState.InLauncher:
                    await client.setActivity({
                        details: "In the launcher",
                        largeImageKey: "icon"
                    }).catch((err) => reject(err))
                    resolve()
                    break
                case DiscordRPCState.InGameLocal:
                    await client.setActivity({
                        details: "Playing Minecraft",
                        largeImageKey: "icon",
                        startTimestamp: Date.now()
                    }).catch((err) => reject(err))
                    resolve()
                    break
                case DiscordRPCState.InGameServer:
                    await client.setActivity({
                        details: `Playing ${name}`,
                        largeImageKey: "icon",
                        startTimestamp: Date.now()
                    }).catch((err) => reject(err))
                    resolve()
                    break
                default:
                    console.log("State doesn't exist");
                    resolve()
            }
        } else {
            resolve()
        }
    })
}