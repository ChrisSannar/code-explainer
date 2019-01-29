// Handling the Cursor, its location, and selecting elements
let cursorspace = document.querySelector("#cursorspace");
cursorspace.style.left = codespace.getBoundingClientRect().left + "px";
cursorspace.style.top = (codespace.getBoundingClientRect().top) + "px";


let cursorBlink = setInterval(function() {
    if (!typing) {
        if (blink) {
            setCursor();
        } else {
            removeCursor();
        }
    }
}, 500);

function setCursor() {
    cursorspace.style.display = "block";
    /*
    let kids = document.querySelector("#codespace").childNodes;
    let el = document.createElement("span");
    el.id = "cursor";
    kids[lineIndex].appendChild(el);
    blink = false;*/
}

function removeCursor() {
    cursorspace.style.display = "none";
    /*
    let el = document.querySelector("#cursor");
    if (el) { el.parentNode.removeChild(el); }
    blink = true;
    */
}

var widthDivider = 0;
var heightDivider = 0;
var charWidth = 0;
var lineHeight = 0;
function calculateIndent(lineIndex, lineCol, charCount) {
    // If we actually have a space to work with
    if (codespace.childNodes[lineIndex].childNodes[0]){
        console.log(lineIndex, lineCol);

        // Calculate how far to move the cursor depending on the width of each character and height of each line
        if (charCount > 0) {
            charWidth = codespace.childNodes[lineIndex].childNodes[0].getBoundingClientRect().width / charCount;
        }
        if (lineIndex > 0) {
            lineHeight = codespace.childNodes[lineIndex].childNodes[0].getBoundingClientRect().height / lineIndex;
        }
        // The characer width might vary, but the line height will always be the same as placed in "style.css"
        indentCursor((charWidth * lineCol), (lineIndex * 18));//(lineHeight * lineIndex));
    }
}

// Moves the cursor based on margin left/top of the cursorspace
function indentCursor(left, top) {
    cursorspace.style.marginLeft = left + "px";
    cursorspace.style.marginTop = top + "px";
}