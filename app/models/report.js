// Pulls Mongoose dependency for creating schemas
var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

// Creates a User Schema. This will be the basis of how user data is stored in the db
var ReportSchema = new Schema({
  reported_at: { type: Date, default: Date.now },
  accident_type: { type: String },
  accident_cause: { type: String },
  committed_at: {  type: Date},
  location_coordinates: { type: [Number, Number]},
  location_thoroughfare: { type: String },
  location_municipality: {type: String},
  location_province: {type: String, default: 'Pangasinan' },
  people_involved_in: {type: Schema.Types.ObjectId, ref: 'People_Involve'},
  vehicle_id: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
  police_username: { type: String }
});

// Sets the created_at parameter equal to the current time
ReportSchema.pre('save', function(next){
    now = new Date();
    if(!this.reported_at) {
        this.reported_at = now;
    }
    next();
});
// Indexes this schema in geoJSON format (critical for running proximity searches)
ReportSchema.index({location: '2dsphere'});

// Exports the UserSchema for use elsewhere. Sets the MongoDB collection to be used as: "scotch-user"
module.exports = mongoose.model('police_report', ReportSchema);
