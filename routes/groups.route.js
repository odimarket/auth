const express = require('express');
const router = express.Router();

// Importing groups controller
const groupsCtrl = require('../controllers/groups.controller');
const groupsMiddleware = require('../middleware/groups.middleware');

router.post(
  '/create',
  groupsMiddleware.isInputValidated,
  groupsCtrl.createGroup
);
router.get('/all', groupsCtrl.getAllGroups);
router.get('/:id', groupsCtrl.getGroupByID);
router.put('/:id', groupsCtrl.updateGroup);
router.delete('/:id', groupsCtrl.deleteGroup);

module.exports = router;
