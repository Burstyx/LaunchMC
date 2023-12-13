/*
exports.registerCheckbox = (checkbox) => {
    checkbox.addEventListener("click", (e) => {
        checkbox.toggleAttribute("checked")
    })
}

exports.registerSelectorGroup = (gr) => {
    gr.childNodes.forEach((selector) => {
        selector.addEventListener("click", () => {
            const currentActive = gr.querySelector(".selector[active]")

            if (currentActive != null) {
                currentActive.toggleAttribute("active", false)
            }

            selector.toggleAttribute("active", true)
        })
    })
}

const allCheckbox = document.querySelectorAll(".checkbox")
allCheckbox.forEach((checkbox) => {
    this.registerCheckbox(checkbox)
})

const allSelectorsGr = document.querySelectorAll("selectorgroup")
allSelectorsGr.forEach((gr) => {
    this.registerSelectorGroup(gr)
})
*/
