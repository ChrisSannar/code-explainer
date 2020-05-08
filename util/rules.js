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

module.exports = {
  formatTokenRule,
  formatRegexRule,
}