// The feedback box for each token
feedbackBox = $("#feedback").dialog({
    autoOpen: false,
    height: 350,
    width: 400,
    modal: true,
    buttons: {
        Send: sendReview,
        Close: function () {
            feedbackBox.dialog("close");
        },
    },
});

let currentTag = "";

function openFeedbackModal(tag) {
    currentTag = tag;
    feedbackBox.dialog("option", "title", tag);
    feedbackBox.dialog("open");
}

// sends the review from the feedback module to my database
function sendReview() {
    let feedback = document.querySelector("#feedbackBody").value;
    $.ajax({
        method: "POST",
        url: "./app/feedback",
        data: {
            feedback,
            tag: currentTag,
        },
    }).done(function (data) {
        if (data) {
            if (data == "OK") {
                document.querySelector("#confirmBox").innerHTML =
                    "Thanks for contributing!";
                feedbackBox.dialog("close");
                confirmBox.dialog("open");
            } else {
                document.querySelector("#confirmBox").innerHTML =
                    "There was an error sending the feedback. Please try again.";
                feedbackBox.dialog("close");
                confirmBox.dialog("open");
            }
        }
    });
}

// The confirm box after feedback has been sent
confirmBox = $("#confirmBox").dialog({
    autoOpen: false,
    height: 100,
    width: 200,
    close: function () {
        $("#feedbackConfirm").dialog("close");
    },
});



// var modalFadeout;

// function openModal(index, element) {
//     if (modalFadeout) { clearTimeout(modalFadeout); }

//     let rule = rules[index];
//     let rect = element.getBoundingClientRect();
//     let modal = document.querySelector("#modal");

//     if (modal.style.display == "none") { modal.style.display = "block"; }

//     modal.classList.remove("hidden");
//     modal.classList.add("visible");
//     modal.style.left = ((rect.left - (modal.offsetWidth / 2)) + (element.offsetWidth / 2)) + "px";
//     modal.style.top = (20 + rect.top) + "px";
//     modal.innerHTML = `${rule.html}`;
// }

// function closeModal() {
//     modalFadeout = setTimeout(function () {
//         let modal = document.querySelector("#modal");
//         modal.classList.remove("visible");
//         modal.classList.add("hidden");
//     }, 300);
// }