const Groups = require('../models').groups;
const Clients = require('../models').clients;
const Products = require('../models').products;

/**
 * Function for creating a group
 * @param {*} req
 * @param {*} res
 */
exports.createGroup = async (req, res) => {
  const { name, description, product_id, client_id } = req.body;
  try {
    let result = await Groups.findOne({ where: { name } });

    if (result !== null) {
      res.status(200).json({
        error: 1,
        msg: 'Group exists!',
      });
    } else {
      result = await Products.findOne({ where: { id: product_id } });
      if (result === null) {
        res.status(200).json({
          error: 1,
          msg: 'Product does not exist!',
        });
      } else {
        const result2 = await Clients.findOne({ where: { id: client_id } });
        if (result2 === null) {
          res.status(200).json({
            error: 1,
            msg: 'Client does not exist!',
          });
        } else {
          const response = await Groups.create({
            name,
            description,
            product_id,
            client_id,
          });
          res.status(200).json({
            error: 0,
            msg: 'Group created successfully!',
          });
        }
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
 * Function to get all Groups
 * @param {*} req
 * @param {*} res
 */
exports.getAllGroups = async (req, res) => {
  try {
    const result = await Groups.findAll({
      include: [Products, Clients],
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
 * Function to get a Group by ID
 * @param {*} req
 * @param {*} res
 */
exports.getGroupByID = async (req, res) => {
  const { id } = req.params;
  try {
    let result = await Groups.findOne({
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
 * Function to update a Group by ID
 * @param {*} req
 * @param {*} res
 */
exports.updateGroup = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Groups.findOne({ where: { id } });
    if (result === null) {
      res.status(400).json({
        error: 1,
        msg: 'Group does not exist!',
      });
    } else {
      const response = await Groups.update(req.body, {
        where: { id },
      });
      res.status(200).json({
        error: 0,
        msg: 'Group updated successfully!',
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
 * Function to delete a Group by ID
 * @param {*} req
 * @param {*} res
 */
exports.deleteGroup = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Groups.findOne({ where: { id } });
    if (result === null) {
      res.status(400).json({
        error: 1,
        msg: 'Group does not exist!',
      });
    } else {
      const response = await Groups.destroy({ where: { id } });
      res.status(200).json({
        error: 1,
        msg: 'Group deleted successfully!',
      });
      9;
    }
  } catch (error) {
    res.status(400).json({
      error: 1,
      msg: error,
    });
  }
};
