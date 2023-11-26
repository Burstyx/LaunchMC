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

    await fetch("https://api.github.com/repos/tonityg/RubyClientReleases/contents/profiles.json", {
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

export async function getMetadata(id: string) {
    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/vnd.github+json");
    myHeaders.append("X-GitHub-Api-Version", "2022-11-28");

    let latestRelease = null

    await fetch( `https://api.github.com/repos/tonityg/RubyClientReleases/contents/profile/${id}.json`, {
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

export async function getProfileData(id: string) {
    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/vnd.github+json");
    myHeaders.append("X-GitHub-Api-Version", "2022-11-28");

    let latestRelease = null

    await fetch( `https://api.github.com/repos/tonityg/RubyClientReleases/contents/metadata/${id}.json`, {
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