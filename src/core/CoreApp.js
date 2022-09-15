const { app, BrowserWindow } = require("@electron/remote")

console.log("Initialisation du module principal !");

// Boutons menu titre
const closeBtn = document.getElementById("close")
const minimizeBtn = document.getElementById("minimize")
const reducebtn = document.getElementById("reduce")

closeBtn.addEventListener("click", () => {
    console.log("close");
    app.quit()
})
