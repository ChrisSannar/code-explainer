let rules = [
    {
        "tag": "function",
        "regex": /function/g,
        "replace": null,
        "color": "green",
        "html": "<p>This is a function<p>",
        "links" : []
    },
    {
        "tag": "test",
        "regex": /test/g,
        "replace": null,
        "color": "yellow",
        "html": "<h3>This is a test</h3>",
        "links" : []
    },
    {
        "tag": "Parenthesis",
        "regex": /\(\)/g,
        "replace": null,
        "color": "blue",
        "html": "<h3>Parenthesis</h3><p>These are following a function call to call it</p>",
        "links" : []
    }
];