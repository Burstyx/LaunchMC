import fs from "fs"

// Download url async
export async function downloadAsync(url: string, dest: string): Promise<Response> {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest)

        // Download the file with fetch and resolve response
        fetch(url).then(async (res) => {
            // Get buffer
            const arrayBuffer = await res.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            console.log(arrayBuffer.byteLength);
            

            // Write buffer
            file.write(buffer)
            file.close((err) => reject(err))

            resolve(res)
        }).catch((err) => reject(err))
    })
}