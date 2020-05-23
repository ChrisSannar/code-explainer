// All index functions

const editorDefaultText = `\n// Insert your code here\n`;
const displayDefault = `<p>Click on or after a keyword to learn more about it</p>`;

document.querySelector("#editor").innerHTML = editorDefaultText;

// Get the editor and settings
var currentLang = "javascript";
var editor = ace.edit("editor");
editor.setOptions({
  // theme: "ace/theme/idle_fingers",
  theme: "ace/theme/kr_theme",
  showPrintMargin: false,
});

// Make a not of avaliable languages in the database to accept others
editor.session.setMode("ace/mode/" + currentLang, tokenizeDocument);
let tokens = [];
let rules = {};

// Changes the language on the page
function changeLanguage(lang) {
  currentLang = lang;
  editor.session.setMode("ace/mode/" + currentLang, tokenizeDocument);
}

// Goes through the document and tokenizes the whole thing
function tokenizeDocument() {
  let result = []; // What we're sending out
  tokens = {};

  // Iterator over the entire document and collect a token for each value
  var TokenIterator = ace.require("ace/token_iterator").TokenIterator;
  var tokIter = new TokenIterator(editor.session, 0, 0);
  tokIter.stepForward();
  while (tokIter.getCurrentToken()) {
    let next = tokIter.getCurrentToken();
    // set the line where the token occures
    next.line = editor.env.document.doc.getLine(
      tokIter.getCurrentTokenRow()
    );

    // if we've already pulled the token data, then there's no need to request it again
    if (!tokens[`${next.type}:${next.value}`]) {
      result.push(next);
      tokens[`${next.type}:${next.value}`] = next;
    }
    tokIter.stepForward();
  }

  // Request the rules from the server
  requestRules(result, currentLang);
}

function requestRules(tokens, lang) {
  $.ajax({
    method: "POST",
    url: "./app/rules/" + lang,
    data: {
      tokens: tokens,
    },
    dataType: "JSON",
    useQuerystring: true,
  })
    .done(function (data) {
      if (data) {
        parseRules(data);
      }
    })
    .fail(function (err) {
      console.log(err);
      // alert("Could not pull rules from the server", err);
    });
}

// parses each of the new rules to add to the already constructed object
function parseRules(newRules) {
  Object.keys(newRules).forEach((key) => {
    rules[key] = newRules[key];
  });
}

// each time we click in the editor...
editor.on("click", function (e) {
  let pos = e.$pos;
  let sec = editor.session;
  let tolk = sec.getTokenAt(pos.row, pos.column); // Locate the token at the current position

  // If we're dealing with text, no rules for that
  if (tolk && tolk?.type != "text") {
    let rule = rules[`${tolk.type}:${tolk.value}`]; // See if we have the rule for that given token
    if (rule) {
      let newHtml = rule.html;

      // *** For now, we're going to just hold off on sending stats and feedback
      // sending the statistics
      // sendStat({ tag: rule.tag });

      display.innerHTML = newHtml.replace(/\\n/g, "\n"); // This makes it so a 'new line' can appear inside code segments of explanations
      // + addFeedbackButton(rules[`${tolk.type}:${tolk.value}`].tag);

      // Both in 'display.js'
      newTabLinks(display);
      highlightCode();
    } else {
      // If we don't have the rule, then it needs to be developed
      display.innerHTML = `
                <p>There is no description of this token: "${tolk.value}"</p>
                <p>Either the keyword isn't part of the javascript language, or an explanation hasn't been developed yet.</p>
                <p>Click on or after a keyword to learn more about it</p>
            `;
    }
  } else {
    display.innerHTML = `<p>Click on or after a keyword to learn more about it</p>`;
  }
});

// Whenever we make a change in the editor, tokenize it (but only after a bit)
editor.on("change", debounce(tokenizeDocument, 400));

// Credit David Walsh (https://davidwalsh.name/javascript-debounce-function)
function debounce(func, wait, immediate) {
  var timeout;
  return function executedFunction() {
    var context = this;
    var args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

// adds the feedback button to each card
function addFeedbackButton(tag) {
  return `<button id="feedbackButton" onClick="openFeedbackModal('${tag}')">Feedback</button>`;
}

// sends the tag for statistics
function sendStat(tag) {
  $.ajax({
    method: "POST",
    url: "./app/stat",
    data: tag,
  });
}