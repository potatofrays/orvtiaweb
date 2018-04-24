var express = require('express'); // ExperssJS Framework
var app = express(); // Invoke express to variable for use in application
var port = process.env.PORT || 8080; // Set default port or assign a port in enviornment
var morgan = require('morgan'); // Import Morgan Package
var mongoose = require('mongoose'); // HTTP request logger middleware for Node.js
var bodyParser = require('body-parser'); // Node.js body parsing middleware. Parses incoming request bodies in a middleware before your handlers, available under req.body.
var router = express.Router(); // Invoke the Express Router
var connection = require('./connection');
var appRoutes = require('./app/routes/api')(router); // Import the application end points/API
var police =  require('./app/android/policeApi')(express.Router());
var citizen =  require('./app/android/citizenApi')(express.Router());
var path = require('path'); // Import path module
var methodOverride  = require('method-override');

mongoose.connect(connection.connectionString);
app.use(morgan('dev')); // Morgan Middleware
app.use(bodyParser.json()); // Body-parser middleware
app.use('/bower_components', express.static(__dirname + '/bower_components')); // Use BowerComponents
app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(express.static(__dirname + '/public')); // Allow front end to access public folder
app.use('/api', appRoutes); // Assign name to end points (e.g., '/api/management/', '/api/users' ,etc. )
app.use(bodyParser.text());                                     // allows bodyParser to look at raw text
app.use(bodyParser.json({ type: 'application/vnd.api+json'}));  // parse application/vnd.api+json as json
app.use('/police', police);
app.use('/citizen', citizen);
// <---------- REPLACE WITH YOUR MONGOOSE CONFIGURATION ---------->

require('./app/routes/api2.js')(app);

// Set Application Static Layout
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/app/views/index.html')); // Set index.html as layout
});

// Start Server
app.listen(port, function() {
    console.log('Running the server on port ' + port); // Listen on configured port
});
mongoose.Promise = global.Promise;
