const jwt = require("jsonwebtoken");

const User = require("../models/user-model");

exports.isUser = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  try {
    if (!authHeader) {
      const error = new Error('Not Authorized');
      error.status = 401;
      return next(error);
    }
    const token = authHeader.split(' ')[1]; //Authorization header looks like {Authorization: 'Bearer ' + this.props.token} on the front end
    let decodedToken;

    decodedToken = jwt.verify(token, 'your_agent_secret_key');
    if (!decodedToken) {
      const error = new Error('Not Authorized');
      error.status = 401;
      next(error);
    }
    const user = await User.findOne({ where: { email: decodedToken.email } });
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      next(error);
    }
    req.userId = decodedToken.userId; //setting userId to request
    next();
  } catch (error) {
    error.status = 500;
    next(error);
  }
};