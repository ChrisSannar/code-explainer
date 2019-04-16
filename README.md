# code-explainer
A online tool for beginner programmers to explain code

To run the code locally, navigate to the repository and install the needed dependencies with `npm install` and start the application with `npm start`.
To run in development mode with nodemon and developer tools, use `npm run dev` instead.

The application runs primarily off of a set of JSON "Rules" that determine what each keyword links to.
To do this, server uses a localhost mongo database named 'code-explainer' and pulls from 2 primary collections: `tokenRules` and `regexRules`.
Each "Rule" is linked to the Ace code editor's token for that given keyword. 
Most constant keywords such as javascripts `let` and `console` are constant and won't change. 
However tokens that have varying values such as variable names and numbers will have differing values are identified by a regular expression. 
The general rule of thumb is that it's better to make a token rule, but if that isn't possible use a regex rule.

The token rule is as follows:
```
{
  "tag": "unique-identifier",
  "token" : "storage.type:let",
  "tokenType" : "storage.type",
  "tokenValue" : "let",
  "html": "<p>I am displayed on the right</p>",
}
```

A regex rule is similar:

```
{
  "tag": "unique-identifier",
  "regex" : "\w+",
  "tokenType" : "storage.type",
  "html": "<p>I am displayed on the right</p>",
}
```

If the regex field is left empty, then the selected keyword will be identified by its `tokenType` only.

---

In addition to the rules in the database, the 'feedback' button given to every rule is stored into a collection entitled "<language>Feedback" with a field for the given tag of the token.

More features will follow in the next version

