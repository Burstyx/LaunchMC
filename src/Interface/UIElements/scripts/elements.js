const allCheckbox = document.querySelectorAll(".checkbox")
allCheckbox.forEach((checkbox) => {
    checkbox.addEventListener("click", (e) => {
        if (checkbox.getAttribute("checked") === "false") {
            checkbox.setAttribute("checked", "true")
            return
        }
        checkbox.setAttribute("checked", "false")
    })
})