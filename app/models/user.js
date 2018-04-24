var mongoose = require('mongoose'); // Import Mongoose Package
var Schema = mongoose.Schema; // Assign Mongoose Schema function to variable
var bcrypt = require('bcrypt-nodejs'); // Import Bcrypt Package
var titlize = require('mongoose-title-case'); // Import Mongoose Title Case Plugin
var validate = require('mongoose-validator'); // Import Mongoose Validator Plugin
var moment = require('moment');
// User Name Validator
var nameValidator = [
    validate({
        validator: 'isLength',
        arguments: [3, 20],
        message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

// User E-mail Validator
var emailValidator = [
    validate({
        validator: 'matches',
        arguments: /^(\w+)([\-+.\'0-9A-Za-z_]+)*@(\w[\-\w]*\.){1,5}([A-Za-z]){2,6}$/,
        message: 'Name must be at least 3 characters, max 40, no special characters or numbers, must have space in between name.'
    }),
    validate({
        validator: 'isLength',
        arguments: [3, 40],
        message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

// User Contact Validator
var contactValidator = [
    validate({
        validator: 'matches',
        arguments: /^(09|\+639)\d{9}$/,
        message: 'Contact number must start with 09 followed by 9 numbers'
    }),
    validate({
        validator: 'isLength',
        arguments: [11, 12],
        message: 'Contact number should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

// Username Validator
var usernameValidator = [
    validate({
        validator: 'isLength',
        arguments: [3, 25],
        message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

// Password Validator
var passwordValidator = [
    validate({
        validator: 'matches',
        arguments: /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/,
        message: 'Password needs to have at least one lower case, one uppercase, one number, one special character, and must be at least 8 characters but no more than 35.'
    }),
    validate({
        validator: 'isLength',
        arguments: [8, 35],
        message: 'Password should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

// User Mongoose Schema
var UserSchema = new Schema({
    police_name: { type: String, required: true, validate: nameValidator },
    police_username: { type: String, lowercase: true, required: true, unique: true, validate: usernameValidator },
    police_password: { type: String, required: true, validate: passwordValidator, select: false },
    police_email: { type: String, required: true, lowercase: true, unique: true, validate: emailValidator },
    police_gender: { type: String, required: true, select: false },
  	police_station: { type: String, required: true},
  	police_contact: { type: String, required: true, validate: contactValidator },
  	police_rank: { type: String, required: true},
    police_address: { type: String},
    active: { type: Boolean, required: true, default: false },
    temporarytoken: { type: String, required: true},
    resettoken: { type: String, required: false },
    police_permission: { type: String, required: true},
    police_createdAt: {type: Date, default: Date.now},
    police_updatedAt: {type: Date, default: Date.now}
});

// Middleware to ensure password is encrypted before saving user to database
UserSchema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('police_password')) return next(); // If password was not changed or is new, ignore middleware

    // Function to encrypt password
    bcrypt.hash(user.police_password, null, null, function(err, hash) {
        if (err) return next(err); // Exit if error is found
        user.police_password = hash; // Assign the hash to the user's password so it is saved in database encrypted
        next(); // Exit Bcrypt function
    });
});

// Date and Time User Created
UserSchema.pre('save', function(next){
   now = new Date();
    if (!this.police_createdAt) {
        this.police_createdAt = now;
    } else {
      this.police_updatedAt = now;
    }
    next();
});

// Mongoose Plugin to change fields to title case after saved to database (ensures consistency)
UserSchema.plugin(titlize, {
    paths: ['police_name']
});

// Method to compare passwords in API (when user logs in)
UserSchema.methods.comparePassword = function(police_password) {
    return bcrypt.compareSync(police_password, this.police_password); // Returns true if password matches, false if doesn't
};

module.exports = mongoose.model('police_user', UserSchema); // Export User Model for us in API
