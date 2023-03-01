const { query, json } = require('express');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

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

exports.getAllTours = async (req, res) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagingnate();
    const tours = await features.query;
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail',
      message: 'Error',
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail',
      message: 'Invalid ID',
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail',
      message: err,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      // {
      //   $group: {
      //     // _id: {$toUpper: '$difficulty'},
      //     _id: '$_id',
      //     nameasdf: '$_name',
      //     // ratingsAverage: '$ratingsAverage',
      //     // numTours: { $sum: 1 },
      //     // numberRating: { $sum: '$ratingsQuantity' },
      //     // avgRating: { $avg: '$ratingsAverage' },
      //     // avgPrice: { $avg: '$price' },
      //     // minPrice: { $min: '$price' },
      //     // maxPrice: { $max: '$price' },
      //     // sumPrice: { $sum: '$price'},
      //   },
      // },
      // {
      //   $sort: {
      //     avgPrice: 1
      //   }
      // }
    ]);
    res.status(201).json({
      status: 'success',
      stats,
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: 'Fail',
      message: err,
    });
  }
};
