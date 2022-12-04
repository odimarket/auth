const express = require('express');
const router = express.Router();

// Importing auth controller
const authCtrl = require('../controllers/auth.controller');
const userCtrl = require('../controllers/users.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/send', authMiddleware.isInputValidated, authCtrl.sendAuthUser);
router.get(
  '/verify/:access_token',
  authMiddleware.verifyPasswordResetOtp,
  authCtrl.RenderUser
);
router.get(
  '/verify/email/:access_token',
  authMiddleware.verifyEmail,
  authCtrl.RenderUser
);

router.post(
  '/password/reset',
  [
    authMiddleware.isPasswordInputValidated,
    authMiddleware.verifyPasswordResetOtpPassedAsHeader,
  ],
  authCtrl.resetPassword
);

router.get('/user', authMiddleware.authenticateUser, authCtrl.RenderUser);
router.post(
  '/signin',
  authMiddleware.isSigninInputValidated,
  userCtrl.signInUser
);

router.get(
  '/activate/:user_id',
  authMiddleware.authenticateAdmin,
  authCtrl.activateUser
);

router.get(
  '/deactivate/:user_id',
  authMiddleware.authenticateAdmin,
  authCtrl.deactivateUser
);

module.exports = router;
