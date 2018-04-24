var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs'); // Import Bcrypt Package


var Schema = mongoose.Schema;

var citizenSchema = new Schema({
  citizen_name:{type: String},
	citizen_username: {type: String},
	citizen_password:{type: String},
	citizen_contact:{type: String},
	citizen_email:{type: String}
});

var citizenReportsSchema = new Schema({
    citizen_report_datetime: {type: Date, default: Date.now},
    citizen_report_longitude: {type: Number},
    citizen_report_latitude: {type: Number},
    citizen_report_thoroughfare: {type: String},
    citizen_report_municipality:{type: String},
    citizen_report_province:{type: String},
    citizen_report_credibility: {type: String, default: 'PENDING'}
});

// Middleware to ensure password is encrypted before saving user to database
citizenSchema.pre('save', function(next) {
    var citizen = this;

    // Function to encrypt password
    bcrypt.hash(citizen.citizen_password, null, null, function(err, hash) {
        if (err) return next(err); // Exit if error is found
        citizen.citizen_password = hash; // Assign the hash to the user's password so it is saved in database encrypted
        next(); // Exit Bcrypt function
    });
});

// Method to compare passwords in API (when user logs in)
citizenSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.citizen_password); // Returns true if password matches, false if doesn't
};

var Citizen_User = mongoose.model('Citizen_User', citizenSchema);
var Citizen_Report = mongoose.model('Citizen_Report', citizenReportsSchema);


module.exports = {
    Citizen_User: Citizen_User,
    Citizen_Report: Citizen_Report
};
