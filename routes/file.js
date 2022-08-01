var http = require('http');
var https = require('https');
var cookieSession = require('cookie-session');
var express = require('express');
var fs = require('fs');
var formidable = require('formidable');
var mime = require('mime-types');
var path = require('path');
var router = express.Router();
var utf8 = require('utf8');
var resolve = require('path').resolve;
var XRegExp = require('xregexp');

router.get('/static/*', function(req, res, next) {
	console.log(req.url);
	res.redirect(req.url);
});

router.get('/css/*', function(req, res, next) {
	console.log(req.url);
	res.redirect(req.url);
});

router.get('/img/*', function(req, res, next) {
	console.log(req.url);
	res.redirect(req.url);
});

router.get('/js/*', function(req, res, next) {
	console.log(req.url);
	res.redirect(req.url);
});

router.get('/json/*', function(req, res, next) {
	console.log(req.url);
	res.redirect(req.url);
});

router.post('/', (req, res, next) => {
	var jsonObj = req.body;
	console.log("jsonObj",JSON.stringify(jsonObj,null,2));
	var name = jsonObj.name;
	var data = jsonObj.jsonObj;
	//writeToFile(data,name);
	res.json({ username: 'Flavio' });
});

router.post('/save', (req, res, next) => {
	var jsonObj = req.body;
	console.log("jsonObj",JSON.stringify(jsonObj,null,2));
	var name = jsonObj.name;
	var data = jsonObj.jsonObj;
	//writeToFile(data,name);
	res.json({ username: 'Flavio' });
});

function isNull(meh) {
	if(meh == null || meh == undefined) {
		return true;
	}
	if(typeof meh == "string") {
		if(meh=="") return true;
	}
	if(typeof meh == "number") {
		if(isNaN(meh)) return true;
	}
	if(meh.constructor == [].constructor) {
		if(meh.length == 0) return true;
	}
	if(meh.constructor == {}.constructor) {
		var keys = Object.keys(meh);
		if(keys.length==0) return true;
	}
	return false;
}

function writeToFile(data,name) {
	console.log("writeToFile5",name);
	var variable = name.split(".")[0];
	name = './Forge/js/'+name;
	
	var str = "var "+variable+" = ";
	if(typeof(data) != 'string') {
		data = JSON.stringify(data,null,2);
	}
	fs.writeFile(name, str+data+";", (err) => {
		if (err) {
			throw err;
		}
		console.log("JSON data is saved.");
	});
}


module.exports = router;
