const moongose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new moongose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell use your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please provide your password'],
    validate: {
      validator: function(el) {
        return el === this.password;
      }
    }
  },
  changePasswordAt: Date
})

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;  
})

userSchema.methods.isCorrectPassword = async function(candidatePassword, userPassword) {
  const result = await bcrypt.compare(candidatePassword, userPassword);
  return result;
}

userSchema.methods.changePasswordAfter = function(JWTTimestamp) {
  if (this.changePasswordAt) {
    const timestampChangePassword = this.changePasswordAt.getTime() / 1000;
    console.log(timestampChangePassword, JWTTimestamp);
    return JWTTimestamp < timestampChangePassword;
  }
  return false;
}
const User = moongose.model('User', userSchema);

module.exports = User;