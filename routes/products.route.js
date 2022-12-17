const express = require('express');
const router = express.Router();

// Importing products controller
const productsCtrl = require('../controllers/products.controller');
const productsMiddleware = require('../middleware/products.middleware');
const authMiddleware = require('../middleware/auth.middleware');

router.post(
  '/create',
  [
    productsMiddleware.isInputValidated,
    authMiddleware.authenticateUser,
    authMiddleware.isProductCodeInputValidated,
    authMiddleware.validateUserProduct,
    authMiddleware.validateUserScope,
  ],
  productsCtrl.createProduct
);
router.get(
  '/all',
  [
    authMiddleware.authenticateUser,
    authMiddleware.isProductCodeInputValidated,
    authMiddleware.validateUserProduct,
    authMiddleware.validateUserScope,
  ],
  productsCtrl.getAllProducts
);
router.get(
  '/:id',
  [
    authMiddleware.authenticateUser,
    authMiddleware.isProductCodeInputValidated,
    authMiddleware.validateUserProduct,
    authMiddleware.validateUserScope,
  ],
  productsCtrl.getProductByID
);
router.put(
  '/:id',
  [
    authMiddleware.authenticateUser,
    authMiddleware.isProductCodeInputValidated,
    authMiddleware.validateUserProduct,
    authMiddleware.validateUserScope,
  ],
  productsCtrl.updateProduct
);
router.delete(
  '/:id',
  [
    authMiddleware.authenticateUser,
    authMiddleware.isProductCodeInputValidated,
    authMiddleware.validateUserProduct,
    authMiddleware.validateUserScope,
  ],
  productsCtrl.deleteProduct
);

module.exports = router;
