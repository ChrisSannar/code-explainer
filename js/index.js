// Just to make sure the editor remains the full page
adjustEditorWindow();
window.onresize = adjustEditorWindow;


function adjustEditorWindow() {
    document.querySelector(".editor").style.height = window.innerHeight + "px";
}

let codespace = document.querySelector("#codespace");
let lineNum = document.querySelector("#lineNumber");
let codespaceFocus = false;

// Used to focus on the editor when in use
window.addEventListener("click", function (e) {
    if(e.path.findIndex(function (x) { return x.id == "codespace"; }) >= 0) {
        codespace.classList.add("selected");
        codespaceFocus = true;
    } else {
        codespace.classList.remove("selected");
        codespaceFocus = false;
    }
});

let lines = [""];
let lineIndex = 0;
// let cursor = document.createElement("span");
// cursor.id = "cursor";

let blink = true;
let typing = false;

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
    let kids = document.querySelector("#codespace").childNodes;
    let el = document.createElement("span");
    el.id = "cursor";
    kids[lineIndex].appendChild(el);
    blink = false;
}

function removeCursor() {
    let el = document.querySelector("#cursor");
    if (el) { el.parentNode.removeChild(el); }
    blink = true;
}

window.addEventListener("keydown", function(e) {
    e.preventDefault();
    if (codespaceFocus){
        appendToContent(e, e.key);
    }
});

// function setCursor() {
//     // codespace.childNodes[lineIndex]
//     console.log(codespace.childNodes);
//     console.log(codespace.children);
// }

function appendToContent(e, key) {
    typing = true;

    switch (key) {
        case "r":
            if (e.ctrlKey || e.metaKey) {
                location.reload(true);
            } else {
                lines[lineIndex] += key;
            }
            break;
        case "Space":
            lines[lineIndex] += " ";
            break;
        case "Backspace":
            if (lines.length > 0){                      // first lets make sure we have something to delete
                if (lines[lineIndex].length <= 0) {     // If we don't have anything there...
                    if (lines.length == 1){             // check if it's the first line
                        lines[lineIndex] = "";
                    } else {
                        lines.pop();                    // else remove it from lines
                    }  
                    if (lineIndex > 0){                 // then decrement, but semaphore
                        lineIndex--;
                    }
                } else {
                    lines[lineIndex] = lines[lineIndex].substr(0, lines[lineIndex].length - 1);
                }
            }
            break;
        case "Enter":
            lines.push("");
            lineIndex++;
            break;
        case "Tab":
            // lines[lineIndex] += "&#9;";
            break;
        case "Shift":
            break;
        case "CapsLock":
            break;
        case "Meta":
            break;
        case "Alt":
            break;
        case "ArrowUp":
            break;
        case "ArrowDown":
            break;
        case "ArrowLeft":
            break;
        case "ArrowRight":
            break;
        default:
            lines[lineIndex] += key;
            break;
    }

    // To finish, just attach each line as a div with a break
    codespace.innerHTML = "";
    lineNum.innerHTML = "";

    // *** Should we render the entire DOM over and over again?
    let num = 1;
    lines.forEach(line => {
        let el = document.createElement("p");
        el.innerHTML = markify(line, rules);
        codespace.appendChild(el);

        let el2 = document.createElement("span");
        el2.innerHTML = num++ + "<br>";
        lineNum.appendChild(el2);
    });

    setCursor();

    setTimeout(() => { typing = false }, 100);
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

