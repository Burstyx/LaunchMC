"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDiscordRPC = exports.DiscordRPCState = void 0;
const discord_rpc_1 = __importDefault(require("discord-rpc"));
var DiscordRPCState;
(function (DiscordRPCState) {
    DiscordRPCState[DiscordRPCState["InLauncher"] = 0] = "InLauncher";
    DiscordRPCState[DiscordRPCState["InGame"] = 1] = "InGame";
})(DiscordRPCState = exports.DiscordRPCState || (exports.DiscordRPCState = {}));
let client;
const clientId = "1116091725061046353";
function initDiscordRPC() {
    client = new discord_rpc_1.default.Client({ transport: "ipc" });
    client.on("ready", () => {
        switchDiscordRPCState(DiscordRPCState.InLauncher);
    });
    client.login({ clientId });
}
exports.initDiscordRPC = initDiscordRPC;
function switchDiscordRPCState(newState) {
    switch (newState) {
        case DiscordRPCState.InLauncher:
            client.setActivity({
                details: "In Launcher",
                largeImageKey: "icon"
            });
            break;
        case DiscordRPCState.InGame:
            client.setActivity({
                details: "In Minecraft",
                startTimestamp: Date.now()
            });
            break;
    }
}
