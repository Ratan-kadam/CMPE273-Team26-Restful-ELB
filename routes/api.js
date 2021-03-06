
//connect to database
var mongoose = require("mongoose");
mongoose.connect("mongodb://cmpe273team26:cmpe273team26@ds047800.mongolab.com:47800/proxydb");

//require the colletions
var ProxyConfig = require("../models/ProxyConfigModel");
var RoutingInfo = require("../models/RoutingInfo");


//add default client 
exports.addDefaultClient = function(req, res){

	var proxydb = new ProxyConfig;
	proxydb.ClientId = req.body.clientid;

	proxydb.save(function(err){
		if(err) 
			res.send(err);

		res.json({ message : "Default client added"});	
		console.log(proxydb);

	})
}


//Simpleprxy POST function
//adds simpleproxy configuration data to database
exports.addProxyConfiguration = function(req, res){
		
		ProxyConfig.findOne({"ClientId" : "1"}, function(err, proxydb){
			if(err)
				res.send(err);

			var count = 0;		
			
			if(proxydb.Simpleproxy != undefined)
			{
				proxydb.Simpleproxy.forEach(function(item){
					count++;
				})
			}

			proxydb.Simpleproxy.push({configid: count, targeturl: req.body.targeturl, proxyurl : '', latency: req.body.latency, https: req.body.https});

			proxydb.save(function(err, data){
				if(err) 
					res.send(err);
			  	res.send( (err === null) ? { msg: '' } : { msg: err });
			});				

			//add info to roouting table as well
			insertSimpleproxyRoutingInfo(count, req.body.targeturl, req.body.latency, req.body.https);
			
		});
}//addProxyConfiguration


//Simpleproxy GET
//retrieve all proxy configurations for simpleproxy
exports.getProxyConfiguration = function(req, res){

		/*retreive configuration from ProxyConfig collection
		ProxyConfig.findOne({'ClientId' : '1'}, function(err, dbObj){
			if(err)
				res.send(err);
			
			console.log("in GET");
			res.json(dbObj);
		});*/


		//retrieve configuration from routing table
		RoutingInfo.find({}, function(err, docs){
			if(err)
				throw err;
			console.log(docs);
			res.json(docs);
		});
}


//Simpleproxy UPDATE
//update simpleproxy configuration
exports.updateProxyConfiguration = function(req, res){

	var query = {"ClientId" : "1"};

	console.log("configid " + req.params.configid);

	var update = { $pull : { Simpleproxy : {configid: req.params.configid}}};

	ProxyConfig.findOneAndUpdate(query, update, function(err, data){

	var proxyurl = req.body.proxyurl;

	console.log("targeturl : " +req.body.targeturl);

	var query = {"ClientId" : "1"};

	var update = { $push : { Simpleproxy : { configid: req.params.configid, targeturl : req.body.targeturl, proxyurl: req.body.proxyurl, latency : req.body.latency, https : req.body.https, status: false }}};

		ProxyConfig.findOneAndUpdate(query, update, function(err, data){

				res.send( (err === null) ? { msg: '' } : { msg: err });

		})
	})

	//update routing table as well
	updateSimpleproxyRoutingInfo(req.params.configid,  req.body.targeturl, req.body.latency, req.body.https);

}//updateProxyConfiguration


exports.deleteProxyConfiguration = function(req, res){

	var query = {"ClientId" : "1"};
	
	var update = { $pull : { Simpleproxy : {configid: req.params.configid}}};

	ProxyConfig.findOneAndUpdate(query, update, function(err, data){

			res.send( (err === null) ? { msg: '' } : { msg: err });
	})

	//
	deleteSimpleproxyRoutingInfo(req.params.configid);

}//deleteProxyConfiguration


//delete proxy configuration from Routing table
function deleteSimpleproxyRoutingInfo(configid){

	RoutingInfo.remove({'configid' : configid}, function(err, data){
		if(err)
			throw err;

		console.log((err === null) ? { msg: 'Deleted' + data } : { msg: err });	
	})
}

//add configration to routing table on POST
function insertSimpleproxyRoutingInfo(count, targeturl, latency, https)
{
	var routingdb = new RoutingInfo;
	routingdb.configid = count;
	routingdb.targeturl = targeturl;
	routingdb.latency = latency;
	routingdb.https = https;
	routingdb.status = false;

	routingdb.save(function(err){

		if(err)
			throw err;

		console.log("routing info added : " + routingdb);
	});
}

//update configuration in routing table
function updateSimpleproxyRoutingInfo(configid, targeturl, latency, https){

	var query  = { "configid" : configid };

	var update = { $set : { "targeturl" : targeturl, "latency" : latency, "https" : https } };

	RoutingInfo.update(query, update, function(err, num){
		if(err)
			throw err;
		console.log( (err === null) ? { msg: 'configuration updated' } : { msg: err });

	});
}


/*
exports.addLoadBalancerConfiguration = function(req, res){

	ProxyConfig.findOne({"ClientId": "1"}, function(err, proxydb){
			if(err)
				res.send(err);
	
			var count = 0;		
			
			if(proxydb.Loadbalance != undefined)
			{
				proxydb.Loadbalance.forEach(function(item){
					count++;
				})
			}	
	
				var targets = req.body.targets;
				console.log(targets);

				proxydb.Loadbalance.push({configid: "L-"+id  ,targeturl: targets, proxyurl : '', latency: req.body.latency});

				proxydb.save(function(err, data){
					if(err) 
					res.send(err);
			 	 	res.send( (err === null) ? { msg: '' } : { msg: err });
				});
		});
}
*/