const moongose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'admin', 'lead-guide', 'guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please provide your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
    },
  },
  changePasswordAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.changePasswordAt = Date.now() - 2000;
  next();
});

userSchema.pre(/^find/, function(next) {
  this.find({active: {$ne: false}});
  next();
})

userSchema.methods.isCorrectPassword = async function (
  candidatePassword,
  userPassword
) {
  const result = await bcrypt.compare(candidatePassword, userPassword);
  return result;
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.changePasswordAt) {
    const timestampChangePassword = this.changePasswordAt.getTime() / 1000;
    return JWTTimestamp < timestampChangePassword;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // This token is not encrypt
  const resetToken = crypto.randomBytes(32).toString('hex');
  // Encrypt reset token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // Set expires time
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log(`reset token: ${resetToken}`);
  console.log(`hashed reset token: ${this.passwordResetToken}`);
  return resetToken;
};
const User = moongose.model('User', userSchema);

module.exports = User;
