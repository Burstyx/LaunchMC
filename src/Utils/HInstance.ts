export interface InstanceOpts {
    name: string,
    thumbnailPath: string,
    version: string,
}

export interface ServerInstanceOpts{
    name: string,
    thumbnailPath: string,
    logoPath: string,
    version: string,
}

export interface LoaderOpts {
    name: string,
    id: string
}

export function generateInstanceBtn(opts: InstanceOpts | ServerInstanceOpts) {
    const instanceElement = document.createElement("div")

    const textElement = document.createElement("p")
    textElement.innerText = opts.name;
    instanceElement.append(textElement)

    instanceElement.id = opts.name
    instanceElement.classList.add("instance")

    return instanceElement
}

export function addInstanceElement(instanceOpts: InstanceOpts | ServerInstanceOpts, parentDiv: HTMLElement){
    const instanceElement = generateInstanceBtn(instanceOpts)
    parentDiv.appendChild(instanceElement)
    return instanceElement
}

/*export function updateInstanceDlProgress(instanceId: string, progress: number) {
    const instance = document.getElementById(instanceId)

    const dlTracker = instance?.firstElementChild

    if(dlTracker == null) {
        return
    }

    console.log(progress);



    //@ts-ignore
    dlTracker.style.left = `${progress}%`;
    //@ts-ignore
    dlTracker.style.width = 100 - Number(dlTracker.style.left.substring(0, dlTracker.style.left.length - 1)) + '%';

}*/

/*export async function checkForUpdate(instanceId: string) {
    await updateInstanceDlState(instanceId, InstanceState.Loading)

    let updateFound = false

    // Check difference between this instance version and the serverside instance version
    // If version is different, delete game files and replace them and update instance properties

    if(updateFound) await updateInstanceDlState(instanceId, InstanceState.Update)

    await updateInstanceDlState(instanceId, InstanceState.Playable)
}*/

/*export async function checkInstanceIntegrity(instanceId: string) {
    await updateInstanceDlState(instanceId, InstanceState.Verification)

    // TODO: Code

    await updateInstanceDlState(instanceId, InstanceState.Playable)
}*/
