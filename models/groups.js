'use strict';
const { Model } = require('sequelize');
const uuid = require('uuid');
module.exports = (sequelize, DataTypes) => {
  class groups extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      groups.belongsTo(models.products, {
        foreignKey: 'product_id',
      });
      groups.belongsTo(models.clients, {
        foreignKey: 'client_id',
      });
    }
  }
  groups.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      product_id: DataTypes.STRING,
      client_id: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'groups',
    }
  );
  groups.beforeCreate((group) => (group.id = uuid.v4()));

  return groups;
};
