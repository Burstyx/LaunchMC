const allCheckbox = document.querySelectorAll(".checkbox")
allCheckbox.forEach((checkbox) => {
    checkbox.addEventListener("click", (e) => {
        checkbox.toggleAttribute("checked")
    })
})