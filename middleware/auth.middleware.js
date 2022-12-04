const Joi = require('joi');

const models = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 10;
const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

const schema = Joi.object({
  user: Joi.string().required(),
});

const passwordSchema = Joi.object({
  password: Joi.string().required(),

  password_confirmation: Joi.ref('password'),
});

const signinSchema = Joi.object({
  user: Joi.string().required(),
  password: Joi.string().required(),
});

/**
 * Validate user's input
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.isInputValidated = async (req, res, next) => {
  const result = schema.validate(req.body);
  // console.log(result)
  if ('error' in result) {
    res.status(400).json({
      error: 1,
      data: result,
      msg: 'Validation error(s)',
    });
  } else {
    next();
  }
};

/**
 * Validate user's password input
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.isPasswordInputValidated = async (req, res, next) => {
  const result = passwordSchema.validate(req.body);
  // console.log(result)
  if ('error' in result) {
    res.status(400).json({
      error: 1,
      data: result,
      msg: 'Validation error(s)',
    });
  } else {
    next();
  }
};

/**
 * Validate login input
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.isSigninInputValidated = async (req, res, next) => {
  const result = signinSchema.validate(req.body);
  // console.log(result)
  if ('error' in result) {
    res.status(400).json({
      error: 1,
      data: result,
      msg: 'Validation error(s)',
    });
  } else {
    next();
  }
};

/**
 * Function to verify the product that a user's role belongs to
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.verifyOwner = async (req, res, next) => {
  const { product_id, user } = req.body;
  try {
    let result = await models.Users.findOne({
      where: {
        [Op.or]: [{ phone: user }, { email: user }],
        include: [{ model: Products }, { model: Roles }],
      },
    });
    if (result === null) {
      res.json({
        error: 1,
        msg: 'User does not exist!',
      });
    } else {
      // Check if product exists
      let product_result = await models.Products.findOne({
        where: { id: product_id },
      });
      if (product_result === null) {
        res.json({
          error: 1,
          msg: 'Product does not exist!',
        });
      } else {
        // Check if the user's role exists
        let role_result = await models.Roles.findOne({
          where: { id: product_result.role_id },
        });
        if (role_result === null) {
          res.json({
            error: 1,
            msg: 'Role does not exist!',
          });
        } else {
          // Check if the provided product id is the same as the one associated with the role
          if (product_id !== role_result.product_id) {
            res.json({
              error: 1,
              msg: 'User does not belong this product!',
            });
          } else {
            next();
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: 1,
      msg: error,
    });
  }
};

/**
 * Function to verify email address after registration
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.verifyEmail = async (req, res, next) => {
  const { access_token } = req.params;

  try {
    const decrypted_data = await jwt.verify(
      access_token,
      process.env.private_sso_key
    );
    let user_data = await models.users.findOne({
      where: { email: decrypted_data.email, sso_id: decrypted_data.otpID },
    });

    if (user_data === null) {
      res.status(400).json({
        error: 1,
        msg: 'Token is invalid!',
      });
    } else {
      // activate account and activate email
      user_data.active = 1;
      user_data.email_verified = 1;
      user_data.save();

      req._data = {
        access_token,
        ...decrypted_data,
      };
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: 1,
      msg: error,
    });
  }
};

/**
 * Function to verify password reset otp through the access_token parameter
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.verifyPasswordResetOtp = async (req, res, next) => {
  const { access_token } = req.params;

  try {
    const decrypted_data = await jwt.verify(
      access_token,
      process.env.private_sso_key
    );
    let user_data = await models.users.findOne({
      where: { email: decrypted_data.email, sso_id: decrypted_data.otpID },
    });

    if (user_data === null) {
      res.status(400).json({
        error: 1,
        msg: 'Token is invalid!',
      });
    } else {
      let current_date = new Date().getTime();
      let password_expiration = new Date(user_data.sso_token_expiry).getTime();

      if (current_date >= password_expiration) {
        res.json({
          error: 1,
          msg: 'Password reset link has expired!',
        });
      } else {
        req._data = {
          access_token,
          ...decrypted_data,
        };
        next();
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: 1,
      msg: error,
    });
  }
};

/**
 * Function to verify password reset otp through the access_token passed as header
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.verifyPasswordResetOtpPassedAsHeader = async (req, res, next) => {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];

    try {
      const decrypted_data = await jwt.verify(
        bearerToken,
        process.env.private_sso_key
      );
      let user_data = await models.users.findOne({
        where: { email: decrypted_data.email, sso_id: decrypted_data.otpID },
      });

      if (user_data === null) {
        res.status(400).json({
          error: 1,
          msg: 'Token is invalid!',
        });
      } else {
        let current_date = new Date().getTime();
        let password_expiration = new Date(
          user_data.sso_token_expiry
        ).getTime();

        if (current_date >= password_expiration) {
          res.json({
            error: 1,
            msg: 'Password reset link has expired!',
          });
        } else {
          req._data = {
            bearerToken,
            ...decrypted_data,
          };
          next();
        }
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        error: 1,
        msg: error,
      });
    }
  } else {
    res.status(400).json({
      error: 1,
      msg: {},
    });
  }
};

/**
 * Function to authenticate any kind of user
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

exports.authenticateUser = async (req, res, next) => {
  const bearerHeader = req.headers['authorization'];

  try {
    if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];

      const user_data = await jwt.verify(
        bearerToken,
        process.env.private_sso_key
      );

      let user_details = await models.users.findOne({
        where: { email: user_data.email, sso_id: user_data.otpID },
        include: [models.products, models.clients, models.groups, models.roles],
        attributes: [
          'id',
          'first_name',
          'last_name',
          'name',
          'email',
          'phone',
          'phone_verified',
          'email_verified',
          'active',
          'createdAt',
          'updatedAt',
        ],
      });

      if (user_details === null) {
        res.status(400).json({
          error: 1,
          msg: 'Auth token is invalid!',
        });
      } else {
        req._data = {
          bearerToken,
          ...user_details.dataValues,
        };
        next();
      }
    } else {
      res.status(400).json({
        error: 1,
        msg: {},
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: 1,
      msg: error,
    });
  }
};

/**
 * Function to authenticate admin
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.authenticateAdmin = async (req, res, next) => {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];

    const user_data = await jwt.verify(
      bearerToken,
      process.env.private_sso_key
    );

    let user_details = await models.users.findOne({
      where: { email: user_data.email, sso_id: user_data.otpID },
      include: [models.products, models.roles],
      attributes: [
        'id',
        'first_name',
        'last_name',
        'name',
        'email',
        'phone',
        'phone_verified',
        'email_verified',
        'active',
        'createdAt',
        'updatedAt',
      ],
    });

    if (user_details === null) {
      res.status(400).json({
        error: 1,
        msg: 'Auth token is invalid!',
      });
    } else if (
      user_details.product.product_code !== 'OAUTH' &&
      !user_details.role.name.toLowerCase().includes('admin')
    ) {
      res.status(400).json({
        error: 1,
        msg: 'Permission Error!',
      });
    } else {
      //   req._data = {
      //     bearerToken,
      //     ...user_details.dataValues,
      //   };
      next();
    }
  } else {
    console.log;
    res.status(400).json({
      error: 1,
      msg: {},
    });
  }
};
