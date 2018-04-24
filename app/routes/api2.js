// Dependencies
var mongoose        = require('mongoose');
var police_report          = require('../models/report'); // Import Report Model
var police_user            = require('../models/user');

// Opens App Routes
module.exports = function(app) {

    // GET Routes
    // --------------------------------------------------------
    // Retrieve records for all users in the db
    app.get('/police_reports', function(req, res){

        // Uses Mongoose schema to run the search (empty conditions)
        var query = police_report.find({});
        query.exec(function(err, police_reports){
            if(err)
                res.send(err);

            // If no errors are found, it responds with a JSON of all users
            res.json(police_reports);
        });
    });

    // POST Routes
    // --------------------------------------------------------
    // Provides method for saving new users in the db
    app.post('/police_reports', function(req, res){

        // Creates a new User based on the Mongoose schema and the post bo.dy
        var newReport = new police_report(req.body);

        // New User is saved in the db.
        newReport.save(function(err){
            if(err)
                res.send(err);
            // If no errors are found, it responds with a JSON of the new user
            res.json(req.body);
        });
    });

    // Retrieves JSON records for all users who meet a certain set of query conditions
    app.post('/query/', function(req, res){

        // Grab all of the query parameters from the body.
        var lat             = req.body.latitude;
        var long            = req.body.longitude;
        var distance        = req.body.distance;
        var informant       = req.body.informant;
        var statement       = req.body.statement;
        var accidentType    = req.body.accidentType;
        var vehicleType     = req.body.vehicleType;
        var plateNum        = req.body.plateNum;
        var reqVerified     = req.body.reqVerified;

        // Opens a generic Mongoose Query. Depending on the post body we will...
        var query = Report.find({});

        // ...include filter by Max Distance (converting miles to meters)
        if(distance){

            // Using MongoDB's geospatial querying features. (Note how coordinates are set [long, lat]
            query = query.where('location').near({ center: {type: 'Point', coordinates: [long, lat]},

                // Converting meters to miles. Specifying spherical geometry (for globe)
                maxDistance: distance * 1609.34, spherical: true});

        }

        // ...include filter by Favorite Language
        if(informant){
            query = query.where('informant').equals(informant);
        }
        // ...include filter by Favorite Language
        if(statement){
            query = query.where('informant').equals(statement);
        }
        // ...include filter by Favorite Language
        if(accidentType){
            query = query.where('accidentType').equals(accidentType);
        }
        // ...include filter by Favorite Language
        if(vehicleType){
            query = query.where('vehicleType').equals(vehicleType);
        }
        // ...include filter by Favorite Language
        if(plateNum){
            query = query.where('plateNum').equals(plateNum);
        }
        // ...include filter for HTML5 Verified Locations
        if(reqVerified){
            query = query.where('htmlverified').equals("Yep (Thanks for giving us real data!)");
        }

        // Execute Query and Return the Query Results
        query.exec(function(err, reports){
            if(err)
                res.send(err);

            // If no errors, respond with a JSON of all users that meet the criteria
            res.json(reports);
        });
    });

    // DELETE Routes (Dev Only)
    // --------------------------------------------------------
    // Delete a User off the Map based on objID
    app.delete('/reports/:objID', function(req, res){
        var objID = req.params.objID;
        var update = req.body;

        Report.findByIdAndRemove(objID, update, function(err, report){
            if(err)
                res.send(err);
            res.json(req.body);
        });
    });
};
