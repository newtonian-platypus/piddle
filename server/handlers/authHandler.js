const userController = require('../dbControllers/userController');
const jwt = require('jwt-simple');
const passport = require('../passportConfig');
const config = require('../../config');

/**
 * The logic functions and helpers for handling requests
 * to the authentication endpoints.
 * @module Server: Authentication Handler
 */

/**
 * Use the passport `authenticate` method to extract the JSON Web Token
 * from the request. If there is not a valid token present, the response
 * status is set as 401 UNAUTHORIZED. If a valid token is present, the user
 * info is set on `request.user`.
 */
const ensureAuthenticated = passport.authenticate('jwt', { session: false });

/**
 * Generate a JSON Web Token for a user given a `User` instance from the database.
 * Encodes the user's `id`, `emailAddress`, `name`, `squareId`, and `paypalId`.
 * @param {Object} userInstance - User instance retrieved from the database.
 *
 * @returns {Object} JSON Web Token, signed with the secret from `config.js`.
 */
const generateJWT = (userInstance) => {
  const payload = {
    id: userInstance.id,
    emailAddress: userInstance.emailAddress,
    name: userInstance.name,
    squareId: userInstance.squareId,
    paypalId: userInstance.paypalId,
    phone: userInstance.phone,
  };
  return jwt.encode(payload, config.jwt.secret, 'HS512');
};

/**
 * Log in a user by generating a JSON Web Token that
 * the client will store and send with future requests.
 * The logic for POST /auth/login.
 * @param {readableStream} request Request stream. See API documentation for parameters.
 * @param {writeableStream} response Response stream. See API documentation for parameters.
 */
const loginHandler = (request, response) => {
  const emailAddress = request.body.emailAddress;
  const password = request.body.password;
  userController.findUserByEmailAddress(emailAddress)
    .then((userInstance) => {
      if (!userInstance) {
        return response.status(400).json({
          error: {
            message: 'Incorrect email address or password',
          },
        });
      }
      return userController.verifyUser(emailAddress, password)
        .then((match) => {
          if (!match) {
            return response.status(400).json({
              error: {
                message: 'Incorrect email address or password',
              },
            });
          }
          return response.status(201).json({
            data: {
              message: 'Successfully generated user token',
              token: generateJWT(userInstance),
            },
          });
        });
    })
    .catch(() => response.status(500).json({
      error: {
        message: 'There was an error processing your login.',
      },
    }));
};

/**
 * Create a user in the database and genertate a JSON Web Token for the user.
 * The logic for POST /auth/signup.
 * @param {readableStream} request Request stream. See API documentation for parameters.
 * @param {writeableStream} response Response stream. See API documentation for parameters.
 */
const signupHandler = (request, response) => {
  userController.findUserByEmailAddress(request.body.emailAddress)
    .then((userInstance) => {
      if (userInstance) {
        return response.status(400).json({
          error: {
            message: 'User already exists.',
          },
        });
      }
      // user does not exist
      return userController.createUser(request.body)
        .then(createdUserInstance =>
          response.status(201).json({
            data: {
              message: 'Successfully created user and generated user token',
              token: generateJWT(createdUserInstance),
            },
          })
        )
        .catch(() =>
          response.status(400).json({
            error: {
              message: 'There was a problem creating the user',
            },
          })
        );
    });
};

/**
 * Update a user record.
 * The logic for PUT /auth/user/:id.
 * @param {readableStream} request Request stream. See API documentation for parameters.
 * @param {writeableStream} response Response stream. See API documentation for parameters.
 */
const updateUserHandler = (request, response) => {
  const userId = request.params.id;
  const loggedInUserId = request.user.id;
  if (+userId !== +loggedInUserId) {
    return response.status(403).json({
      error: {
        message: 'You may not edit other user\'s data',
      },
    });
  }
  return userController.updateUser(userId, request.body)
    .then((userInstance) => {
      response.status(200).json({
        data: {
          message: 'User successfully updated. New token included',
          token: generateJWT(userInstance),
        },
      });
    })
    .catch(() => response.status(500).json({
      error: {
        message: 'There was an error updating the user',
      } })
    );
};

module.exports = {
  ensureAuthenticated,
  loginHandler,
  signupHandler,
  updateUserHandler,
};
