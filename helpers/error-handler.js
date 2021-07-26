function errorHandler(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      message: "UnAuthorized User"
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: err
    });
  }

  console.log('error', err)
  return res.status(500).json({
    message: "Internal Server Error"
  });
}
module.exports = errorHandler;
