//var arguments = process.argv.splice(2);

//require the packages we need
var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	crypto = require('crypto'),
	ejs = require('ejs'),
	api = require('./routes/api');
	path = require('path');
	
var port = process.env.port || 8080; 
var test = require('./routes/test');
var routes = require('./routes/index');



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/page2', test.getOnPage);
app.get('/loadBalancer', test.getLoadBalancerPage);
app.get('/http', test.getHttpToHttpsPage);

//configure app to use bodyParser
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

//configure app for cross-origin requests
app.all('*', function(req, res, next){

	console.log("In app all");
	if (!req.get('Origin')) return next();
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
	if ('OPTIONS' == req.method) return res.sendStatus(200);
	next();
});


//Routes for our API
var router = express.Router();
 
 //middleware to use all requests
 //use this to do operations meant to be processed before request hits a route
router.use(function(req, res, next){
	console.log("Something is happening...");
	next();
});


//create a defult client 
router.route('/simpleproxy/client')
	
	.post(api.addDefaultClient)
	
//routes for simpleproxy POST and GET	
router.route('/simpleproxy')
	//post configuration parameters
	.post(api.addProxyConfiguration)

	//get configuration parameters
	.get(api.getProxyConfiguration)


//routes to PUT and DELETE simpleproxy configuration
router.route('/simpleproxy/:configid')

	//update configuration parameters
	.put(api.updateProxyConfiguration)

	//delete proxy configuration
	.delete(api.deleteProxyConfiguration);


//Register our routes
app.use('/api', router); //all our routes will bw prefixed with /api
app.use('/', routes);
//app.use('/page2');

app.listen(port);
console.log("Node http-proxy api server running on port " + port);
