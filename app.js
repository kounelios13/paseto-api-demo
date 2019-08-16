const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const redis = require('async-redis');

const settings = require('./configs/settings');
const client = redis.createClient({
  host: settings.redisHost || "localhost"
});
const register = require('./routes/register');
const login = require('./routes/login')(client);
const validateJwt = require('./middlewares/validate-token')(client);
const token = require('./routes/token')(client);
const profile = require('./routes/profile');
const user = require('./routes/user')(client);
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
client.on("error", err => {
  console.log('Redis encountered an error', err);
});
mongoose.connect(settings.uri, {
  useNewUrlParser: true,
  ...settings
});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use('/health', (req, res, next) => {
  res.json({
    status: 'up',
    mode: process.env['NODE_ENV']
  })
})
app.use('/mail', require('./routes/mail'));
app.use('/register', register);
app.use('/login', login);
app.use('/token', token);
app.use('/user', user);
app.use('/profile', validateJwt, profile);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500).json(err);
});

/**
 * Perform some cleanup action
 */
async function cleanup() {
  client.end(true);
  await mongoose.disconnect();
  mongoose.connection.close(() => {
    console.log('MongoDB connection terminated');
    process.exit(0);
  })
}
const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
signals.forEach(signal => {
  process.on(signal, () => {
    console.info(signal + ' signal received.');
    cleanup();
  });
});




module.exports = app;