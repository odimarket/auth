const express = require('express');
const router = express.Router();

// Importing clients controller
const clientsCtrl = require('../controllers/clients.controller');
const clientsMiddleware = require('../middleware/clients.middleware');
const authMiddleware = require('../middleware/auth.middleware');

router.post(
  '/create',
  [
    clientsMiddleware.isInputValidated,
    authMiddleware.authenticateUser,
    authMiddleware.isProductCodeInputValidated,
    authMiddleware.validateUserProduct,
    authMiddleware.validateUserScope,
  ],
  clientsCtrl.createClient
);
router.get(
  '/all',
  [
    authMiddleware.authenticateUser,
    authMiddleware.isProductCodeInputValidated,
    authMiddleware.validateUserProduct,
    authMiddleware.validateUserScope,
  ],
  clientsCtrl.getAllClients
);
router.get(
  '/:id',
  [
    authMiddleware.authenticateUser,
    authMiddleware.isProductCodeInputValidated,
    authMiddleware.validateUserProduct,
    authMiddleware.validateUserScope,
  ],
  clientsCtrl.getClientByID
);
router.put(
  '/:id',
  [
    authMiddleware.authenticateUser,
    authMiddleware.isProductCodeInputValidated,
    authMiddleware.validateUserProduct,
    authMiddleware.validateUserScope,
  ],
  clientsCtrl.updateClient
);
router.delete(
  '/:id',
  [
    authMiddleware.authenticateUser,
    authMiddleware.isProductCodeInputValidated,
    authMiddleware.validateUserProduct,
    authMiddleware.validateUserScope,
  ],
  clientsCtrl.deleteClient
);

module.exports = router;
