const notification = document.getElementById("floating-notification")
const notificationTitle = document.getElementById("notification-title")
const notificationMessage = document.getElementById("notification-message")

let queue = []
let isEnqueuing = false;

exports.addNotification = (message, type, err) => {
    queue.push({"message": message, "type": type})
    if(!isEnqueuing) enqueuingNotification()
    if(err) console.error(err)
}

async function enqueuingNotification() {
    isEnqueuing = true

    while(queue.length > 0) {
        showNotification(queue.at(0))

        queue = queue.filter((val, i) => {
            return i > 0
        })

        await wait(5000)
        notification.style.display = "none"
    }

    isEnqueuing = false
}

async function wait(time) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}

function showNotification(data) {
    notification.style.display = "none"

    if(data["type"] === "error") {
        notificationTitle.innerText = "Oh oh O_o..."
        notificationMessage.innerText = data["message"];

        notification.className = "error"
    }
    else if(data["type"] === "info") {
        notificationTitle.innerText = "Pour info !"
        notificationMessage.innerText = data["message"];

        notification.className = ""
    }

    notification.style.display = "block"
}