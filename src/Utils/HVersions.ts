import {minecraftManifest} from "./HManifests"

interface MinecraftVersionsFiltering {
    filterOptions: {
        release: boolean,
        snapshot: boolean,
        beta: boolean,
        alpha: boolean
    }
}

export async function filteredMinecraftVersions(opt: MinecraftVersionsFiltering){
    let versions: any = []
    await minecraftManifest(() => {
        // FIXME Handle errors
    }).then((data) => {
        for(let i = 0; i < data["versions"].length; i++){
            if((data["versions"][i]["type"] == "release" && opt["filterOptions"]["release"])
            || (data["versions"][i]["type"] == "snapshot" && opt["filterOptions"]["snapshot"])
            || (data["versions"][i]["type"] == "old_beta" && opt["filterOptions"]["beta"])
            || (data["versions"][i]["type"] == "old_alpha" && opt["filterOptions"]["alpha"])){
                versions.push({
                    id: data["versions"][i]["id"],
                    type: data["versions"][i]["type"],
                    sha1: data["versions"][i]["sha1"],
                    complianceLevel: data["versions"][i]["complianceLevel"]
                })
            }
        }
    })    
    
    return versions
}