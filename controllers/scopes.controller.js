const Scopes = require('../models').scopes;
const Roles = require('../models').roles;

/**
 * Function for creating a Scope
 * @param {*} req
 * @param {*} res
 */
exports.createScope = async (req, res) => {
  const { name, code, role_id } = req.body;
  try {
    let result = await Scopes.findOne({ where: { name } });
    let ScopeCodeResult = await Scopes.findOne({ where: { code } });

    if (result !== null) {
      res.status(200).json({
        error: 1,
        msg: 'Scope exists!',
      });
    } else if (ScopeCodeResult !== null) {
      res.status(200).json({
        error: 1,
        msg: 'Code exists!',
      });
    } else {
      result = await Roles.findOne({ where: { id: role_id } });
      if (result === null) {
        res.status(200).json({
          error: 1,
          msg: 'Role does not exist!',
        });
      } else {
        const response = await Scopes.create({
          ...req.body,
        });
        res.status(200).json({
          error: 0,
          msg: 'Scope created successfully!',
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
 * Function to get all Scopes
 * @param {*} req
 * @param {*} res
 */
exports.getAllScopes = async (req, res) => {
  const { userProduct } = req;

  const whereParam =
    typeof code !== 'undefined'
      ? {
          model: Roles,
          where: { code: userProduct.role.code },
        }
      : {
          model: Roles,
        };
  try {
    const results = await Scopes.findAll({
      include: [Roles],
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
 * Function to get a Scope by ID
 * @param {*} req
 * @param {*} res
 */
exports.getScopeByID = async (req, res) => {
  const { id } = req.params;
  try {
    let result = await Scopes.findOne({ where: { id }, include: Roles });
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
 * Function to update a Scope by ID
 * @param {*} req
 * @param {*} res
 */
exports.updateScope = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Scopes.findOne({ where: { id } });
    if (result === null) {
      res.status(400).json({
        error: 1,
        msg: 'Scope does not exist!',
      });
    } else {
      const response = await Scopes.update(req.body, {
        where: { id },
      });
      res.status(200).json({
        error: 0,
        msg: 'Scope updated successfully!',
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
 * Function to delete a Scope by ID
 * @param {*} req
 * @param {*} res
 */
exports.deleteScope = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Scopes.findOne({ where: { id } });
    if (result === null) {
      res.status(400).json({
        error: 1,
        msg: 'Scope does not exist!',
      });
    } else {
      const response = await Scopes.destroy({ where: { id } });
      res.status(200).json({
        error: 1,
        msg: 'Scope deleted successfully!',
      });
    }
  } catch (error) {
    res.status(400).json({
      error: 1,
      msg: error,
    });
  }
};
