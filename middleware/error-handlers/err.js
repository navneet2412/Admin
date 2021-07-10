exports.getError = (error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.render("err",{
    message: message,
    data: data,
  });
};
