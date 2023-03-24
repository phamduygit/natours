const { findByIdAndUpdate, update } = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const factory = require('./handlerFactory');

const filterObject = (obj, ...allowedFileds) => {
  const newObject = {};
  Object.keys(obj).forEach((e) => {
    if (allowedFileds.includes(e)) newObject[e] = obj[e];
  });
  
  return newObject;
};

exports.getMe = (req, res, next) => {
  console.log(req.user.id)
  req.params.id = req.user.id;
  next();
}

exports.updateInfo = catchAsync(async (req, res, next) => {
  // Check if body contain password or confirm password
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("You can't update your password!", 400));
  }
  // Filter object for updating
  const filteredObject = filterObject(req.body, 'name', 'email');
  // Update info of user
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObject, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser
    }
  })
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, {active: false});
  res.status(204).json({
    status: 'success',
    data: null
  })
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use /signup instead',
  });
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

