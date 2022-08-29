var http = require('http');
var https = require('https');
var cookieSession = require('cookie-session');
var dirTree = require("directory-tree");
var express = require('express');
var fs = require('fs');
var formidable = require('formidable');
var mime = require('mime-types');
var path = require('path');
var router = express.Router();
var utf8 = require('utf8');
var resolve = require('path').resolve;
var pdf = require('pdf-parse');
var spelling = require('spelling');
var { PdfReader } = require("pdfreader");
var commons = require('../public/dictionaries/commons.json');
var dictionary = require('../public/dictionaries/new_dict.js');
var dict = new spelling(dictionary);
var wordList = require('../public/dictionaries/wordList.json');
var ending = require('../public/dictionaries/ending.json');
var XRegExp = require('xregexp');

var word_list = wordList;

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

var error = "";

router.get('/', function(req, res, next){	
	//res.render('root', {});
	res.redirect("/forge");
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

module.exports = router;
