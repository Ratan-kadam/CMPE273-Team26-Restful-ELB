/**
 * New node file
 */
var ejs = require("ejs");

function getOnPage(req, res) {
	res.render('NewFile',{});
}

exports.getOnPage = getOnPage;

function getLoadBalancerPage(req, res) {
	res.render('LoadBalancer',{});
}

exports.getLoadBalancerPage = getLoadBalancerPage;
