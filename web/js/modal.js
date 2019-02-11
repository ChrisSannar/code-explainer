var modalFadeout;

function openModal(index, element) {
    if (modalFadeout) { clearTimeout(modalFadeout); }

    let rule = rules[index];
    let rect = element.getBoundingClientRect();
    let modal = document.querySelector("#modal");
    // modal.style.visibility = "visible";

    if (modal.style.display == "none") { modal.style.display = "block"; }

    modal.classList.remove("hidden");
    modal.classList.add("visible");
    modal.style.left = ((rect.left - (modal.offsetWidth / 2)) + (element.offsetWidth / 2)) + "px";
    modal.style.top = (20 + rect.top) + "px";
    modal.innerHTML = `${rule.html}`;
}

function closeModal() {
    modalFadeout = setTimeout(function () {
        let modal = document.querySelector("#modal");
        // modal.style.visibility = "hidden";
        modal.classList.remove("visible");
        modal.classList.add("hidden");
    }, 300);
}