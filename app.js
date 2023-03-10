const express = require('express');
// Give more detail info about http request
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErroHandler = require('./controllers/errorControler')
const app = express();

// Check if current environment is dev, production...
if (process.env.NODE_ENV === 'development') {
  // This middleware Give more detail info about http request (color, info, ..)
  app.use(morgan('dev'));
}
// This middleware parses incoming requests with JSON payloads and is based on body-parser
app.use(express.json());
// This middleware serve static files such as images, CSS files, and JavaScript files
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  next();
})

// If router is /api/v1/tours, tourRouter will run
app.use('/api/v1/tours', tourRouter);
// If router is /api/v1/users, userRouter will run
app.use('/api/v1/users', userRouter);
// If router is not existed, server will return error message
app.all('*', (req, res, next) => {
  next(new AppError(`Can not find url ${req.originalUrl} on this server`, 500));
})

app.use(globalErroHandler)
module.exports = app;
