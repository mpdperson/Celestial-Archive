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
	message = "Dictionary Edit";
	var searchList = [];
	res.render('dictionary', {
		title:message,
		message:message,
		searchList:searchList,
		error:error
	});
});

router.post('/', (req, res, next) => {
	var jsonObj = req.body;
	var words = jsonObj.ADD_WORDS.trim();
	var toAdd = words.split(" ");
	for(var i=0; i<toAdd.length; i++) {
		addWords(toAdd[i]);
	}
	updateWordList();
	message = "Dictionary Updated";
	var searchList = [];
	res.render('dictionary', {
		title:message,
		message:message,
		searchList:searchList,
		error:error
	});
});

router.get('/search', function(req, res, next){	
	message = "Dictionary Search";
	var searchList = [];
	res.render('search', {
		title:message,
		message:message,
		searchList:searchList,
		error:error
	});
});

router.post('/search', (req, res, next) => {
	var jsonObj = req.body;
	var words = jsonObj.ADD_WORDS.trim();
	var toAdd = words.split(" ");
	var searchList = [];
	for(var i=0; i<toAdd.length; i++) {
		var tmp = {"Word":toAdd[i],"Found":word_list.includes(toAdd[i])};
		searchList.push(tmp);
	}
	message = "Dictionary Searched";
	res.render('search', {
		title:message,
		message:message,
		searchList:searchList,
		error:error
	});
});

router.get('/edit', function(req, res, next){	
	message = "File Edit";
	var searchList = [];
	var pathTo = "";
	var rpath = "";
	var TEXTS = "";
	res.render('edit', {
		title:message,
		message:message,
		rpath:rpath,
		path:pathTo,
		ftexts: TEXTS,
		error:error
	});
});

router.post('/edit', function(req, res, next){	
	message = "File Loaded";
	var searchList = [];
	var dir = req.body.path;
	console.log("req.body",JSON.stringify(req.body,null,2));
	var pathTo = "";
	var rpath = "";
	var type = "";
	var name = "";
	var TEXTS = req.body.TEXTS.trim();
	
	if(!isNull(dir)) {
		name = dir.split("/").pop();
		var fpath = dir.replace(name,"");
		if(isNull(name)) {
			name = dir.split("\\").pop();
		}
		type = mime.lookup(name);
		pathTo = path.relative(process.cwd(), dir);
		rpath = path.relative(process.cwd(), fpath);
		rpath = rpath.replace(/ /g,"%20");
		rpath = rpath.replace(/\\/g, "/");
		if(isNull(TEXTS)) {
			if(type.includes("pdf")) {
				var file = {"filepath":dir,"originalFilename":name};
				TEXTS = pdfToTxt(file);
				rpath = "";
				pathTo = "";
			}
		}
		else {
			writeToFile(TEXTS,dir);
		}
	}
	
	res.render('edit', {
		title:message,
		message:message,
		rpath:rpath,
		path:pathTo,
		ftexts: TEXTS,
		error:error
	});
});

let options = {
	pagerender: render_page
};

// default render callback
function render_page(pageData) {
	//check documents https://mozilla.github.io/pdf.js/
	let render_options = {
		//replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
		normalizeWhitespace: true,
		//do not attempt to combine same line TextItem's. The default value is `false`.
		disableCombineTextItems: false
	}
	
	return pageData.getTextContent(render_options).then(function(textContent) {
		let lastY, text = '';
		for(let item of textContent.items) {
			if(lastY == item.transform[5] || !lastY){
				text += item.str.replace(/​/g,"")
				.replace(/–/g,"-").replace(/"([^"\n]+)"/g,"“$1”")
				.replace(//g,"●").replace(/…./g,"…");
			}	
			else{
				text +='\n' + item.str.replace(/​/g,"")
				.replace(/–/g,"-").replace(/"([^"\n]+)"/g,"“$1”")
				.replace(//g,"●").replace(/…\./g,"…");
			}
			lastY = item.transform[5];
		}
		return text;
	});
}

function pdfToTxt(file) {
	console.log("readFileTxt");
	var oldPath = file.filepath;
	var fileName = file.originalFilename.split(".")[0];
	
	var dataBuffer = fs.readFileSync(oldPath);
	pdf(dataBuffer,options).then(function(data) {
		return data.text;
	});
}

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

function addWords(txt) {
	txt = txt.replace(/[^A-Za-z\-’']/g,"");
	txt = txt.trim();
	if(txt=="") return;
	
	word_list.push(txt);
	word_list.push(txt.toLowerCase());
}

function updateWordList() {
	word_list = [...new Set(word_list)];
	word_list = word_list.sort();
	word_list = word_list.reverse();
	word_list = word_list.sort(function(a, b) {
		if(a.length < b.length) {
			return -1;
		}
		if(a.length > b.length) {
			return 1;
		}
		return 0;
	});
	
	writeToFile5(word_list, "wordList.js");
	writeToFile6(word_list, "wordList.json");
}

function writeToFile(data,path) {
	console.log("writeToFile",path);
	
	if(typeof(data) != 'string') {
		data = JSON.stringify(data,null,2);
	}
	fs.writeFile(path, data, (err) => {
		if(err) {
			throw err;
		}
		console.log("File Saved.");
	});
}

function writeToFile5(data,name) {
	console.log("writeToFile5",name);
	var variable = name.split(".")[0];
	name = './Forge/js/'+name;
	
	var str = "var "+variable+" = ";
	if(typeof(data) != 'string') {
		data = JSON.stringify(data,null,2);
	}
	fs.writeFile(name, str+data+";", (err) => {
		if(err) {
			throw err;
		}
		console.log("JSON data is saved.");
	});
}

function writeToFile6(data,name) {
	console.log("writeToFile6",name);
	name = './public/dictionaries/'+name;
	var str = "";
	if(typeof(data) != 'string') {
		data = JSON.stringify(data,null,2);
	}
	fs.writeFile(name, str+data+"", (err) => {
		if(err) {
			throw err;
		}
		console.log("JSON data is saved.");
	});
}

module.exports = router;
