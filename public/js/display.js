// set the display height to change when the window changes
window.onresize = changeDisplayHeight;
function changeDisplayHeight() {
  document.querySelector("#display").style.height =
    window.innerHeight - 70 + "px";
}
changeDisplayHeight();

// Takes all the links of an element and sets them to open in a new tab
function newTabLinks(el) {
  el.querySelectorAll("a").forEach((link) => {
    link.setAttribute("target", "_blank");
  });
}

// uses 'highlighjs' to highlight code portions of the document
function highlightCode() {
  document.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightBlock(block);
  });
}
