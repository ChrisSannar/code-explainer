// Just to make sure the editor remains the full page
adjustEditorWindow();
window.onresize = adjustEditorWindow;


function adjustEditorWindow() {
    document.querySelector(".editor").style.height = (window.innerHeight - 18) + "px";
    // document.querySelector("#codespace").style.height = (window.innerHeight - 18) + "px";
}

let codespace = document.querySelector("#codespace");
let lineNumers = document.querySelector("#lineNumber");
let codespaceFocus = true;

// Used to focus on the editor when in use
window.addEventListener("click", function (e) {
    if (e.path){
        if(e.path.findIndex(function (x) { return x.id == "codespace"; }) >= 0) {
            codespace.classList.add("selected");
            codespaceFocus = true;
        } else {
            codespace.classList.remove("selected");
            codespaceFocus = false;
        }
    } else  {
        if (hasCodespaceInAncestry(e.target)) {
            codespace.classList.add("selected");
            codespaceFocus = true;
        } else {
            codespace.classList.remove("selected");
            codespaceFocus = false;
        }
    }
});

function hasCodespaceInAncestry(el) {
    const codespace = document.querySelector("#codespace");
    while(el != document.querySelector("body")){
        if (el == codespace) {
            return true;
        } else {
            el = el.parentNode;
        }
    }
    return false;
}

/*!
 * Sanitize and encode all HTML in a user-submitted string
 * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {String} str  The user-submitted string
 * @return {String} str  The sanitized string
 */
function sanitizeHTML(str) {
	var temp = document.createElement('div');
	temp.textContent = str;
	return temp.innerHTML;
};

let lines = [""];
let lineIndex = 0;
let lineCol = 0;

let stopCursorBlink = false;

window.addEventListener("keydown", function(e) {
    e.preventDefault();
    if (codespaceFocus){
        appendToContent(e, e.key);
    }
});

