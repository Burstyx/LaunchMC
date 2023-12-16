import {CallbackEvent} from "./Debug";

export async function getLatestRelease(event: CallbackEvent) {
    return new Promise<any>(async (resolve, reject) => {
        const myHeaders = new Headers();
        myHeaders.append("Accept", "application/vnd.github+json");
        myHeaders.append("X-GitHub-Api-Version", "2022-11-28");

        await fetch("https://api.github.com/repos/tonityg/RubyClientReleases/releases/latest", {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        })
            .then(async response => await response.json().then((data) => resolve(data)))
            .catch((err) => {
                event(`Impossible de récupérer la dernière version du client sur les serveurs Github.`, err, "err")
                reject()
            });
    })
}

export async function listProfiles(event: CallbackEvent) {
    return new Promise<any>(async (resolve, reject) => {
        const myHeaders = new Headers();
        myHeaders.append("Accept", "application/vnd.github+json");
        myHeaders.append("X-GitHub-Api-Version", "2022-11-28");

        await fetch("https://raw.githubusercontent.com/tonityg/RubyClientReleases/main/profiles.json", {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        })
            .then(async response => await response.json().then((data) => resolve(data)))
            .catch((err) => {
                event(`Impossible de récupérer la liste des profiles sur les serveurs Github.`, err, "err")
                reject()
            });
    })
}

export async function getMetadataOf(name: string, event : CallbackEvent): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
        await listProfiles(() => {
            // FIXME Handle errors
        }).then(async (res) => {
            await fetch(res[name]["metadataUrl"]).then((res) => {
                res.json().then((json) => {
                    resolve(json)
                }).catch((err) => {
                    event(`Impossible de convertir le fichier de donnée de ${name} en JSON.`, err, "err")
                    reject()
                })
            }).catch((err) => {
                event(`Impossible de récupérer le fichier de donnée de ${name}.`, err, "err")
                reject()
            })
        })
    })
}

export async function getInstanceDataOf(name: string, event : CallbackEvent): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
        await listProfiles(() => {
            // FIXME Handle errors
        }).then(async (res) => {
            await fetch(res[name]["instanceUrl"]).then((res) => {
                res.json().then((json) => {
                    resolve(json)
                }).catch((err) => {
                    event(`Impossible de convertir le fichier d'instance de ${name} en JSON.`, err, "err")
                    reject()
                })
            }).catch((err) => {
                event(`Impossible de récupérer le fichier de donnée de ${name}.`, err, "err")
                reject()
            })
        })
    })
}