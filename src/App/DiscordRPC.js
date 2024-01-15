"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.switchDiscordRPCState = exports.stopDiscordRPC = exports.initDiscordRPC = exports.DiscordRPCState = void 0;
const discord_rpc_1 = __importDefault(require("discord-rpc"));
var DiscordRPCState;
(function (DiscordRPCState) {
    DiscordRPCState[DiscordRPCState["InLauncher"] = 0] = "InLauncher";
    DiscordRPCState[DiscordRPCState["InGameLocal"] = 1] = "InGameLocal";
    DiscordRPCState[DiscordRPCState["InGameServer"] = 2] = "InGameServer";
})(DiscordRPCState = exports.DiscordRPCState || (exports.DiscordRPCState = {}));
let client;
const clientId = "1116091725061046353";
function initDiscordRPC() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            client = new discord_rpc_1.default.Client({ transport: "ipc" });
            client.on("ready", () => __awaiter(this, void 0, void 0, function* () {
                yield switchDiscordRPCState(DiscordRPCState.InLauncher);
            }));
            yield client.login({ clientId }).then(() => resolve()).catch((err) => reject(err));
        }));
    });
}
exports.initDiscordRPC = initDiscordRPC;
function stopDiscordRPC() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () { return yield client.destroy().then(() => resolve()).catch((err) => reject(err)); }));
    });
}
exports.stopDiscordRPC = stopDiscordRPC;
function switchDiscordRPCState(newState, name) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            switch (newState) {
                case DiscordRPCState.InLauncher:
                    yield client.setActivity({
                        details: "In the launcher",
                        largeImageKey: "icon"
                    }).catch((err) => reject(err));
                    return;
                case DiscordRPCState.InGameLocal:
                    yield client.setActivity({
                        details: "Playing Minecraft",
                        largeImageKey: "icon",
                        startTimestamp: Date.now()
                    }).catch((err) => reject(err));
                    return;
                case DiscordRPCState.InGameServer:
                    yield client.setActivity({
                        details: `Playing ${name}`,
                        largeImageKey: "icon",
                        startTimestamp: Date.now()
                    }).catch((err) => reject(err));
                    return;
                default:
                    console.log("State doesn't exist");
                    return;
            }
        }));
    });
}
exports.switchDiscordRPCState = switchDiscordRPCState;
