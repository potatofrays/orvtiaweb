var Police_User = require('../models/user');
var mongoose = require('mongoose');
var models = require('../models/police_reports');

module.exports = function(router){
	//route for login
	router.get('/login/:username/:password', function(req, res){
		Police_User.findOne({police_username: req.params.username},{police_password: req.params.password}, function(err, user){
			if (err) {
		            res.json({ success: false, message: err });
			}else{
				if (!user) {
		            res.json({ success: false, message: 'Username not found' }); // Username not found in database
		        } else if (user) {
		            // Check if user does exist, then compare password provided by user
			        if (!req.params.password) {
			            res.json({ success: false, message: 'No password provided' }); // Password was not provided
			        } else {
			            var validPassword = user.comparePassword(req.params.password); // Check if password matches password provided by user
					        if (!validPassword) {
					            res.json({ success: false, message: 'Could not authenticate password' }); // Password does not match password in database
					        } else {
					        	Police_User.findOne({police_username: req.params.username}, function(err, username){
					          		return res.json({ success: true, username: username.police_username, police_id: username.id, police_station: username.police_station}); // Return token in JSON object to controller
					       		});
					        }
					}
				}
			}
		});
	});

	//route for creating report(first to submitted)
	router.post('/report', function(req,res){
		var addReport = new models.Police_Report();
			addReport.committed_at = req.body.committed_at;
			addReport.accident_type = req.body.accident_type;
			addReport.accident_cause = req.body.accident_cause;
			//addReport.violation_committed = req.body.violation_committed; // for walk in
			addReport.police_username = req.body.police_username;
			addReport.location_coordinates = [req.body.location_longitude, req.body.location_latitude];
			addReport.address_thoroughfare = req.body.address_thoroughfare;
			addReport.address_municipality = req.body.address_municipality;
			addReport.address_province = req.body.address_province;
			addReport.save(function(err, report){
				if(err){
					res.json(500,err);
				}else{
					res.json({success: true, police_report_id: report.id});
				}
			});
	});

	//route for adding people involve
	router.put('/people_involved/:id', function(req,res){
		models.Police_Report.findById(req.params.id, function(err, people){
			var addPeople = new models.People_Involved();
				addPeople.people_involved_age = req.body.people_involved_age;
				addPeople.people_involved_name = req.body.people_involved_name;
				addPeople.people_involved_gender = req.body.people_involved_gender;
				addPeople.people_involved_citizenship = req.body.people_involved_citizenship;
				addPeople.people_involved_status = req.body.people_involved_status;
				//addPeople.people_involved_type = req.body.people_involved_type; //walk in
				addPeople.save();
					if(err){
						res.json(500, err);
					}else if(people){
						people.people_involved_id.push(addPeople);
						people.save();
							res.json({success:true});
					}
			});
		});


	//route for saving vehicle
	router.put('/vehicle/:id', function(req,res){
		models.Police_Report.findById(req.params.id, function(err, vehicle){
			var addVehicle = new models.Vehicle();
				addVehicle.vehicle_type = req.body.vehicle_type;
				addVehicle.vehicle_platenumber = req.body.vehicle_platenumber;
				addVehicle.vehicle_brand = req.body.vehicle_brand;
				addVehicle.vehicle_model = req.body.vehicle_model;
				addVehicle.save();
					if(err){
						res.json(500, err);
					}else if(vehicle){
						vehicle.vehicle_id.push(addVehicle);
						vehicle.save();
							res.json({success: true});
					}
				});
		});




return router;
}
