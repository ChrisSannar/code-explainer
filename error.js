const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}

const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // If we hit a 200 error here, then some route had an error
  res.status(statusCode);
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === "production" ? '' : error.stack,
  });
}

const teaPotHandler = (error, req, res, next) => {
  res.status(418)
  res.json({
    message: `I am a teapot.`
  })
}

module.exports = {
  notFound,
  errorHandler,
}