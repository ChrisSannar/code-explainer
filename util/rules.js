const sanitize = require('sanitize-html');

// Formats a token rule to save in the database
function formatTokenRule(rule) {
  if (rule._id) {
    delete rule._id;
  }

  // Format the token property
  if (!rule.tokenType || !rule.tokenValue) {
    let tokenInfo = rule.token.split(`:`);
    rule.tokenType = tokenInfo[0];
    rule.tokenValue = tokenInfo[1];
  }

  // Sanitize the html
  rule.html = sanitize(rule.html, {
    allowedTags: sanitize.defaults.allowedTags.concat(['h1', 'h2'])
  });

  return rule;
}

// Formats a regex rule to save in the database
function formatRegexRule(rule) {
  if (rule._id) {
    delete rule._id
  }

  // Sanitize the html
  rule.html = sanitize(rule.html, {
    allowedTags: sanitize.defaults.allowedTags.concat(['h1', 'h2'])
  });

  return rule;
}

// Given a set of tokens and an array of options, returns a 'hash table' of the rules
function getRulesFromTokens(tokens, dbTokens, dbRegex) {
  // Our resulting rules to send
  let rules = {};

  // For each of our editor tokens...
  for (let token of tokens) {
    let tokenSig = `${token.type}:${token.value}`;  // Get the token signature
    let found = dbTokens.find(val => val.token == tokenSig); // lets see if it's found in the tokens database
    if (found) {
      // In the case that there is a token of the rule... then we're good!
      rules[tokenSig] = found;  // Tack and move on to the next
    } else {
      // Otherwise we're dealing with a regex rule
      found = dbRegex.find(val => {

        // If we don't have a regex value, then we just check if the types match
        if (!val.regex) {
          return val.tokenType === token.type;
        } else {
          // Otherwise we check to see if 
          let regy = new RegExp(val.regex, 'g');
          let result = regy.test(token.value) && val.tokenType === token.type;
          return result;
        }
      });

      // Once we find the rule, tack it on. Null if we don't find it.
      rules[tokenSig] = found;
    }
  }
  // Once we're done, return the rules
  return rules;
}

module.exports = {
  formatTokenRule,
  formatRegexRule,
  getRulesFromTokens,
}