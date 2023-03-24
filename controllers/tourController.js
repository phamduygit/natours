const { query, json } = require('express');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const User = require('../models/userModel');

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    res.status(404).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
};

exports.aliasTopCheapTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,sumary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, {path: 'reviews'});
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        numRatings: { $sum: '$ratingsQuantity' },
        numberOfTours: { $sum: 1 },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(201).json({
    status: 'success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  console.log('Your are here' + year);
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $addFields: {
        month: { $month: '$startDates' },
        year: { $year: '$startDates' },
      },
    },
    {
      $match: { year: year },
    },
    {
      $group: {
        _id: '$month',
        numberTourStart: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
        month: 1,
        numberTourStart: 1,
        tours: 1,
      },
    },
    { $sort: { numberTourStart: -1 } },
  ]);
  res.status(201).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