function appendToContent(e, key) {
    stopCursorBlink = true;

    switch (key) {
        case "r":
            if (e.ctrlKey || e.metaKey) {
                location.reload(true);
            } else {
                let line = lines[lineIndex];
                lines[lineIndex] = line.substr(0, lineCol) + key + line.substr(lineCol++, line.length);
            }
            break;
        case "Space":
            lines[lineIndex] += " ";
            lineCol++;
            break;
        case "Backspace":
            if (lines.length > 0){                      // first lets make sure we have something to delete
                if (lines[lineIndex].length <= 0) {     // If we don't have anything in there...
                    if (lines.length == 1) {             // check if it's the first line
                        lines[lineIndex] = "";
                    } else {
                        lines.pop();                    // else remove it from lines and the DOM
                        lineNumers.removeChild(lineNumers.lastChild);
                        codespace.removeChild(codespace.childNodes[lineIndex]);
                    }

                    // then decrement, but semaphore
                    if (lineIndex > 0) {
                        lineCol = lines[lineIndex - 1].length;  // Also, if there is somthing there, just jump to that point
                        lineIndex--;
                    }

                } else if (lineCol == 0 && lineIndex != 0) {    // If we're at the very front of a line...
                    lineCol = lines[lineIndex - 1].length;      // Set the lineCol to the previous line
                    lines[lineIndex - 1] += lines[lineIndex];   // add whatever we had on the previous line
                    lines.splice(lineIndex, 1);                 // Cut the old line out

                    // Update the DOM
                    lineNumers.removeChild(lineNumers.lastChild);   
                    codespace.removeChild(codespace.childNodes[lineIndex--]);
                }
                else {
                    // Otherwise, we just remove the letter in the current position
                    if (lineCol - 1 >= 0) {
                        lineCol--;
                        let line = lines[lineIndex];
                        lines[lineIndex] = line.substr(0, lineCol) + line.substr(lineCol + 1, line.length);
                    }
                }
            }
            break;
        case "Enter":
            let lineVal = lines[lineIndex];

            // take care of adding a new line in the right location
            if (lineIndex == 0){
                lines.splice(lineIndex++, 0, "");
            } else {
                lines.splice(++lineIndex, 0, "");
            }

            // Once the line has been made, put the appropriate text on each one
            lines[lineIndex] = lineVal.substring(lineCol, lineVal.length);
            lines[lineIndex - 1] = lineVal.substring(0, lineCol);
            renderLine(lineIndex - 1);

            // Add a new line to the codespace
            let el = document.createElement("p");
            if (codespace.childNodes.length > 1 && lineIndex != codespace.childNodes.length){
                codespace.insertBefore(el, codespace.childNodes[lineIndex]);
            } else {
                codespace.appendChild(el);
            }

            // Then add the line number
            let el2 = document.createElement("span");
            el2.innerHTML = sanitizeHTML(codespace.childElementCount) + "<br>"
            lineNumers.appendChild(el2);

            lineCol = 0;

            break;
        case "Tab":
            // lines[lineIndex] += "&#9;";
            break;
        case "Shift":
        case "CapsLock":
        case "Meta":
        case "End":
        case "Control":
            break;
        case "Alt":
            // *** FOR TESTING PURPOSES, DELETE TO NEXT ***
            for (let i = 0; i < 38; i++){
                let lineVal = lines[lineIndex];

                // take care of adding a new line in the right location
                if (lineIndex == 0){
                    lines.splice(lineIndex++, 0, "");
                } else {
                    lines.splice(++lineIndex, 0, "");
                }

                // Once the line has been made, put the appropriate text on each one
                lines[lineIndex] = lineVal.substring(lineCol, lineVal.length);
                lines[lineIndex - 1] = lineVal.substring(0, lineCol);
                renderLine(lineIndex - 1);

                // Add a new line to the codespace
                let el = document.createElement("p");
                if (codespace.childNodes.length > 1 && lineIndex != codespace.childNodes.length){
                    codespace.insertBefore(el, codespace.childNodes[lineIndex]);
                } else {
                    codespace.appendChild(el);
                }

                // Then add the line number
                let el2 = document.createElement("span");
                el2.innerHTML = sanitizeHTML(codespace.childElementCount) + "<br>"
                lineNumers.appendChild(el2);

                lineCol = 0;
            }
            break;
            // ***
        case "ArrowUp":
            if (lineIndex - 1 >= 0) {   // Bounds check
                lineIndex--;
                // if (lineCol == lines[lineIndex + 1].length) {
                let prevLineLen = lines[lineIndex].length;
                let newLineLen = lines[lineIndex + 1].length;
                lineCol = prevLineLen < newLineLen ? 
                        (lineCol < prevLineLen ? lineCol : prevLineLen)
                        : (newLineLen < lineCol ? newLineLen : lineCol);
                // }
            }
            break;
        case "ArrowDown":
            if (lineIndex + 1 < lines.length) {  // Bounds check
                lineIndex++;

                // if (lineCol == lines[lineIndex - 1].length) {
                    let prevLineLen = lines[lineIndex].length;
                    let newLineLen = lines[lineIndex - 1].length;
                    lineCol = prevLineLen < newLineLen ? 
                        (lineCol < prevLineLen ? lineCol : prevLineLen)
                        : (newLineLen < lineCol ? newLineLen : lineCol);
                // }
            }
            break;
        case "ArrowLeft":
            if (e.ctrlKey || e.metaKey) {
                lineCol = 0;
            }
            if (lineCol - 1 >= 0) { lineCol--; }
            break;
        case "ArrowRight":
            if (e.ctrlKey || e.metaKey) {
                lineCol = lines[lineIndex].length;
            }
            if (lineCol + 1 <= lines[lineIndex].length) { lineCol++; }
            break;
        default:
            // insert the character into the line at the correct position
            let line = lines[lineIndex];
            lines[lineIndex] = line.substr(0, lineCol) + key + line.substr(lineCol++, line.length);
            break;
    }

    // To finish, just attach each line as a div with a break
    renderLine(lineIndex);

    calculateIndent(lineIndex, lineCol, lines[lineIndex].length);
    setCursor();

    setTimeout(() => { stopCursorBlink = false }, 100);
}

// Renders a line given the index in the set of 'lines' (corresponding to the child in codespace DOM)
// Adds marking as well
function renderLine(index) {
    codespace.childNodes[index].innerHTML = `<span>${markify(sanitizeHTML(lines[index]), rules)}</span>`;
}

// Returns a html ready line for each occurance
// string "replace" not used due to replacing tagged content already.
function markify(line, rules) {
    let result = "";
    let words = []; // details of each occurance
    let occur = []; // all times there is an occurance

    // Find everywhere we have a matching rule
    rules.forEach((rule, index) => {
        let word = line.match(rule.regex); // search for the given word
        let start = []; // Each index of the occurance
        if (word){
            let exp;
            while (exp = rule.regex.exec(line)) {
                occur.push(exp.index);
                start.push(exp.index);
            }
            words.push({tag: word[0], start: start, rule: rule, index: index});
        }
    });

    occur.sort((a, b) => a - b);  // sort the occurances to be efficient
    // tag everywhere we have a rule
    if (occur.length > 0){
        let pre = 0;
        occur.forEach(occurance => {    // For each time we have an expression to wrap
            // Set untagged stuff between our words
            result += line.substr(pre, occurance - pre);

            // Get the word we're wrapping
            let word = words.find(each => { 
                return each.start.includes(occurance);
            });

            // wrap the word and put it in
            let temp = line.substr(occurance, word.tag.length);
            result += `<span class="${word.rule.tag}" onmouseover="openModal(${word.index}, this)" onmouseout="closeModal()" style="color: ${word.rule.color};">` + temp + '</span>';

            // keep track of the next spot
            pre = occurance + word.tag.length;
        });
        // tag on whatever's left
        result += line.substr(pre, line.length);
    } else {
        result = line;
    }

    // Our resulting line
    return result;
}
