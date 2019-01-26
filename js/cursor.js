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

var divider = 0;
var charWidth = 0;
function indentCursor(lineIndex, step, charInLine) {
    console.log(charInLine);
    if (divider + step >= 0){
        divider += step;
    }
    // cursorLeftIndent += step;
    // cursorspace.style.marginLeft = cursorLeftIndent + "em";
    if (codespace.childNodes[lineIndex].childNodes[0]){
        // cursorspace.style.marginLeft = codespace.childNodes[lineIndex].childNodes[0].getBoundingClientRect().width + "px";
        console.log(charWidth, divider);
        if (charWidth){
            // cursorspace.style.marginLeft = (charWidth * divider) + "px";
            cursorspace.style.marginLeft = (charWidth * charInLine) + "px";
        }
        if (divider > 0) {
            charWidth = codespace.childNodes[lineIndex].childNodes[0].getBoundingClientRect().width / divider;
            // console.log(codespace.childNodes[lineIndex].childNodes[0], charWidth, divider);
        }
    }

    // cursorspace.style.marginLeft = codespace.childNodes[lineIndex].childNodes[0].getBoundingClientRect().width + "px";
}