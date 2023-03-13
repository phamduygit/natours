const express = require('express');
const userController = require('../controllers/userController') 
const router = express.Router()
const authController = require('../controllers/authController');


router.post('/sign-up', authController.signUp);
router.post('/sign-in', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:resetToken', authController.resetPassword);
router.patch('/update-password', authController.protect, authController.updatePassword);

router.patch('/update-info', authController.protect, userController.updateInfo);
router.delete('/delete-me', authController.protect, userController.deleteMe);

router.route('/').get(userController.getAllUsers).post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);


module.exports = router;