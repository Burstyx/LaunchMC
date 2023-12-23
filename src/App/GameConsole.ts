import {logs} from "./StartMinecraft";
import {currentOpenedInstance} from "../Utils/HInstance";

const gameConsole = document.getElementById("console-logs")!
let autoScroll = true;

gameConsole.addEventListener("wheel", () => console.log("gege"))

export function makeConsoleDirty(name: string) {
    if(gameConsole && currentOpenedInstance === name) {
        const lastLog = logs[name][logs[name].length - 1]

        const text = document.createElement("p")
        text.innerText = lastLog["message"];
        text.classList.add(lastLog["type"] === "err" ? "error" : "info")

        gameConsole.append(text)

        if(autoScroll) {
            gameConsole.scrollTo(0, gameConsole.scrollHeight)
        }
    }
}

export function initConsole(name: string) {
    if(gameConsole) {
        gameConsole.innerHTML = ""
        for(const index in logs[name]) {
            const text = document.createElement("p")
            text.innerText = logs[name][index]["message"];
            text.classList.add(logs[name][index]["err"] ? "error" : "info")

            gameConsole.append(text)
        }
    }
}

export function clearConsole(name: string) {
    if(gameConsole) {
        gameConsole.innerHTML = "";
    }
}

export async function copyConsoleToClipboard(name: string) {
    return new Promise<void>(async (resolve, reject) => {
        if(gameConsole) {
            let finalStr = ""
            for (let child of gameConsole.children) {
                finalStr += (child as HTMLElement).innerText
            }

            await navigator.clipboard.writeText(finalStr)
                .then(() => resolve())
                .catch((err) => reject(err))
        }
    })
}