const Users = require('../models').users;
const Products = require('../models').products;
const Clients = require('../models').clients;
const Roles = require('../models').roles;

const config = require('../config/sysConfig');

const {
  TermiiMailProvider,
  mailer_template,
  Mailer,
  Logo,
} = require('../lib/Engine');

const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const otpGenerator = require('otp-generator');

const saltRounds = 10;
const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

/**
 * Function for creating a User
 * @param {*} req
 * @param {*} res
 */
exports.createUser = async (req, res) => {
  let {
    first_name,
    last_name,
    name,
    email,
    phone,
    password,
    role,
    product_code,
    client,
  } = req.body;
  try {
    let result = await Users.findOne({
      where: {
        [Op.or]: [{ email }, { phone }],
      },
    });

    if (result !== null) {
      res.status(400).json({
        error: 1,
        msg: 'User account exists!',
      });
    } else {
      productResult = await Products.findOne({ where: { product_code } });
      clientResult = await Clients.findOne({ where: { secret: client } });

      if (productResult === null) {
        res.status(400).json({
          error: 1,
          msg: 'Product does not exist!',
        });
      } else if (clientResult === null) {
        res.status(400).json({
          error: 1,
          msg: 'Client does not exist!',
        });
      } else {
        roleResult = await Roles.findOne({ where: { code: role } });
        if (roleResult === null) {
          res.status(400).json({
            error: 1,
            msg: 'Role does not exist!',
          });
        } else {
          password = hashPassword(password);

          let response = await Users.create({
            first_name,
            last_name,
            name,
            email,
            phone,
            password,
            role_id: roleResult.id,
            product_id: productResult.id,
            client_id: clientResult.id,
          });

          const otpID = otpGenerator.generate(6, {
            digits: true,
            specialChars: false,
          });
          let _data = {
            otpID,
            email,
          };
          const token = jwt.sign(_data, process.env.private_sso_key);

          let pass_token_expiry = new Date(new Date().getTime() + 500 * 60000);

          // Update
          response = await Users.update(
            { sso_id: otpID, sso_token_expiry: pass_token_expiry },
            { where: { phone } }
          );

          // setup mail credentials
          let params = {};
          params.logo = Logo;
          params.header_color = 'white';

          const link = `${clientResult.url}/verify/${token}`;

          params.body = `<p style="font-size:1.7em;"><b>Hi, ${first_name}</b></p>`;
          params.body += `<p style="font-size: 1.4em;">Welcome to ${process.env.APP_NAME},</p>`;
          params.body += `
                        <p style="font-size: 1.4em;">We are glad to have you on board and can't wait for you to enjoy the amazing features we offer!.</p><br/>
                        <p style="font-size: 1.4em;">To proceed, you have to click the confirm email address button below!</p>
                    `;
          params.body += `
                        <p style="margin-top:30px; font-size: 1em;">
                            <a href="${link}" target="_BLANK" title="click to verify your email" style="padding:20px;color:white;font-size:1.2em;background-color:#000;text-decoration:none;border-radius:5px;border:0">Confirm email</a>
                        </p>
                    `;
          params.footer = '';
          params.date = new Date().getFullYear();

          let params2 = {
            email,
            subject: `Welcome to ${process.env.APP_NAME}`,
          };

          const template = mailer_template(params);

          // Send Mail
          Mailer(template, params2)
            .then((response) => {
              res.json({
                error: 0,
                msg: `Registration successful! A verification link was sent to this mailbox.`,
                response,
              });
            })
            .catch((err) => {
              res.json({
                error: 0,
                msg: 'Registration successful! Mail could not be sent!',
                err,
              });
            });

          // res.status(200).json({
          //     error: 0,
          //     msg: "User created successfully!"
          // })
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
 * Function to signin user
 * @param {*} req
 * @param {*} res
 */
exports.signInUser = async (req, res) => {
  let { user, password, product_code } = req.body;
  try {
    let result = await Users.findOne({
      where: { [Op.or]: [{ phone: user }, { email: user }] },
      include: [{ model: Products }, { model: Roles }, { model: Clients }],
    });
    if (result === null) {
      res.status(400).json({
        error: 1,
        msg: 'Incorrect Login details!',
      });
    } else {
      if (result.active !== 1) {
        res.status(400).json({
          error: 1,
          msg: 'Account is not active',
        });
      } else {
        const match = await bcrypt.compare(password, result.password);
        if (!match) {
          res.status(400).json({
            error: 1,
            msg: 'Incorrect Login details!',
          });
        } else {
          // get product
          const productResult = await Products.findOne({
            where: { product_code },
          });
          if (productResult === null) {
            res.status(400).json({
              error: 1,
              msg: 'Product not found!',
            });
          } else {
            // check user's product
            const userProduct = await Users.findOne({
              where: {
                [Op.or]: [{ phone: user }, { email: user }],
                product_id: productResult.id,
              },
            });
            if (userProduct === null) {
              res.status(400).json({
                error: 1,
                msg: 'You are not an authorized user of this product!',
              });
            } else {
              const raw_data = {
                id: result.id,
                first_name: result.first_name,
                last_name: result.last_name,
                name: result.name,
                email: result.email,
              };

              const otpID = otpGenerator.generate(20, {
                digits: true,
                specialChars: false,
              });
              let _data = {
                otpID,
                email: result.email,
              };
              const token = jwt.sign(_data, process.env.private_sso_key);

              // Update
              response = await Users.update(
                { sso_id: otpID },
                { where: { [Op.or]: [{ phone: user }, { email: user }] } }
              );

              res.json({
                error: 0,
                msg: 'User signed in successfully!',
                token,
                data: raw_data,
              });
            }
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
 * Function to get all Users
 * @param {*} req
 * @param {*} res
 */
exports.getAllUsers = async (req, res) => {
  const { product_code } = req.body;
  try {
    // get product
    const productResult = await Products.findOne({
      where: { product_code },
    });

    if (productResult === null) {
      res.status(400).json({
        error: 1,
        msg: 'Product not found!',
      });
    } else {
      const result = await Users.findAll({
        include: [{ model: Products }, { model: Roles }],
        where: { product_id: productResult.id },
        attributes: [
          'id',
          'first_name',
          'last_name',
          'name',
          'email',
          'phone',
          'email_verified',
          'phone_verified',
          'active',
          'createdAt',
        ],
      });
      res.json({
        error: 0,
        result,
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
 * Function to get a User by ID
 * @param {*} req
 * @param {*} res
 */
exports.getUserByID = async (req, res) => {
  const { id } = req.params;

  try {
    let result = await Users.findOne({
      where: { id },
      include: [{ model: Products }, { model: Roles }],
      attributes: [
        'id',
        'first_name',
        'last_name',
        'name',
        'email',
        'phone',
        'email_verified',
        'phone_verified',
        'active',
        'createdAt',
      ],
    });
    result = result === null ? {} : result;
    res.json({
      error: 0,
      result,
    });
  } catch (error) {
    res.status(400).json({
      error: 1,
      msg: error,
    });
  }
};

/**
 * Function to update a User by ID
 * @param {*} req
 * @param {*} res
 */
exports.updateUser = async (req, res) => {
  const { id } = req._data;

  try {
    let userResult = await Users.findOne({
      where: { id },
      attributes: ['id', 'email', 'phone'],
    });
    if (userResult === null) {
      res.status(400).json({
        error: 1,
        msg: 'User does not exist!',
      });
    } else {
      if ('product_id' in req.body) {
        result = await Products.findOne({ where: { id: req.body.product_id } });
        if (result === null) {
          res.status(400).json({
            error: 1,
            msg: 'Product does not exist!',
          });
        }
      } else if ('role_id' in req.body) {
        result = await Roles.findOne({ where: { id: req.body.role_id } });
        if (result === null) {
          res.status(400).json({
            error: 1,
            msg: 'Role does not exist!',
          });
        }
      } else {
        if (req.body.product_code !== undefined) {
          delete req.body.product_code;
        }
        if (req.body.password !== undefined) {
          delete req.body.password;
        }

        const response = await Users.update(req.body, {
          where: { id },
        });
        res.status(200).json({
          error: 0,
          msg: 'User updated successfully!',
          data: { ...userResult.dataValues },
        });
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
 * Function to delete a User
 * @param {*} req
 * @param {*} res
 */
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const { product_code } = req.body;
  try {
    const result = await Users.findOne({
      include: [{ model: Products }, { model: Roles }],
      where: { id },
    });
    if (result === null) {
      res.status(400).json({
        error: 1,
        msg: 'User does not exist!',
      });
    } else {
      const response = await Users.destroy({ where: { id } });
      res.status(200).json({
        error: 0,
        msg: 'User deleted successfully!',
        data: {
          phone: result.phone,
          email: result.email,
        },
      });
    }
  } catch (error) {
    res.status(400).json({
      error: 1,
      msg: error,
    });
  }
};
