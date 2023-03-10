const express = require('express');
const userController = require('../controllers/userController') 
const router = express.Router()
const authController = require('../controllers/authController');


router.post('/sign-up', authController.signUp);
router.post('/sign-in', authController.login);

router.route('/').get(userController.getAllUsers).post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);


module.exports = router;