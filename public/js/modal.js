// The feedback box for each token
feedbackBox = $("#feedback").dialog({
    autoOpen: false,
    height: 320,
    width: 400,
    modal: true,
    buttons: {
        Send: sendFeedback,
        Close: function () {
            feedbackBox.dialog("close");
        },
    },
});

function openFeedbackModal() {
    feedbackBox.dialog("option", "title", "Feedback");
    feedbackBox.dialog("open");
}

// sends the review from the feedback module to my database
function sendFeedback() {
    let feedback = document.querySelector('#feedbackBody').value;
    let feedbackToken =
        document.querySelector('#feedbackCurrentRule').checked ? currentToken : null;
    $.ajax({
        method: "POST",
        url: "app/feedback",
        data: {
            feedback,
            feedbackToken,
            currentLang,
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