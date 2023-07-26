const { openWindow } = require("./window")

// Open new instance window button
const openCreateInstanceWinBtn = document.getElementById("open-create-instance-window")
openCreateInstanceWinBtn.addEventListener("click", (e) => { openWindow("new-instance") })