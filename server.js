const dotevn = require('dotenv');
const mongoose = require('mongoose');
dotevn.config({ path: './config.env' });
const app = require('./app');
const port = process.env.PORT || 3000;

// Replacing password for mongodb link
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Set mode for mongose
mongoose.set('strictQuery', false);
// Try to connect with mongdo db
mongoose
  .connect(DB, {
    // Set up config for connect database
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    // Connect success
    console.log('DB connection successful!');
  })
  .catch(err => {
    // Connect error
    console.log(err);
  })

// Create event loop for listening request from the borwser
app.listen(port, () => {
  console.log(`App runing on port ${port}`);
});
