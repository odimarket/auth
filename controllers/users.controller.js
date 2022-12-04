const Users = require('../models').users;
const Products = require('../models').products;
const Clients = require('../models').clients;
const Roles = require('../models').roles;
const Groups = require('../models').groups;

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
    product_id,
    client_id,
    group_id,
    role_id,
  } = req.body;
  try {
    let result = await Users.findOne({
      where: {
        [Op.or]: [{ email }, { phone }],
      },
    });

    if (result !== null) {
      res.status(200).json({
        error: 1,
        msg: 'User account exists!',
      });
    } else {
      result = await Products.findOne({ where: { id: product_id } });
      if (result === null) {
        res.status(200).json({
          error: 1,
          msg: 'Product does not exist!',
        });
      } else {
        result = await Clients.findOne({ where: { id: client_id } });
        if (result === null) {
          res.status(200).json({
            error: 1,
            msg: 'Client does not exist!',
          });
        } else {
          result = await Groups.findOne({ where: { id: group_id } });
          if (result === null) {
            res.status(200).json({
              error: 1,
              msg: 'Group does not exist!',
            });
          } else {
            result = await Roles.findOne({ where: { id: role_id } });
            if (result === null) {
              res.status(200).json({
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
                product_id,
                client_id,
                group_id,
                role_id,
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

              let pass_token_expiry = new Date(
                new Date().getTime() + 500 * 60000
              );

              // Update
              response = await Users.update(
                { sso_id: otpID, sso_token_expiry: pass_token_expiry },
                { where: { phone } }
              );

              // setup mail credentials
              let params = {};
              params.logo = Logo;
              params.header_color = 'white';

              const link = `http://localhost:4000/verify/email/${token}`;

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
  let { user, password } = req.body;
  try {
    let result = await Users.findOne({
      where: { [Op.or]: [{ phone: user }, { email: user }] },
      include: [{ model: Products }, { model: Roles }],
    });
    if (result === null) {
      res.status(200).json({
        error: 1,
        msg: 'Incorrect Login details!',
      });
    } else {
      if (result.active !== 1) {
        res.status(200).json({
          error: 1,
          msg: 'Account is not active',
        });
      } else {
        const match = await bcrypt.compare(password, result.password);
        if (!match) {
          res.status(200).json({
            error: 1,
            msg: 'Incorrect Login details!',
          });
        } else {
          const raw_data = {
            first_name: result.first_name,
            last_name: result.last_name,
            name: result.name,
            email: result.email,
            phone: result.phone,
            email_verified: result.email_verified,
            product: result.product,
            role: result.role,
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
          // const token = jwt.sign(raw_data, process.env.private_sso_key);
          res.json({
            error: 0,
            msg: 'User signed in successfully!',
            token,
            data: raw_data,
          });
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
  try {
    const result = await Users.findAll({
      include: [{ model: Groups }, { model: Roles }],
    });
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
 * Function to get a User by ID
 * @param {*} req
 * @param {*} res
 */
exports.getUserByID = async (req, res) => {
  const { id } = req.params;
  try {
    let result = await Users.findOne({
      where: { id },
      include: [
        { model: Products },
        { model: Clients },
        { model: Groups },
        { model: Roles },
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
  const { id } = req.params;
  try {
    let result = await Users.findOne({ where: { id } });
    if (result === null) {
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
        const response = await Users.update(req.body, {
          where: { id },
        });
        res.status(200).json({
          error: 0,
          msg: 'User updated successfully!',
        });
      }
    }
  } catch (error) {
    res.status(400).json({
      error: 1,
      msg: error,
    });
  }
};

/**
 * Function to delete a User by ID
 * @param {*} req
 * @param {*} res
 */
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Users.findOne({ where: { id } });
    if (result === null) {
      res.status(400).json({
        error: 1,
        msg: 'User does not exist!',
      });
    } else {
      const response = await Users.destroy({ where: { id } });
      res.status(200).json({
        error: 1,
        msg: 'User deleted successfully!',
      });
    }
  } catch (error) {
    res.status(400).json({
      error: 1,
      msg: error,
    });
  }
};
