var police_user = require('../models/user'); // Import User Model
var models = require('../models/police_reports'); // Import Report Model
var citizen = require('../models/citizenModels')
var jwt = require('jsonwebtoken'); // Import JWT Package
var secret = 'harrypotter'; // Create custom secret for use in JWT
var nodemailer = require('nodemailer'); // Import Nodemailer Package
var sgTransport = require('nodemailer-sendgrid-transport'); // Import Nodemailer Sengrid Transport Package

module.exports = function(router) {

    // Start Sendgrid Configuration Settings (Use only if using sendgrid)
    // var options = {
    //     auth: {
    //         api_user: 'dbrian332', // Sendgrid username
    //         api_key: 'PAssword123!@#' // Sendgrid password
    //     }
    // };

    // Nodemailer options (use with g-mail or SMTP)
    var client = nodemailer.createTransport({
        service: 'Zoho',
        auth: {
            user: 'orvtiateam@zoho.com', // Your email address
            pass: 'orvt1ate@m' // Your password
        },
        tls: { rejectUnauthorized: false }
    });
    // var client = nodemailer.createTransport(sgTransport(options)); // Use if using sendgrid configuration
    // End Sendgrid Configuration Settings
    // Route to register new users
    router.post('/police_users', function(req, res) {
        var user = new police_user(); // Create new User object
        user.police_username = req.body.police_username; // Save username from request to User object
        user.police_password = req.body.police_password; // Save password from request to User object
        user.police_email = req.body.police_email; // Save email from request to User object
        user.police_name = req.body.police_name; // Save name from request to User object
        user.police_contact = req.body.police_contact; // Save contact number from request to User object
        user.police_station = req.body.police_station; // Save station from request to User object
        user.police_permission = req.body.police_permission;
        user.police_gender = req.body.police_gender; // Save gender from request to User object
        user.police_rank = req.body.police_rank; // Save rank from request to User object
        user.police_address = req.body.police_address;

        user.temporarytoken = jwt.sign({ police_username: user.police_username, police_email: user.police_email }, secret, { expiresIn: '24h' }); // Create a token for activating account through e-mail

        // Check if request is valid and not empty or null
        if (req.body.police_username === null || req.body.police_username === '' || req.body.police_password === null || req.body.police_password === '' || req.body.police_email === null || req.body.police_email === ''
        || req.body.police_name === null || req.body.police_name === ''|| req.body.police_contact === null || req.body.police_contact === '' || req.body.police_station === null
        || req.body.police_station === '' || req.body.police_gender === null || req.body.police_gender === '' || req.body.police_rank === null || req.body.police_rank === '' || req.body.police_permission === null || req.body.police_permission === ''
        || req.body.police_address === null || req.body.police_address === '') {
            res.json({ success: false, message: 'Ensure all data were provided' });
        } else {
            // Save new user to database
            user.save(function(err) {
                if (err) {
                    // Check if any validation errors exists (from user model)
                    if (err.errors !== null) {
                        if (err.errors.police_name) {
                            res.json({ success: false, message: err.errors.police_name.message }); // Display error in validation (name)
                        } else if (err.errors.police_email) {
                            res.json({ success: false, message: err.errors.police_email.message }); // Display error in validation (email)
                        } else if (err.errors.police_username) {
                            res.json({ success: false, message: err.errors.police_username.message }); // Display error in validation (username)
                        } else if (err.errors.police_password) {
                            res.json({ success: false, message: err.errors.police_password.message }); // Display error in validation (password)
                        } else if (err.errors.police_contact) {
                            res.json({ success: false, message: err.errors.police_contact.message }); // Display error in validation (password)
                        } else {
                            res.json({ success: false, message: err }); // Display any other errors with validation
                        }
                    } else if (err) {
                        // Check if duplication error exists
                        if (err.code == 11000) {
                            if (err.errmsg[61] == "u") {
                                res.json({ success: false, message: 'That username is already taken' }); // Display error if username already taken
                            } else if (err.errmsg[61] == "e") {
                                res.json({ success: false, message: 'That e-mail is already taken' }); // Display error if e-mail already taken
                            }
                        } else {
                            res.json({ success: false, message: err }); // Display any other error
                        }
                    }
                } else {
                    res.json({ success: true, message: 'Police account registered.' }); // Send success message back to controller/request

                }
            });
        }
    });

    // Route to check if username chosen on registration page is taken
    router.post('/checkusername', function(req, res) {
        police_user.findOne({ police_username: req.body.police_username }).select('police_username').exec(function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'pnp@orvtia.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (user) {
                    res.json({ success: false, message: 'That username is already taken' }); // If user is returned, then username is taken
                } else {
                    res.json({ success: true, message: 'Valid username' }); // If user is not returned, then username is not taken
                }
            }
        });
    });

    // Route to check if e-mail chosen on registration page is taken
    router.post('/checkemail', function(req, res) {
        police_user.findOne({ police_email: req.body.police_email }).select('police_email').exec(function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'pnp@orvtia.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (user) {
                    res.json({ success: false, message: 'That e-mail is already taken' }); // If user is returned, then e-mail is taken
                } else {
                    res.json({ success: true, message: 'Valid e-mail' }); // If user is not returned, then e-mail is not taken
                }
            }
        });
    });

    // Route for user logins
    router.post('/authenticate', function(req, res) {
        var loginUser = (req.body.police_username); // Ensure username is checked in lowercase against database
        police_user.findOne({ police_username: loginUser }).select('police_email police_username police_password police_station').exec(function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'pnp@orvtia.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if user is found in the database (based on username)
                if (!user) {
                    res.json({ success: false, message: 'Username not found' }); // Username not found in database
                } else if (user) {
                    // Check if user does exist, then compare password provided by user
                    if (!req.body.police_station && !req.body.police_password){
                      res.json({ success: false, message: 'No password and station provided' }); // Password and Station was not provided
                    } else if (!req.body.police_station){
                        res.json({ success: false, message: 'No station provided' }); // Station was not provided
                    } else if (req.body.police_station !== user.police_station && !req.body.police_password){
                        res.json({ success: false, message: 'Wrong station and Please enter password' }); // Station is incorrect and Password was not provided
                    } else if (req.body.police_station !== user.police_station){
                      res.json({ success: false, message: 'Wrong station' }); // Station is incorrect
                    } else if (!req.body.police_password) {
                        res.json({ success: false, message: 'No password provided' }); // Password was not provided
                    } else {
                        var validPassword = user.comparePassword(req.body.police_password); // Check if password matches password provided by user
                        if (!validPassword) {
                            res.json({ success: false, message: 'Could not authenticate password' }); // Password does not match password in database
                        } else {
                            var token = jwt.sign({ police_username: user.police_username, police_email: user.police_email, police_station: user.police_station }, secret, { expiresIn: '24h' }); // Logged in: Give user token
                            res.json({ success: true, message: 'User authenticated', token: token }); // Return token in JSON object to controller
                        }
                    }
                }
            }
        });
    });
    // Route to send user's username to e-mail
    router.get('/resetusername/:police_email', function(req, res) {
        police_user.findOne({ police_email: req.params.police_email }).select('police_email police_name police_username').exec(function(err, user) {
            if (err) {
                res.json({ success: false, message: err }); // Error if cannot connect
            } else {
                if (!user) {
                    res.json({ success: false, message: 'E-mail was not found' }); // Return error if e-mail cannot be found in database
                } else {
                    // If e-mail found in database, create e-mail object
                    var email = {
                        from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                        to: user.police_email,
                        subject: 'Android Username Request',
                        text: 'Hello ' + user.police_name + ', You recently requested your username. Please save it in your files: ' + user.police_username,
                        html: 'Hello<strong> ' + user.police_name + '</strong>,<br><br>You recently requested your username. Please save it in your files: ' + user.police_username
                    };

                    // Function to send e-mail to user
                    client.sendMail(email, function(err, info) {
                        if (err) {
                            console.log(err); // If error in sending e-mail, log to console/terminal
                        } else {
                            console.log(info); // Log confirmation to console
                        }
                    });
                    res.json({ success: true, message: 'Username has been sent to e-mail! ' }); // Return success message once e-mail has been sent
                }
            }
        });
    });

    // Route to send reset link to the user
    router.put('/resetpassword', function(req, res) {
        police_user.findOne({ police_username: req.body.police_username }).select('police_username police_email resettoken police_name').exec(function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'pnp@orvtia.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (!user) {
                    res.json({ success: false, message: 'Username was not found' }); // Return error if username is not found in database
                } else {
                    user.resettoken = jwt.sign({ police_username: user.police_username, police_email: user.police_email }, secret, { expiresIn: '24h' }); // Create a token for activating account through e-mail
                    // Save token to user in database
                    user.save(function(err) {
                        if (err) {
                            res.json({ success: false, message: err }); // Return error if cannot connect
                        } else {
                            // Create e-mail object to send to user
                            var email = {
                                from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                to: user.police_email,
                                subject: 'Reset Password Request',
                                text: 'Hello ' + user.police_name + ', You recently request a password reset link. Please click on the link below to reset your password:<br><br><a href="http://orvtiawebserver.herokuapp.com/reset/' + user.resettoken,
                                html: 'Hello<strong> ' + user.police_name + '</strong>,<br><br>You recently request a password reset link. Please click on the link below to reset your password:<br><br><a href="http://orvtiawebserver.herokuapp.com/reset/' + user.resettoken + '">http://orvtiawebserver.herokuapp.com/reset/</a>'
                            };
                            // Function to send e-mail to the user
                            client.sendMail(email, function(err, info) {
                                if (err) {
                                    console.log(err); // If error with sending e-mail, log to console/terminal
                                } else {
                                    console.log(info); // Log success message to console
                                    console.log('sent to: ' + user.email); // Log e-mail
                                }
                            });
                            res.json({ success: true, message: 'Please check your e-mail for password reset link' }); // Return success message
                        }
                    });
                }
            }
        });
    });

    // Route to verify user's e-mail activation link
    router.get('/resetpassword/:token', function(req, res) {
        police_user.findOne({ resettoken: req.params.token }).select().exec(function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'pnp@orvtia.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                var token = req.params.token; // Save user's token from parameters to variable
                // Function to verify token
                jwt.verify(token, secret, function(err, decoded) {
                    if (err) {
                        res.json({ success: false, message: 'Password link has expired' }); // Token has expired or is invalid
                    } else {
                        if (!user) {
                            res.json({ success: false, message: 'Password link has expired' }); // Token is valid but not no user has that token anymore
                        } else {
                            res.json({ success: true, user: user }); // Return user object to controller
                        }
                    }
                });
            }
        });
    });

    // Save user's new password to database
    router.put('/savepassword', function(req, res) {
        police_user.findOne({ police_username: req.body.police_username }).select('police_username police_email police_name police_password resettoken').exec(function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'pnp@orvtia.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (req.body.police_password === null || req.body.police_password === '') {
                    res.json({ success: false, message: 'Password not provided' });
                } else {
                    user.police_password = req.body.police_password; // Save user's new password to the user object
                    user.resettoken = false; // Clear user's resettoken
                    // Save user's new data
                    user.save(function(err) {
                        if (err) {
                            res.json({ success: false, message: err });
                        } else {
                            // Create e-mail object to send to user
                            var email = {
                                from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                to: user.police_email,
                                subject: 'Password Recently Reset',
                                text: 'Hello ' + user.police_name + ', This e-mail is to notify you that your password was recently reset at localhost.com',
                                html: 'Hello<strong> ' + user.police_name + '</strong>,<br><br>This e-mail is to notify you that your password was recently reset at localhost.com'
                            };
                            // Function to send e-mail to the user
                            client.sendMail(email, function(err, info) {
                                if (err) console.log(err); // If error with sending e-mail, log to console/terminal
                            });
                            res.json({ success: true, message: 'Password has been reset!' }); // Return success message
                        }
                    });
                }
            }
        });
    });

    // Middleware for Routes that checks for token - Place all routes after this route that require the user to already be logged in
    router.use(function(req, res, next) {
        var token = req.body.token || req.body.query || req.headers['x-access-token']; // Check for token in body, URL, or headers

        // Check if token is valid and not expired
        if (token) {
            // Function to verify token
            jwt.verify(token, secret, function(err, decoded) {
                if (err) {
                    res.json({ success: false, message: 'Token invalid' }); // Token has expired or is invalid
                } else {
                    req.decoded = decoded; // Assign to req. variable to be able to use it in next() route ('/me' route)
                    next(); // Required to leave middleware
                }
            });
        } else {
            res.json({ success: false, message: 'No token provided' }); // Return error if no token was provided in the request
        }
    });

    // Route to get the currently logged in user
    router.post('/me', function(req, res) {
        res.send(req.decoded); // Return the token acquired from middleware
    });

    // Route to provide the user with a new token to renew session
    router.get('/renewToken/:police_username', function(req, res) {
        police_user.findOne({ police_username: req.params.police_username }).select('police_username police_email').exec(function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'pnp@orvtia.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if username was found in database
                if (!user) {
                    res.json({ success: false, message: 'No user was found' }); // Return error
                } else {
                    var newToken = jwt.sign({ police_username: user.police_username, email: user.police_email,  }, secret, { expiresIn: '24h' }); // Give user a new token
                    res.json({ success: true, token: newToken }); // Return newToken in JSON object to controller
                }
            }
        });
    });

    // Route to get the current user's permission level
    router.get('/permission', function(req, res) {
        police_user.findOne({ police_username: req.decoded.police_username }, function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'pnp@orvtia.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if username was found in database
                if (!user) {
                    res.json({ success: false, message: 'No user was found' }); // Return an error
                } else {
                    res.json({ success: true, police_permission: user.police_permission }); // Return the user's permission
                }
            }
        });
    });

    // Route to get all users for management page
    router.get('/management', function(req, res) {
        police_user.find({}, function(err, police_users) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'pnp@orvtia.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
                    if (err) {
                        // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                        var email = {
                            from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                            to: 'pnp@orvtia.com',
                            subject: 'Error Logged',
                            text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                            html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                        };
                        // Function to send e-mail to myself
                        client.sendMail(email, function(err, info) {
                            if (err) {
                                console.log(err); // If error with sending e-mail, log to console/terminal
                            } else {
                                console.log(info); // Log success message to console if sent
                                console.log(user.email); // Display e-mail that it was sent to
                            }
                        });
                        res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                    } else {
                        // Check if logged in user was found in database
                        if (!mainUser) {
                            res.json({ success: false, message: 'No user found' }); // Return error
                        } else {
                            // Check if user has editing/deleting privileges
                            if (mainUser.police_permission === 'main' && mainUser.police_station === "Lingayen") {
                                // Check if users were retrieved from database
                                if (!police_users) {
                                    res.json({ success: false, message: 'Users not found' }); // Return error
                                } else {
                                    res.json({ success: true, police_users: police_users, police_permission: mainUser.police_permission }); // Return users, along with current user's permission
                                }
                            } else if (mainUser.police_permission === 'station'){
                              // Check if users were retrieved from database
                              if (!police_users) {
                                  res.json({ success: false, message: 'Users not found' }); // Return error
                              } else {
                                police_user.find({ police_station: req.decoded.police_station, police_permission: 'user'}, function(err, police_users) {
                                  res.json({ success: true, police_users: police_users, police_permission: mainUser.police_permission, police_station: mainUser.police_station }); // Return users, along with current user's permission
                                });
                              }
                            }  else {
                                res.json({ success: false, message: 'Insufficient Permissions' }); // Return access error
                            }
                        }
                    }
                });
            }
        });

    });

    // Route to delete a user
    router.delete('/management/:police_username', function(req, res) {
        var deletedUser = req.params.police_username; // Assign the username from request parameters to a variable
        police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'pnp@orvtia.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if current user was found in database
                if (!mainUser) {
                    res.json({ success: false, message: 'No user found' }); // Return error
                } else {
                    // Check if curent user has admin access
                    if (mainUser.police_permission !== 'main' && mainUser.police_permission !== 'station') {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                    } else {
                        // Fine the user that needs to be deleted
                        police_user.findOneAndRemove({ police_username: deletedUser }, function(err, user) {
                            if (err) {
                                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                var email = {
                                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                    to: 'pnp@orvtia.com',
                                    subject: 'Error Logged',
                                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                };
                                // Function to send e-mail to myself
                                client.sendMail(email, function(err, info) {
                                    if (err) {
                                        console.log(err); // If error with sending e-mail, log to console/terminal
                                    } else {
                                        console.log(info); // Log success message to console if sent
                                        console.log(user.email); // Display e-mail that it was sent to
                                    }
                                });
                                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                            } else {
                                res.json({ success: true }); // Return success status
                            }
                        });
                    }
                }
            }
        });
    });

    // Route to get the user that needs to be edited
    router.get('/edit/:id', function(req, res) {
        var editUser = req.params.id; // Assign the _id from parameters to variable
        police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'pnp@orvtia.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if logged in user was found in database
                if (!mainUser) {
                    res.json({ success: false, message: 'No user found' }); // Return error
                } else {
                    // Check if logged in user has editing privileges
                    if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                        // Find the user to be editted
                        police_user.findOne({ _id: editUser }, function(err, user) {
                            if (err) {
                                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                var email = {
                                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                    to: 'pnp@orvtia.com',
                                    subject: 'Error Logged',
                                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                };
                                // Function to send e-mail to myself
                                client.sendMail(email, function(err, info) {
                                    if (err) {
                                        console.log(err); // If error with sending e-mail, log to console/terminal
                                    } else {
                                        console.log(info); // Log success message to console if sent
                                        console.log(user.email); // Display e-mail that it was sent to
                                    }
                                });
                                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                            } else {
                                // Check if user to edit is in database
                                if (!user) {
                                    res.json({ success: false, message: 'No user found' }); // Return error
                                } else {
                                    res.json({ success: true, user: user }); // Return the user to be editted
                                }
                            }
                        });
                    } else {
                        res.json({ success: false, message: 'Insufficient Permission' }); // Return access error
                    }
                }
            }
        });
    });
    // Route to update/edit a user
    router.put('/edit', function(req, res) {
        var editUser = req.body._id; // Assign _id from user to be editted to a variable
        if (req.body.police_name) var newName = req.body.police_name; // Check if a change to name was requested
        if (req.body.police_username) var newUsername = req.body.police_username; // Check if a change to username was requested
        if (req.body.police_email) var newEmail = req.body.police_email; // Check if a change to e-mail was requested
        if (req.body.police_contact) var newContact = req.body.police_contact; // Check if a change to contact was requested
        if (req.body.police_station) var newStation = req.body.police_station; // Check if a change to station was requested
        if (req.body.police_rank) var newRank = req.body.police_rank;
        if (req.body.police_permission) var newPermission = req.body.police_permission; // Check if a change to permission was requested
        // Look for logged in user in database to check if have appropriate access
        police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'MEAN Stack Staff, cruiserweights@zoho.com',
                    to: 'gugui3z24@gmail.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if logged in user is found in database
                if (!mainUser) {
                    res.json({ success: false, message: "no user found" }); // Return error
                } else {
                    // Check if a change to name was requested
                    if (newName) {
                        // Check if person making changes has appropriate access
                        if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                            // Look for user in database
                            police_user.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                    var email = {
                                        from: 'MEAN Stack Staff, cruiserweights@zoho.com',
                                        to: 'gugui3z24@gmail.com',
                                        subject: 'Error Logged',
                                        text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                        html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                    };
                                    // Function to send e-mail to myself
                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err); // If error with sending e-mail, log to console/terminal
                                        } else {
                                            console.log(info); // Log success message to console if sent
                                            console.log(user.email); // Display e-mail that it was sent to
                                        }
                                    });
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if user is in database
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' }); // Return error
                                    } else {
                                        user.police_name = newName; // Assign new name to user in database
                                        // Save changes
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log any errors to the console
                                            } else {
                                                res.json({ success: true, message: 'Name has been updated' }); // Return success message
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }
                    // Check if a change to username was requested
                    if (newUsername) {
                        // Check if person making changes has appropriate access
                        if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                            // Look for user in database
                            police_user.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                    var email = {
                                        from: 'MEAN Stack Staff, cruiserweights@zoho.com',
                                        to: 'gugui3z24@gmail.com',
                                        subject: 'Error Logged',
                                        text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                        html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                    };
                                    // Function to send e-mail to myself
                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err); // If error with sending e-mail, log to console/terminal
                                        } else {
                                            console.log(info); // Log success message to console if sent
                                            console.log(user.email); // Display e-mail that it was sent to
                                        }
                                    });
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if user is in database
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' }); // Return error
                                    } else {
                                        user.police_username = newUsername; // Save new username to user in database
                                        // Save changes
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log error to console
                                            } else {
                                                res.json({ success: true, message: 'Username has been updated' }); // Return success
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }
                    // Check if change to e-mail was requested
                    if (newEmail) {
                        // Check if person making changes has appropriate access
                        if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                            // Look for user that needs to be editted
                            police_user.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                    var email = {
                                        from: 'MEAN Stack Staff, cruiserweights@zoho.com',
                                        to: 'gugui3z24@gmail.com',
                                        subject: 'Error Logged',
                                        text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                        html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                    };
                                    // Function to send e-mail to myself
                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err); // If error with sending e-mail, log to console/terminal
                                        } else {
                                            console.log(info); // Log success message to console if sent
                                            console.log(user.email); // Display e-mail that it was sent to
                                        }
                                    });
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if logged in user is in database
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' }); // Return error
                                    } else {
                                        user.police_email = newEmail; // Assign new e-mail to user in databse
                                        // Save changes
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log error to console
                                            } else {
                                                res.json({ success: true, message: 'E-mail has been updated' }); // Return success
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }

                    // Check if change to contact was requested
                    if (newContact) {
                        // Check if person making changes has appropriate access
                        if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                            // Look for user that needs to be editted
                            police_user.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                    var email = {
                                        from: 'MEAN Stack Staff, cruiserweights@zoho.com',
                                        to: 'gugui3z24@gmail.com',
                                        subject: 'Error Logged',
                                        text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                        html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                    };
                                    // Function to send e-mail to myself
                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err); // If error with sending e-mail, log to console/terminal
                                        } else {
                                            console.log(info); // Log success message to console if sent
                                            console.log(user.email); // Display e-mail that it was sent to
                                        }
                                    });
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if logged in user is in database
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' }); // Return error
                                    } else {
                                        user.police_contact = newContact; // Assign new contact to user in databse
                                        // Save changes
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log error to console
                                            } else {
                                                res.json({ success: true, message: 'Contact number has been updated' }); // Return success
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }

                    // Check if change to station was requested
                    if (newStation) {
                        // Check if person making changes has appropriate access
                        if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                            // Look for user that needs to be editted
                            police_user.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                    var email = {
                                        from: 'MEAN Stack Staff, cruiserweights@zoho.com',
                                        to: 'gugui3z24@gmail.com',
                                        subject: 'Error Logged',
                                        text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                        html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                    };
                                    // Function to send e-mail to myself
                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err); // If error with sending e-mail, log to console/terminal
                                        } else {
                                            console.log(info); // Log success message to console if sent
                                            console.log(user.email); // Display e-mail that it was sent to
                                        }
                                    });
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if logged in user is in database
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' }); // Return error
                                    } else {
                                      if (newStation === 'Agno' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                              res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Aguilar' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Alcala' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Anda' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Asingan' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Balungao' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Bani' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Basista' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Bautista' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Bayambang' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Binalonan' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Binmaley'){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Bolinao' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Bugallon' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Burgos' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Calasiao' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Dasol' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Infanta'){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Labrador' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Laoac' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Lingayen' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Mabini' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Malasiqui' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Manaoag' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Mangaldan' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Mangatarem' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Mapandan' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Natividad' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Pozorrubio' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Rosales' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'San Fabian' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'San Jacinto' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'San Manuel' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'San Nicolas' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'San Quintin' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Santa Barbara' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Santa Maria' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Santp Tomas' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Sison' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Sual' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Tayug' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Umingan' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Urbiztondo' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Villasis')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      } else if (newStation === 'Villasis' ){
                                          if ((mainUser.police_permission === 'station' && user.police_station === 'Agno') || (mainUser.police_permission === 'station' && user.police_station === 'Alcala') || (mainUser.police_permission === 'station' && user.police_station === 'Anda')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Asingan') || (mainUser.police_permission === 'station' && user.police_station === 'Balungao') || (mainUser.police_permission === 'station' && user.police_station === 'Bani')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Basista') || (mainUser.police_permission === 'station' && user.police_station === 'Bautista') || (mainUser.police_permission === 'station' && user.police_station === 'Bayambang')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && user.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && user.police_station === 'Bolinao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && user.police_station === 'Burgos') || (mainUser.police_permission === 'station' && user.police_station === 'Calasiao')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Dasol') || (mainUser.police_permission === 'station' && user.police_station === 'Infanta') || (mainUser.police_permission === 'station' && user.police_station === 'Labrador')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Laoac') || (mainUser.police_permission === 'station' && user.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && user.police_station === 'Mabini')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && user.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && user.police_station === 'Mangaldan')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && user.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && user.police_station === 'Natividad')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && user.police_station === 'Rosales') || (mainUser.police_permission === 'station' && user.police_station === 'San Fabian')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && user.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && user.police_station === 'San Nicolas')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && user.police_station === 'Santa Maria')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && user.police_station === 'Sison') || (mainUser.police_permission === 'station' && user.police_station === 'Sual')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && user.police_station === 'Umingan') || (mainUser.police_permission === 'station' && user.police_station === 'Urbiztondo')
                                          || (mainUser.police_permission === 'station' && user.police_station === 'Aguilar')){
                                                res.json({ success: false, message: 'You must be an main admin to change his/her station' }); // Return error
                                          } else {
                                            user.police_station = newStation; // Assign new station to user in databse
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Police Station has been updated' }); // Return success
                                                }
                                            });
                                          }
                                      }
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }
                    // Check if a change to name was requested
                    if (newRank) {
                        // Check if person making changes has appropriate access
                        if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                            // Look for user in database
                            police_user.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                    var email = {
                                        from: 'MEAN Stack Staff, cruiserweights@zoho.com',
                                        to: 'gugui3z24@gmail.com',
                                        subject: 'Error Logged',
                                        text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                        html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                    };
                                    // Function to send e-mail to myself
                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err); // If error with sending e-mail, log to console/terminal
                                        } else {
                                            console.log(info); // Log success message to console if sent
                                            console.log(user.email); // Display e-mail that it was sent to
                                        }
                                    });
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if user is in database
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' }); // Return error
                                    } else {
                                        user.rank = newRank; // Assign new name to user in database
                                        // Save changes
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log any errors to the console
                                            } else {
                                                res.json({ success: true, message: 'Rank has been updated' }); // Return success message
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }
                    // Check if a change to permission was requested
                    if (newPermission) {
                        // Check if user making changes has appropriate access
                        if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                            // Look for user to edit in database
                            police_user.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                    var email = {
                                        from: 'MEAN Stack Staff, cruiserweights@zoho.com',
                                        to: 'gugui3z24@gmail.com',
                                        subject: 'Error Logged',
                                        text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                        html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                    };
                                    // Function to send e-mail to myself
                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err); // If error with sending e-mail, log to console/terminal
                                        } else {
                                            console.log(info); // Log success message to console if sent
                                            console.log(user.email); // Display e-mail that it was sent to
                                        }
                                    });
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if user is found in database
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' }); // Return error
                                    } else {
                                        // Check if attempting to set the 'user' permission
                                        if (newPermission === 'user') {
                                            // Check the current permission is an admin
                                            if (user.police_permission === 'station' || user.police_permission === 'main') {
                                                // Check if user making changes has access
                                                if (mainUser.police_permission !== 'main') {
                                                    res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade an admin.' }); // Return error
                                                } else {
                                                    user.police_permission = newPermission; // Assign new permission to user
                                                    // Save changes
                                                    user.save(function(err) {
                                                        if (err) {
                                                            console.log(err); // Long error to console
                                                        } else {
                                                            res.json({ success: true, message: 'Permissions have been updated' }); // Return success
                                                        }
                                                    });
                                                }
                                            } else {
                                                user.police_permission = newPermission; // Assign new permission to user
                                                // Save changes
                                                user.save(function(err) {
                                                    if (err) {
                                                        console.log(err); // Log error to console
                                                    } else {
                                                        res.json({ success: true, message: 'Permissions have been updated' }); // Return success
                                                    }
                                                });
                                            }
                                        }
                                        // Check if attempting to set the 'moderator' permission
                                        if (newPermission === 'station') {
                                            // Check if the current permission is 'admin'
                                            if (user.police_permission === 'user') {
                                                // Check if user making changes has access
                                                  if (mainUser.police_permission !== 'main') {
                                                    res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to upgrade android user' }); // Return error
                                                } else {
                                                    user.police_permission = newPermission; // Assign new permission
                                                    // Save changes
                                                    user.save(function(err) {
                                                        if (err) {
                                                            console.log(err); // Log error to console
                                                        } else {
                                                            res.json({ success: true, message: 'Permissions have been updated' }); // Return success
                                                        }
                                                    });
                                                }
                                            } else {
                                                user.police_permission = newPermission; // Assign new permission
                                                // Save changes
                                                user.save(function(err) {
                                                    if (err) {
                                                        console.log(err); // Log error to console
                                                    } else {
                                                        res.json({ success: true, message: 'Permissions have been updated' }); // Return success
                                                    }
                                                });
                                            }
                                        }

                                        // Check if assigning the 'admin' permission
                                        if (newPermission === 'main') {
                                            // Check if logged in user has access
                                            if (mainUser.police_permission === 'main') {
                                                user.police_permission = newPermission; // Assign new permission
                                                // Save changes
                                                user.save(function(err) {
                                                    if (err) {
                                                        console.log(err); // Log error to console
                                                    } else {
                                                        res.json({ success: true, message: 'Permissions have been updated' }); // Return success
                                                    }
                                                });
                                            } else {
                                                res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to upgrade someone to the admin level' }); // Return error
                                            }
                                        }
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }
                }
            }
        });
    });
    router.get('/findReport', function(req,res){
       models.Police_Report.find({})
       .populate({path:"people_involved_id", model:"People_Involved"})
       .populate({path:"vehicle_id", model:"Vehicle"})
       .exec(function(err, police_reports){

           if (err) {
               res.json(500,err);
           }else{
               police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
                   if (err) {
                       // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                   var email = {
                       from: 'ORVTIA Team Staff, orvtiaquestion@gmail.com',
                       to: 'orvtiateam@gmail.com',
                       subject: 'Error Logged',
                       text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                       html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                   };
                   // Function to send e-mail to myself
                   client.sendMail(email, function(err, info) {
                       if (err) {
                           console.log(err); // If error with sending e-mail, log to console/terminal
                       } else {
                           console.log(info); // Log success message to console if sent
                           console.log(user.email); // Display e-mail that it was sent to
                       }
                   });
                   res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                   } else {
                       // Check if logged in report was found in database
                       if (!mainUser) {
                           res.json({ success: false, message: 'No user found' }); // Return error
                       } else {
                           // Check if user has editing/deleting privileges
                           if (mainUser.police_permission === 'main') {
                               // Check if users were retrieved from database
                               if (!police_reports) {
                                   res.json({ success: false, message: 'No report found' }); // Return error
                               } else {
                                   res.json({ success: true, police_reports: police_reports, police_permission: mainUser.police_permission }); // Return users, along with current user's permission
                               }
                           } else if (mainUser.police_permission === 'station' && mainUser.police_station === req.decoded.police_station){
                               if (!police_reports) {
                                   res.json({ success: false, message: 'No report found' }); // Return error
                               } else {
                                   models.Police_Report.find({address_municipality: req.decoded.police_station})
                                   .populate({path:"people_involved_id", model:"People_Involved"})
                                   .populate({path:"vehicle_id", model:"Vehicle"})
                                   .exec(function(err,police_reports){
                                   if (err) {
                                            res.json(500,err);
                                    }else{
                                       res.json({ success: true, police_reports: police_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                   }
                               });
                               }

                           } else {
                               res.json({ success: false, message: 'Insufficient Permissions' }); // Return access error
                           }
                       }
                   }
               });
           }
       });
   });
    // Route to get the report that needs to be edited
    router.get('/editReport/:id', function(req, res) {
        var editReport = req.params.id; // Assign the _id from parameters to variable
        police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'pnp@orvtia.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if logged in user was found in database
                if (!mainUser) {
                    res.json({ success: false, message: 'No user found' }); // Return error
                } else {
                    // Check if logged in report has editing privileges
                    if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                        // Find the user to be editted
                        models.Police_Report.findOne({ _id: editReport }, function(err, report) {
                            if (err) {
                                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                var email = {
                                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                    to: 'pnp@orvtia.com',
                                    subject: 'Error Logged',
                                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                };
                                // Function to send e-mail to myself
                                client.sendMail(email, function(err, info) {
                                    if (err) {
                                        console.log(err); // If error with sending e-mail, log to console/terminal
                                    } else {
                                        console.log(info); // Log success message to console if sent
                                        console.log(user.email); // Display e-mail that it was sent to
                                    }
                                });
                                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                            } else {
                                // Check if report to edit is in database
                                if (!report) {
                                    res.json({ success: false, message: 'No user found' }); // Return error
                                } else {
                                    res.json({ success: true, report: report }); // Return the user to be editted
                                }
                            }
                        });
                    } else {
                        res.json({ success: false, message: 'Insufficient Permission' }); // Return access error
                    }
                }
            }
        });
    });
    // Route to update/edit a report
    router.put('/editReport', function(req, res) {
        var editReport = req.body._id; // Assign _id from user to be editted to a variable
        if (req.body.accident_type) var newAccidentType = req.body.accident_type; // Check if a change to accident type was requested
        if (req.body.accident_cause) var newAccidentCause = req.body.accident_cause; // Check if a change to accident cause was requested
        if (req.body.committed_at) var newCommitted = req.body.committed_at; // Check if a change to thorougfare was requested
        // Look for logged in user in database to check if have appropriate access
        police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'pnp@orvtia.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if logged in user is found in database
                if (!mainUser) {
                    res.json({ success: false, message: "no user found" }); // Return error
                } else {
                    // Check if a change to accident type was requested
                    if (newAccidentType) {
                        // Check if person making changes has appropriate access
                        if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                            // Look for user in database
                            models.Police_Report.findOne({ _id: editReport }, function(err, report) {
                                if (err) {
                                    // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                    var email = {
                                        from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                        to: 'pnp@orvtia.com',
                                        subject: 'Error Logged',
                                        text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                        html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                    };
                                    // Function to send e-mail to myself
                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err); // If error with sending e-mail, log to console/terminal
                                        } else {
                                            console.log(info); // Log success message to console if sent
                                            console.log(user.email); // Display e-mail that it was sent to
                                        }
                                    });
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if report is in database
                                    if (!report) {
                                        res.json({ success: false, message: 'No user found' }); // Return error
                                    } else {
                                        report.accident_type = newAccidentType; // Assign new name to report in database
                                        // Save changes
                                        report.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log any errors to the console
                                            } else {
                                                res.json({ success: true, message: 'Accident Type has been updated' });
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }
                    // Check if a change to accident cause was requested
                    if (newAccidentCause) {
                        // Check if person making changes has appropriate access
                        if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                            // Look for user in database
                            models.Police_Report.findOne({ _id: editReport }, function(err, report) {
                                if (err) {
                                    // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                    var email = {
                                        from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                        to: 'pnp@orvtia.com',
                                        subject: 'Error Logged',
                                        text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                        html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                    };
                                    // Function to send e-mail to myself
                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err); // If error with sending e-mail, log to console/terminal
                                        } else {
                                            console.log(info); // Log success message to console if sent
                                            console.log(user.email); // Display e-mail that it was sent to
                                        }
                                    });
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if user is in database
                                    if (!report) {
                                        res.json({ success: false, message: 'No user found' }); // Return error
                                    } else {
                                        report.accident_cause = newAccidentCause; // Save new username to user in database
                                        // Save changes
                                        report.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log error to console
                                            } else {
                                                res.json({ success: true, message: 'Accident Cause has been updated' }); // Return success
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }
                    // Check if a change to accident cause was requested
                    if (newCommitted) {
                        // Check if person making changes has appropriate access
                        if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                            // Look for user in database
                            models.Police_Report.findOne({ _id: editReport }, function(err, report) {
                                if (err) {
                                    // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                    var email = {
                                        from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                        to: 'pnp@orvtia.com',
                                        subject: 'Error Logged',
                                        text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                        html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                    };
                                    // Function to send e-mail to myself
                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err); // If error with sending e-mail, log to console/terminal
                                        } else {
                                            console.log(info); // Log success message to console if sent
                                            console.log(user.email); // Display e-mail that it was sent to
                                        }
                                    });
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if user is in database
                                    if (!report) {
                                        res.json({ success: false, message: 'No user found' }); // Return error
                                    } else {
                                        report.committed_at = newCommitted; // Save new username to user in database
                                        // Save changes
                                        report.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log error to console
                                            } else {
                                                res.json({ success: true, message: 'Accident Cause has been updated' }); // Return success
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }
                  }
              }
          });
    });
    // Route to get all report for management page
    router.get('/citizenReportManagement', function(req, res) {
        citizen.Citizen_Report.find({}, function(err, citizen_reports) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'pnp@orvtia.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
                    if (err) {
                        // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                        var email = {
                            from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                            to: 'pnp@orvtia.com',
                            subject: 'Error Logged',
                            text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                            html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                        };
                        // Function to send e-mail to myself
                        client.sendMail(email, function(err, info) {
                            if (err) {
                                console.log(err); // If error with sending e-mail, log to console/terminal
                            } else {
                                console.log(info); // Log success message to console if sent
                                console.log(user.email); // Display e-mail that it was sent to
                            }
                        });
                        res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                    } else {
                        // Check if logged in report was found in database
                        if (!mainUser) {
                            res.json({ success: false, message: 'No user found' }); // Return error
                        } else {
                            // Check if user has editing/deleting privileges
                            if (mainUser.police_permission === 'main') {
                                // Check if users were retrieved from database
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission }); // Return users, along with current user's permission
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Agno'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Agno' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Aguilar'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Aguilar' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Alcala'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Alcala' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Anda'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Anda' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Asingan'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Asingan' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Balungao'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Balungao' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Bani'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Bani' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Basista'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Basista' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Bautista'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Bautista' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Bayambang'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Bayambang' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Binalonan'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Binalonan' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Binmaley'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Binmaley' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Bolinao'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Bolinao' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Bugallon'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Bugallon' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Burgos'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Burgos' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Calasiao'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Calasiao' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Dasol'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Dasol' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Infanta'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Infanta' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Labrador'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Labrador' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Laoac'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Laoac' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Lingayen'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Lingayen' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Mabini'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Mabini' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Malasiqui'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Malasiqui' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Manaoag'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Manaoag' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Mangaldan'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Mangaldan' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Mangatarem'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Mangatarem' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Mapandan'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Mapandan' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Natividad'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                    citizen.Citizen_Report.find({ citizen_report_municipality: 'Natividad' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Pozorrubio'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Pozorrubio' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Rosales'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Rosales' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'San Fabian'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'San Fabian' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'San Jacinto'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'San Jacinto' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'San Manuel'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'San Manuel' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'San Nicolas'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'San Nicolas' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'San Quintin'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'San Quintin' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Santa Barbara'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Santa Barbara' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Santa Maria'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Santa Maria' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Santo Tomas'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Santo Tomas' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Sison'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Sison' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Sual'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Sual' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Tayug'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Tayug' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Umingan'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Umingan' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Urbiztondo'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Urbiztondo' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === 'Villasis'){
                                if (!citizen_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  citizen.Citizen_Report.find({ citizen_report_municipality: 'Villasis' }, function(err, citizen_reports) {
                                    res.json({ success: true, citizen_reports: citizen_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else {
                                res.json({ success: false, message: 'Insufficient Permissions' }); // Return access error
                            }
                        }
                    }
                });
            }
        });
    });
    // Route to get the report that needs to be edited
    router.get('/editCitizenReport/:id', function(req, res) {
        var editCitizenReport = req.params.id; // Assign the _id from parameters to variable
        police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'pnp@orvtia.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if logged in user was found in database
                if (!mainUser) {
                    res.json({ success: false, message: 'No user found' }); // Return error
                } else {
                    // Check if logged in report has editing privileges
                    if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                        // Find the user to be editted
                        citizen.Citizen_Report.findOne({ _id: editCitizenReport }, function(err, report) {
                            if (err) {
                                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                var email = {
                                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                    to: 'pnp@orvtia.com',
                                    subject: 'Error Logged',
                                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                };
                                // Function to send e-mail to myself
                                client.sendMail(email, function(err, info) {
                                    if (err) {
                                        console.log(err); // If error with sending e-mail, log to console/terminal
                                    } else {
                                        console.log(info); // Log success message to console if sent
                                        console.log(user.email); // Display e-mail that it was sent to
                                    }
                                });
                                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                            } else {
                                // Check if report to edit is in database
                                if (!report) {
                                    res.json({ success: false, message: 'No user found' }); // Return error
                                } else {
                                    res.json({ success: true, report: report }); // Return the user to be editted
                                }
                            }
                        });
                    } else {
                        res.json({ success: false, message: 'Insufficient Permission' }); // Return access error
                    }
                }
            }
        });
    });
    // Route to update/edit a Citizen report
    router.put('/editCitizenReport', function(req, res) {
        var editCitizenReport = req.body._id; // Assign _id from report credibilty to be editted to a variable
        if (req.body.citizen_report_credibility) var newReportCredibility = req.body.citizen_report_credibility; // Check if a change to accident type was requested
        // Look for logged in user in database to check if have appropriate access
        police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'pnp@orvtia.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if logged in user is found in database
                if (!mainUser) {
                    res.json({ success: false, message: "No user found" }); // Return error
                } else {
                    // Check if a change to accident type was requested
                    if (newReportCredibility) {
                        // Check if person making changes has appropriate access
                        if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                            // Look for user in database
                            citizen.Citizen_Report.findOne({ _id: editCitizenReport }, function(err, report) {
                                if (err) {
                                    // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                    var email = {
                                        from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                        to: 'pnp@orvtia.com',
                                        subject: 'Error Logged',
                                        text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                        html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                    };
                                    // Function to send e-mail to myself
                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err); // If error with sending e-mail, log to console/terminal
                                        } else {
                                            console.log(info); // Log success message to console if sent
                                            console.log(user.email); // Display e-mail that it was sent to
                                        }
                                    });
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if report is in database
                                    if (!report) {
                                        res.json({ success: false, message: 'No report found' }); // Return error
                                    } else {
                                        report.citizen_report_credibility = newReportCredibility; // Assign new name to report in database
                                        // Save changes
                                        report.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log any errors to the console
                                            } else {
                                                res.json({ success: true, message: 'Report credibility has been updated' });
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }
                  }
              }
          });
    });
      // Route to get the people involve that needs to be edited
    router.get('/editPeopleInvolved/:id', function(req, res) {
        var editPeopleInvolved = req.params.id; // Assign the _id from parameters to variable
        police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'pnp@orvtia.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if logged in user was found in database
                if (!mainUser) {
                    res.json({ success: false, message: 'No user found' }); // Return error
                } else {
                    // Check if logged in report has editing privileges
                    if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                        // Find the user to be editted
                        models.People_Involved.findOne({ _id: editPeopleInvolved }, function(err, people) {
                            if (err) {
                                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                var email = {
                                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                    to: 'pnp@orvtia.com',
                                    subject: 'Error Logged',
                                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                };
                                // Function to send e-mail to myself
                                client.sendMail(email, function(err, info) {
                                    if (err) {
                                        console.log(err); // If error with sending e-mail, log to console/terminal
                                    } else {
                                        console.log(info); // Log success message to console if sent
                                        console.log(user.email); // Display e-mail that it was sent to
                                    }
                                });
                                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                            } else {
                                // Check if report to edit is in database
                                if (!people) {
                                    res.json({ success: false, message: 'No user found' }); // Return error
                                } else {
                                    res.json({ success: true, people: people }); // Return the user to be editted
                                }
                            }
                        });
                    } else {
                        res.json({ success: false, message: 'Insufficient Permission' }); // Return access error
                    }
                }
            }
        });
    });
    // Route to update/edit a people involved details
    router.put('/editPeopleInvolved', function(req, res) {
        var editPeopleInvolved = req.body._id; // Assign _id from people involved to be editted to a variable
        if (req.body.people_involved_name) var newPeopleInvolvedName = req.body.people_involved_name; // Check if a change to name was requested
        if (req.body.people_involved_age) var newPeopleInvolvedAge = req.body.people_involved_age; // Check if a change to age was requested
        if (req.body.people_involved_gender) var newPeopleInvolvedGender = req.body.people_involved_gender; // Check if a change to gender was requested
        if (req.body.people_involved_citizenship) var newPeopleInvolvedCitizenship = req.body.people_involved_citizenship; // Check if a change to citizenship was requested
        if (req.body.people_involved_status) var newPeopleInvolvedStatus = req.body.people_involved_status; // Check if a change to status was requested
        if (req.body.people_involved_type) var newPeopleInvolvedType = req.body.people_involved_type; // Check if a change to type was requested
        // Look for logged in user in database to check if have appropriate access
        police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'pnp@orvtia.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if logged in user is found in database
                if (!mainUser) {
                    res.json({ success: false, message: "no user found" }); // Return error
                } else {
                    // Check if a change to name was requested
                    if (newPeopleInvolvedName) {
                        // Check if person making changes has appropriate access
                        if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                            // Look for people involveds in database
                            models.People_Involved.findOne({ _id: editPeopleInvolved }, function(err, people) {
                                if (err) {
                                    // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                    var email = {
                                        from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                        to: 'pnp@orvtia.com',
                                        subject: 'Error Logged',
                                        text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                        html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                    };
                                    // Function to send e-mail to myself
                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err); // If error with sending e-mail, log to console/terminal
                                        } else {
                                            console.log(info); // Log success message to console if sent
                                            console.log(user.email); // Display e-mail that it was sent to
                                        }
                                    });
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if people involved is in database
                                    if (!people) {
                                        res.json({ success: false, message: 'No details found' }); // Return error
                                    } else {
                                        people.people_involved_name = newPeopleInvolvedName; // Assign new name to report in database
                                        // Save changes
                                        people.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log any errors to the console
                                            } else {
                                                res.json({ success: true, message: 'Name has been updated' });
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }
                    // Check if a change to age was requested
                    if (newPeopleInvolvedAge) {
                        // Check if person making changes has appropriate access
                        if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                            // Look for people involved in database
                            models.People_Involved.findOne({ _id: editPeopleInvolved }, function(err, people) {
                                if (err) {
                                    // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                    var email = {
                                        from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                        to: 'pnp@orvtia.com',
                                        subject: 'Error Logged',
                                        text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                        html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                    };
                                    // Function to send e-mail to myself
                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err); // If error with sending e-mail, log to console/terminal
                                        } else {
                                            console.log(info); // Log success message to console if sent
                                            console.log(user.email); // Display e-mail that it was sent to
                                        }
                                    });
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if people involved is in database
                                    if (!people) {
                                        res.json({ success: false, message: 'No details found' }); // Return error
                                    } else {
                                        people.people_involved_age = newPeopleInvolvedAge; // Save new age to user in database
                                        // Save changes
                                        people.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log error to console
                                            } else {
                                                res.json({ success: true, message: 'Age has been updated' }); // Return success
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }
                    // Check if a change to gender was requested
                    if (newPeopleInvolvedGender) {
                        // Check if person making changes has appropriate access
                        if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                            // Look for people involved in database
                            models.People_Involved.findOne({ _id: editPeopleInvolved }, function(err, people) {
                                if (err) {
                                    // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                    var email = {
                                        from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                        to: 'pnp@orvtia.com',
                                        subject: 'Error Logged',
                                        text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                        html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                    };
                                    // Function to send e-mail to myself
                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err); // If error with sending e-mail, log to console/terminal
                                        } else {
                                            console.log(info); // Log success message to console if sent
                                            console.log(user.email); // Display e-mail that it was sent to
                                        }
                                    });
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if people involved is in database
                                    if (!people) {
                                        res.json({ success: false, message: 'No details found' }); // Return error
                                    } else {
                                        people.people_involved_gender = newPeopleInvolvedGender; // Save new gender to user in database
                                        // Save changes
                                        people.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log error to console
                                            } else {
                                                res.json({ success: true, message: 'Gender has been updated' }); // Return success
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }
                    // Check if a change to citizenship was requested
                    if (newPeopleInvolvedCitizenship) {
                        // Check if person making changes has appropriate access
                        if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                            // Look for people involved in database
                            models.People_Involved.findOne({ _id: editPeopleInvolved }, function(err, people) {
                                if (err) {
                                    // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                    var email = {
                                        from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                        to: 'pnp@orvtia.com',
                                        subject: 'Error Logged',
                                        text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                        html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                    };
                                    // Function to send e-mail to myself
                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err); // If error with sending e-mail, log to console/terminal
                                        } else {
                                            console.log(info); // Log success message to console if sent
                                            console.log(user.email); // Display e-mail that it was sent to
                                        }
                                    });
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if user is in database
                                    if (!people) {
                                        res.json({ success: false, message: 'No user found' }); // Return error
                                    } else {
                                        people.people_involved_citizenship = newPeopleInvolvedCitizenship; // Save new citizenship to user in database
                                        // Save changes
                                        people.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log error to console
                                            } else {
                                                res.json({ success: true, message: 'Citizenship has been updated' }); // Return success
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }
                    // Check if a change to status was requested
                    if (newPeopleInvolvedStatus) {
                        // Check if person making changes has appropriate access
                        if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                            // Look for people involved in database
                            models.People_Involved.findOne({ _id: editPeopleInvolved }, function(err, people) {
                                if (err) {
                                    // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                    var email = {
                                        from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                        to: 'pnp@orvtia.com',
                                        subject: 'Error Logged',
                                        text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                        html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                    };
                                    // Function to send e-mail to myself
                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err); // If error with sending e-mail, log to console/terminal
                                        } else {
                                            console.log(info); // Log success message to console if sent
                                            console.log(user.email); // Display e-mail that it was sent to
                                        }
                                    });
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if people involved is in database
                                    if (!people) {
                                        res.json({ success: false, message: 'No user found' }); // Return error
                                    } else {
                                        people.people_involved_status = newPeopleInvolvedStatus; // Save new status to user in database
                                        // Save changes
                                        people.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log error to console
                                            } else {
                                                res.json({ success: true, message: 'Status has been updated' }); // Return success
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }
                      // Check if a change to type was requested
                    if (newPeopleInvolvedType) {
                        // Check if person making changes has appropriate access
                        if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                            // Look for people involved in database
                            models.People_Involved.findOne({ _id: editPeopleInvolved }, function(err, people) {
                                if (err) {
                                    // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                    var email = {
                                        from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                        to: 'pnp@orvtia.com',
                                        subject: 'Error Logged',
                                        text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                        html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                    };
                                    // Function to send e-mail to myself
                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err); // If error with sending e-mail, log to console/terminal
                                        } else {
                                            console.log(info); // Log success message to console if sent
                                            console.log(user.email); // Display e-mail that it was sent to
                                        }
                                    });
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if people involved is in database
                                    if (!people) {
                                        res.json({ success: false, message: 'No details found' }); // Return error
                                    } else {
                                        people.people_involved_type = newPeopleInvolvedType; // Save new type to people involved in database
                                        // Save changes
                                        people.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log error to console
                                            } else {
                                                res.json({ success: true, message: 'Type of People Involved has been updated' }); // Return success
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }
                }
              }
          });
    });
    // Route to get the vehicle details that needs to be edited
    router.get('/editVehicle/:id', function(req, res) {
      var editVehicle = req.params.id; // Assign the _id from parameters to variable
      police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
          if (err) {
              // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
              var email = {
                  from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                  to: 'pnp@orvtia.com',
                  subject: 'Error Logged',
                  text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                  html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
              };
              // Function to send e-mail to myself
              client.sendMail(email, function(err, info) {
                  if (err) {
                      console.log(err); // If error with sending e-mail, log to console/terminal
                  } else {
                      console.log(info); // Log success message to console if sent
                      console.log(user.email); // Display e-mail that it was sent to
                  }
              });
              res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
          } else {
              // Check if logged in user was found in database
              if (!mainUser) {
                  res.json({ success: false, message: 'No user found' }); // Return error
              } else {
                  // Check if logged in report has editing privileges
                  if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                      // Find the user to be editted
                      models.Vehicle.findOne({ _id: editVehicle }, function(err, vehicle) {
                          if (err) {
                              // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                              var email = {
                                  from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                  to: 'pnp@orvtia.com',
                                  subject: 'Error Logged',
                                  text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                  html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                              };
                              // Function to send e-mail to myself
                              client.sendMail(email, function(err, info) {
                                  if (err) {
                                      console.log(err); // If error with sending e-mail, log to console/terminal
                                  } else {
                                      console.log(info); // Log success message to console if sent
                                      console.log(user.email); // Display e-mail that it was sent to
                                  }
                              });
                              res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                          } else {
                              // Check if vehicle to edit is in database
                              if (!vehicle) {
                                  res.json({ success: false, message: 'No user found' }); // Return error
                              } else {
                                  res.json({ success: true, vehicle: vehicle }); // Return the vehicle to be editted
                              }
                          }
                      });
                  } else {
                      res.json({ success: false, message: 'Insufficient Permission' }); // Return access error
                  }
              }
          }
        });
    });
    // Route to update/edit a people involved details
    router.put('/editVehicle', function(req, res) {
      var editVehicle = req.body._id; // Assign _id from vehicle to be editted to a variable
      if (req.body.vehicle_type) var newVehicleType = req.body.vehicle_type; // Check if a change to type of vehicle was requested
      if (req.body.vehicle_platenumber) var newVehiclePlateNumber = req.body.vehicle_platenumber; // Check if a change to plate number was requested
      if (req.body.vehicle_brand) var newVehicleBrand = req.body.vehicle_brand; // Check if a change to brand was requested
      if (req.body.vehicle_model) var newVehicleModel = req.body.vehicle_model; // Check if a change to model was requested
      // Look for logged in user in database to check if have appropriate access
      police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
          if (err) {
              // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
              var email = {
                  from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                  to: 'pnp@orvtia.com',
                  subject: 'Error Logged',
                  text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                  html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
              };
              // Function to send e-mail to myself
              client.sendMail(email, function(err, info) {
                  if (err) {
                      console.log(err); // If error with sending e-mail, log to console/terminal
                  } else {
                      console.log(info); // Log success message to console if sent
                      console.log(user.email); // Display e-mail that it was sent to
                  }
              });
              res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
          } else {
              // Check if logged in user is found in database
              if (!mainUser) {
                  res.json({ success: false, message: "no user found" }); // Return error
              } else {
                  // Check if a change to vehicle type was requested
                  if (newVehicleType) {
                      // Check if person making changes has appropriate access
                      if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                          // Look for vehicle in database
                          models.Vehicle.findOne({ _id: editVehicle }, function(err, vehicle) {
                              if (err) {
                                  // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                  var email = {
                                      from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                      to: 'pnp@orvtia.com',
                                      subject: 'Error Logged',
                                      text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                      html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                  };
                                  // Function to send e-mail to myself
                                  client.sendMail(email, function(err, info) {
                                      if (err) {
                                          console.log(err); // If error with sending e-mail, log to console/terminal
                                      } else {
                                          console.log(info); // Log success message to console if sent
                                          console.log(user.email); // Display e-mail that it was sent to
                                      }
                                  });
                                  res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                              } else {
                                  // Check if vehicle is in database
                                  if (!vehicle) {
                                      res.json({ success: false, message: 'No details found' }); // Return error
                                  } else {
                                      vehicle.vehicle_type = newVehicleType; // Assign new vehicle type to report in database
                                      // Save changes
                                      vehicle.save(function(err) {
                                          if (err) {
                                              console.log(err); // Log any errors to the console
                                          } else {
                                              res.json({ success: true, message: 'Vehicle Type has been updated' });
                                          }
                                      });
                                  }
                              }
                          });
                      } else {
                          res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                      }
                  }
                  // Check if a change to plate number was requested
                  if (newVehiclePlateNumber) {
                      // Check if person making changes has appropriate access
                      if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                          // Look for Vehicle in database
                          models.Vehicle.findOne({ _id: editVehicle }, function(err, vehicle) {
                              if (err) {
                                  // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                  var email = {
                                      from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                      to: 'pnp@orvtia.com',
                                      subject: 'Error Logged',
                                      text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                      html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                  };
                                  // Function to send e-mail to myself
                                  client.sendMail(email, function(err, info) {
                                      if (err) {
                                          console.log(err); // If error with sending e-mail, log to console/terminal
                                      } else {
                                          console.log(info); // Log success message to console if sent
                                          console.log(user.email); // Display e-mail that it was sent to
                                      }
                                  });
                                  res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                              } else {
                                  // Check if vehicle is in database
                                  if (!vehicle) {
                                      res.json({ success: false, message: 'No details found' }); // Return error
                                  } else {
                                      vehicle.vehicle_platenumber = newVehiclePlateNumber; // Assign new plate number to report in database
                                      // Save changes
                                      vehicle.save(function(err) {
                                          if (err) {
                                              console.log(err); // Log any errors to the console
                                          } else {
                                              res.json({ success: true, message: 'Vehicle Plate Number has been updated' });
                                          }
                                      });
                                  }
                              }
                          });
                      } else {
                          res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                      }
                  }
                  // Check if a change to brand was requested
                  if (newVehicleBrand) {
                      // Check if person making changes has appropriate access
                      if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                          // Look for vehicle in database
                          models.Vehicle.findOne({ _id: editVehicle }, function(err, vehicle) {
                              if (err) {
                                  // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                  var email = {
                                      from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                      to: 'pnp@orvtia.com',
                                      subject: 'Error Logged',
                                      text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                      html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                  };
                                  // Function to send e-mail to myself
                                  client.sendMail(email, function(err, info) {
                                      if (err) {
                                          console.log(err); // If error with sending e-mail, log to console/terminal
                                      } else {
                                          console.log(info); // Log success message to console if sent
                                          console.log(user.email); // Display e-mail that it was sent to
                                      }
                                  });
                                  res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                              } else {
                                  // Check if vehicle in database
                                  if (!vehicle) {
                                      res.json({ success: false, message: 'No details found' }); // Return error
                                  } else {
                                      vehicle.vehicle_brand = newVehicleBrand; // Assign new brand to report in database
                                      // Save changes
                                      vehicle.save(function(err) {
                                          if (err) {
                                              console.log(err); // Log any errors to the console
                                          } else {
                                              res.json({ success: true, message: 'Vehicle Brand has been updated' });
                                          }
                                      });
                                  }
                              }
                          });
                      } else {
                          res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                      }
                  }
                  // Check if a change to Model was requested
                  if (newVehicleModel) {
                      // Check if person making changes has appropriate access
                      if (mainUser.police_permission === 'main' || mainUser.police_permission === 'station') {
                          // Look for vehicle in database
                          models.Vehicle.findOne({ _id: editVehicle }, function(err, vehicle) {
                              if (err) {
                                  // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                  var email = {
                                      from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                      to: 'pnp@orvtia.com',
                                      subject: 'Error Logged',
                                      text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                      html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                  };
                                  // Function to send e-mail to myself
                                  client.sendMail(email, function(err, info) {
                                      if (err) {
                                          console.log(err); // If error with sending e-mail, log to console/terminal
                                      } else {
                                          console.log(info); // Log success message to console if sent
                                          console.log(user.email); // Display e-mail that it was sent to
                                      }
                                  });
                                  res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                              } else {
                                  // Check if vehicle is in database
                                  if (!vehicle) {
                                      res.json({ success: false, message: 'No details found' }); // Return error
                                  } else {
                                      vehicle.vehicle_model = newVehicleModel; // Assign new Model to report in database
                                      // Save changes
                                      vehicle.save(function(err) {
                                          if (err) {
                                              console.log(err); // Log any errors to the console
                                          } else {
                                              res.json({ success: true, message: 'Vehicle model has been updated' });
                                          }
                                      });
                                  }
                              }
                          });
                      } else {
                          res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                      }
                  }
              }
            }
        });
    });

    return router; // Return the router object to server
};
