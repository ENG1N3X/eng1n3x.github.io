// Show/Hide content
export function show(content, msg = "") {
    content.classList.remove("hide")
    if (msg != "") {
        content.innerHTML = msg
    }
}
export function hide(content) {
    content.classList.add("hide")
}