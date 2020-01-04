const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  
  try {

    let authToken;

    // just for mocking out the GET /users/me/profileImage route so I don't have to add headers in the browser
    if (req.query.auth) {
      authToken = req.query.auth;
    } else {
      // pull the token from the authorization header and remove the Bearer portion that is prepended to it
      authToken = req.header('authorization').replace('Bearer ', '');
    }

    // verify that the authToken was created with the secret stored on this server (this doesn't check the token's contents, simply decodes it so we can use them down the line)
    const decodedPayload = jwt.verify(authToken, process.env.JWT_SECRET);

    // pull the user from the db whose _id is in the jwt token, and verify that the authToken is in the array of authTokens the user has
    const user = await User.findOne({ _id: decodedPayload._id, 'authTokens.token': authToken });

    await user.populate('tasks').execPopulate();

    if (!user) {
      throw new Error();
    }

    // store the user on the request object so the next() route doesn't have to pull the user from the db again
    req.user = user;
    req.authToken = authToken;

    next();
    
  } catch (e) {
    res.status(401).send({ error: 'Invalid authentication token' });
  }

};

module.exports = auth;