const Roles = require('../models').roles;
const Products = require('../models').products;
const Clients = require('../models').clients;

/**
 * Function for creating a Role
 * @param {*} req
 * @param {*} res
 */
exports.createRole = async (req, res) => {
  const { name, description, product_id, client_id, code } = req.body;
  try {
    let result = await Roles.findOne({ where: { name } });

    if (result !== null) {
      res.status(200).json({
        error: 1,
        msg: 'Role exists!',
      });
    } else {
      RoleResult = await Roles.findOne({ where: { code } });
      result = await Products.findOne({ where: { id: product_id } });
      ClientResult = await Clients.findOne({ where: { id: client_id } });
      if (RoleResult !== null) {
        res.status(400).json({
          error: 1,
          msg: 'Code exists!',
        });
      } else if (result === null) {
        res.status(400).json({
          error: 1,
          msg: 'Product does not exist!',
        });
      } else if (ClientResult === null) {
        res.status(400).json({
          error: 1,
          msg: 'Client does not exist!',
        });
      } else {
        const response = await Roles.create({
          ...req.body,
        });
        res.status(200).json({
          error: 0,
          msg: 'Role created successfully!',
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
 * Function to get all Roles
 * @param {*} req
 * @param {*} res
 */
exports.getAllRoles = async (req, res) => {
  const { users_code } = req.query;

  let whereParam =
    typeof users_code !== 'undefined'
      ? {
          model: Products,
          where: { product_code: users_code },
        }
      : {
          model: Products,
        };

  try {
    const results = await Roles.findAll({
      include: [{ ...whereParam }, { model: Clients }],
    });
    res.json({
      error: 0,
      results,
    });
  } catch (error) {
    res.status(400).json({
      error: 1,
      msg: error,
    });
  }
};

/**
 * Function to get a Role by ID
 * @param {*} req
 * @param {*} res
 */
exports.getRoleByID = async (req, res) => {
  const { id } = req.params;
  try {
    let result = await Roles.findOne({
      where: { id },
      include: [Products, Clients],
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
 * Function to update a Role by ID
 * @param {*} req
 * @param {*} res
 */
exports.updateRole = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Roles.findOne({ where: { id } });
    if (result === null) {
      res.status(400).json({
        error: 1,
        msg: 'Role does not exist!',
      });
    } else {
      const response = await Roles.update(req.body, {
        where: { id },
      });
      res.status(200).json({
        error: 0,
        msg: 'Role updated successfully!',
      });
    }
  } catch (error) {
    res.status(400).json({
      error: 1,
      msg: error,
    });
  }
};

/**
 * Function to delete a Role by ID
 * @param {*} req
 * @param {*} res
 */
exports.deleteRole = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Roles.findOne({ where: { id } });
    if (result === null) {
      res.status(400).json({
        error: 1,
        msg: 'Role does not exist!',
      });
    } else {
      const response = await Roles.destroy({ where: { id } });
      res.status(200).json({
        error: 1,
        msg: 'Role deleted successfully!',
      });
    }
  } catch (error) {
    res.status(400).json({
      error: 1,
      msg: error,
    });
  }
};
