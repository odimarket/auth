const express = require('express');
const router = express.Router();

// Importing scopes controller
const scopesCtrl = require('../controllers/scopes.controller');
const scopesMiddleware = require('../middleware/scopes.middleware');
const authMiddleware = require('../middleware/auth.middleware');

router.post(
  '/create',
  [
    scopesMiddleware.isInputValidated,
    authMiddleware.authenticateUser,
    authMiddleware.isProductCodeInputValidated,
    authMiddleware.validateUserProduct,
    authMiddleware.validateUserScope,
  ],
  scopesCtrl.createScope
);
router.get(
  '/all',
  [
    authMiddleware.authenticateUser,
    authMiddleware.isProductCodeInputValidated,
    authMiddleware.validateUserProduct,
    authMiddleware.validateUserScope,
  ],
  scopesCtrl.getAllScopes
); // ?role=${role}
router.get(
  '/:id',
  [
    authMiddleware.authenticateUser,
    authMiddleware.isProductCodeInputValidated,
    authMiddleware.validateUserProduct,
    authMiddleware.validateUserScope,
  ],
  scopesCtrl.getScopeByID
);
router.put(
  '/:id',
  [
    authMiddleware.authenticateUser,
    authMiddleware.isProductCodeInputValidated,
    authMiddleware.validateUserProduct,
    authMiddleware.validateUserScope,
  ],
  scopesCtrl.updateScope
);
router.delete(
  '/:id',
  [
    authMiddleware.authenticateUser,
    authMiddleware.isProductCodeInputValidated,
    authMiddleware.validateUserProduct,
    authMiddleware.validateUserScope,
  ],
  scopesCtrl.deleteScope
);

module.exports = router;
