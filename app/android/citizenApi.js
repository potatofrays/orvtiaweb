var mongoose = require('mongoose');
var models = require('../models/citizenModels');


module.exports = function(router){
	//api route for login for andorid
	router.get('/login/:username/:password', function(req, res){
	models.Citizen_User.findOne({citizen_username: req.params.username},{citizen_password: req.params.password}, function(err, citizen){

		if (err) {
	            res.json({ success: false, message: err });
		}else{
			if (!citizen) {
	            res.json({ success: false, message: 'Username not found' }); // Username not found in database
	        } else if (citizen) {
	            // Check if user does exist, then compare password provided by user
		        if (!req.params.password) {
		            res.json({ success: false, message: 'No password provided' }); // Password was not provided
		        } else {
		            var validPassword = citizen.comparePassword(req.params.password); // Check if password matches password provided by user
                    if (!validPassword) {
                            res.json({ success: false, message: 'Could not authenticate password' }); // Password does not match password in database
			        } else {
			        	//this find is used to display attributes needed
			        	models.Citizen_User.findOne({citizen_username: req.params.username}, function(err, username){
			           return res.json({ success: true, citizen_id: username.id}); // Return token in JSON object to controller
			       })
			            }
				}
			}
		}
	});
});



	//api route for informant signup for android
	router.post('/signup', function(req, res){

	 var citizen = new models.Citizen_User();
	 citizen.citizen_name = req.body.citizen_name;
	 citizen.citizen_username = req.body.citizen_username;
	 citizen.citizen_password = req.body.citizen_password;
	 citizen.citizen_contact = req.body.citizen_contact;
	 citizen.citizen_email = req.body.citizen_email;
	 citizen.save(function(err, citizen){
	 	if(err){
	 		res.json(500, err);
	 	}
	 		res.json({success: true, citizen:citizen.username});
	 	});
	});

	router.post('/report', function(req, res){
		var citizenreport = new models.Citizen_Report();

		citizenreport.citizen_report_longitude = req.body.citizen_report_longitude;
		citizenreport.citizen_report_latitude = req.body.citizen_report_latitude;
		citizenreport.citizen_report_thoroughfare = req.body.citizen_report_thoroughfare;
		citizenreport.citizen_report_municipality = req.body.citizen_report_municipality;
		citizenreport.citizen_report_province = req.body.citizen_report_province;

		citizenreport.save(function(err, report){
			if(err){
				res.json(500,err);
			}
			res.json({report: report });
		});
	});

	return router;
}
