"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMinecraft = void 0;
const HManifests_1 = require("../Helper/HManifests");
const path_1 = __importDefault(require("path"));
const const_1 = require("../Helper/const");
function startMinecraft(version, instanceId, opt) {
    (0, HManifests_1.minecraftManifestForVersion)(version).then((data) => {
        var mcArgs = [];
        if (data.hasOwnProperty("minecraftArguments")) {
            var args = data["minecraftArguments"].split(" ");
            mcArgs = args;
        }
        else {
            var args = [];
            for (var e in data["arguments"]["game"]) {
                if (data["arguments"]["game"][e].hasOwnProperty("rules")) {
                    const rule = parseRule(data["arguments"]["game"][e]);
                    if (rule != undefined) {
                        args.push(rule);
                    }
                }
                else {
                    args.push(data["arguments"]["game"][e]);
                }
            }
            mcArgs = args;
        }
        console.log(mcArgs);
        // Set command arguments
        for (var i = 0; i < mcArgs.length / 2; i++) {
            for (var e in mcArgs) {
                switch (mcArgs[e]) {
                    case "${auth_player_name}":
                        mcArgs[e] = opt["username"];
                        break;
                    case "${version_name}":
                        mcArgs[e] = opt["version"];
                        break;
                    case "${game_directory}":
                        mcArgs[e] = path_1.default.join(const_1.instancesPath, instanceId);
                        break;
                    case "${assets_root}":
                        mcArgs[e] = const_1.assetsPath;
                        break;
                    case "${assets_index_name}":
                        mcArgs[e] = version;
                        break;
                    case "${auth_uuid}":
                        mcArgs[e] = opt["uuid"];
                        break;
                    case "${auth_access_token}":
                        mcArgs[e] = opt["accesstoken"];
                        break;
                    case "${auth_xuid}":
                        mcArgs[e] = opt["xuid"];
                        break;
                    case "${user_type}":
                        mcArgs[e] = opt["usertype"];
                        break;
                    case "${version_type}":
                        mcArgs[e] = opt["versiontype"];
                        break;
                    case "${is_demo_user}":
                        break;
                    case "${has_custom_resolution}":
                        break;
                    default:
                        break;
                }
            }
        }
        // Build command string
        var command = `C:\\Users\\tonib\\Downloads\\OpenJDK8U-jdk_x64_windows_hotspot_8u345b01\\jdk8u345-b01\\bin\\java`;
        for (var e in mcArgs) {
            command += ` `;
            command += mcArgs[e];
        }
        console.log(command);
    });
}
exports.startMinecraft = startMinecraft;
function parseRule(rule) {
}
