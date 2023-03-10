const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
// Importing Utilities module
const util = require('util');

// Importing File System module
const fs = require('fs');
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  // 1. Check if email and password exist
  const user = await User.findOne({ email: email }).select('+password');
  // 2. Check if user exists && password is correct
  if (!user || !user.isCorrectPassword(password, user.password)) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // 3. If every thing ok, sent token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Check if header is contain token
  let token = '';
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  // 2. Verification token
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  // 3. Check if user stil exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does not longer exist.',
        401
      )
    );
  }

  // 4. Check if user changed password after the token was issueed
  const isChangePassword = currentUser.changePasswordAfter(decoded.iat);
  if (isChangePassword) {
    return next(
      new AppError(
        'User recently changed password! Please login again.',
        401
      )
    )
  }
  next();
});
