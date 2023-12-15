export async function getLatestRelease() {
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
            .catch((err) => reject(err));
    })
}

export async function listProfiles() {
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
            .catch((err) => reject(err));
    })
}

export async function getMetadataOf(name: string): Promise<any> {
    return await (await fetch((await listProfiles())[name]["metadataUrl"])).json();
}

export async function getInstanceDataOf(name: string): Promise<any> {
    return await (await fetch((await listProfiles())[name]["instanceUrl"])).json();
}