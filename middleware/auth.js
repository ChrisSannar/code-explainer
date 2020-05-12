/*
  Ideas of what this file might include:
    * Permissions (dictated by the session)
    * Improper cookie setup
*/

/*
  Signing In
*/
// Validates if we've already signed in
const signedInChecker = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/dashboard/login');
  }
}

// Redire
const redirectIfSignedIn = (req, res, next) => {
  // if (req.cookies && req.cookies.user_sid && req.session.user) {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    next();
  }
}

/*
  Cookies
*/
// Make sure there is a user tied to each session via cookie. If not, we'll reset.
const cookieChecker = (req, res, next) => {
  if (req.cookies && req.cookies.user_sid && !req.session.user) {
    res.clearCookie('user_sid');
  }
  next();
}

module.exports = {
  signedInChecker,
  redirectIfSignedIn,
  cookieChecker,
}