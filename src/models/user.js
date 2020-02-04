const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ResponseError = require('../utils/responseError');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: (email) => validator.isEmail(email),
    },
  },
  password: {
    type: String,
    required: true,
  },
  authTokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  avatar: Buffer,
}, { 
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true },
  timestamps: true,
});

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner', 
});

userSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign( { _id: this._id.toString() }, process.env.JWT_SECRET );
  this.authTokens.push({token});
  await this.save();
  return token;
};

userSchema.methods.toJSON = function() {
  const publicProfile = {};
  publicProfile._id = this._id;
  publicProfile.name = this.name;
  publicProfile.email = this.email;
  publicProfile.tasks = this.tasks;
  return publicProfile;
};

userSchema.statics.findByCredentials = async function (email, password) {
  
  const user = await this.findOne({ email });

  if (!user) {
    throw new ResponseError(400, 'Login failed');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return {
      statusCode: 400,
      statusMessage: 'Login failed',
    };
  }

  return {
    statusCode: 200,
    user,
  };

};

// must be called BEFORE calling mongoose.model
userSchema.pre('save', async function(next) {

  // 'this' references the user document about to be saved.
  if (this.isModified('password')) {
    // we only want to run this if the password of the document has been modified
    this.password = await bcrypt.hash(this.password, 8);
  }

  next();
});

userSchema.pre('remove', async function(next) {

  this.tasks.forEach((task) => task.remove());

  next();
});

module.exports = mongoose.model('User', userSchema);