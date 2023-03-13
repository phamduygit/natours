const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErroHandler = require('./controllers/errorControler')
const app = express();
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

app.use(helmet());
// Check if current environment is dev, production...
if (process.env.NODE_ENV === 'development') {
  // This middleware Give more detail info about http request (color, info, ..)
  app.use(morgan('dev'));
}
// Config express-rate-limit
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 60 * 1000,
  max: 100
})

// This middleware parses incoming requests with JSON payloads and is based on body-parser
app.use(express.json());
// Data sanitization against NoSql query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss())
// Prevent parameter pollution
app.use(hpp({
  whitelist: [
    'duration',
    'ratingsQuanity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}))
// This middleware serve static files such as images, CSS files, and JavaScript files
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  next();
})
// Limit api
app.use('/api', apiLimiter);
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
