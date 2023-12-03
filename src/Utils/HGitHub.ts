export async function getLatestRelease() {
    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/vnd.github+json");
    myHeaders.append("X-GitHub-Api-Version", "2022-11-28");

    let latestRelease = null

    await fetch("https://api.github.com/repos/tonityg/RubyClientReleases/releases/latest", {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    })
        .then(async response => await response.json().then((data) => {
            latestRelease = data
        }))
        .catch(error => console.log("Can't retrieve latest release on GitHub... Can't check for update."));

    return latestRelease
}

export async function listProfiles() {
    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/vnd.github+json");
    myHeaders.append("X-GitHub-Api-Version", "2022-11-28");

    let latestRelease = null

    await fetch("https://raw.githubusercontent.com/tonityg/RubyClientReleases/main/profiles.json", {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    })
        .then(async response => await response.json().then((data) => {
            latestRelease = data
        }))
        .catch(error => console.log("Can't retrieve profile on GitHub..."));

    return latestRelease
}

export async function getMetadataOf(data: any): Promise<any> {
    return await (await fetch(data["metadataUrl"])).json();
}

export async function getInstanceDataOf(data: any): Promise<any> {
    return await (await fetch(data["instanceUrl"])).json();
}