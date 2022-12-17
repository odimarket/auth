const express = require('express');
const router = express.Router();

// Importing roles controller
const rolesCtrl = require('../controllers/roles.controller');
const rolesMiddleware = require('../middleware/roles.middleware');
const authMiddleware = require('../middleware/auth.middleware');

router.post(
  '/create',
  [
    rolesMiddleware.isInputValidated,
    authMiddleware.authenticateUser,
    authMiddleware.isProductCodeInputValidated,
    authMiddleware.validateUserProduct,
    authMiddleware.validateUserScope,
  ],
  rolesCtrl.createRole
);
router.get(
  '/all',
  [
    authMiddleware.authenticateUser,
    authMiddleware.isProductCodeInputValidated,
    authMiddleware.validateUserProduct,
    authMiddleware.validateUserScope,
  ],
  rolesCtrl.getAllRoles
); //?code={}
router.get(
  '/:id',
  [
    authMiddleware.authenticateUser,
    authMiddleware.isProductCodeInputValidated,
    authMiddleware.validateUserProduct,
    authMiddleware.validateUserScope,
  ],
  rolesCtrl.getRoleByID
);
router.put(
  '/:id',
  [
    authMiddleware.authenticateUser,
    authMiddleware.isProductCodeInputValidated,
    authMiddleware.validateUserProduct,
    authMiddleware.validateUserScope,
  ],
  rolesCtrl.updateRole
);
router.delete(
  '/:id',
  [
    authMiddleware.authenticateUser,
    authMiddleware.isProductCodeInputValidated,
    authMiddleware.validateUserProduct,
    authMiddleware.validateUserScope,
  ],
  rolesCtrl.deleteRole
);

module.exports = router;
