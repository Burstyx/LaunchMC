

export async function taskTest(msBetweenTest: number, numberOfTest: number, test: ) {
    return new Promise((resolve, reject) => {
        let tryLeft = numberOfTest

        setInterval(() => {
            tryLeft--

            

            if(tryLeft == 0) {
                reject("Task failed to complete")
            }
        }, msBetweenTest);
    })
}