var express = require('express');
var router = express.Router();
var fs = require('fs');
var formidable = require('formidable');
var path = require('path');
var dirTree = require("directory-tree");
var mime = require('mime-types');
var cookieSession = require('cookie-session');
var os = require("os");
var hostname = os.hostname();
var cpath = process.cwd();

var mountDir = "/";

var filteredTree = dirTree("C:\\Users\\Arthur\\Documents\\Fun Stuff", {
	attributes:['mode', 'mtime','size', 'type', 'extension'],
	exclude: /C:\\Users\\Arthur\\Documents\\Fun Stuff\\Games/,
	extensions: /\.(png|js|html|htm|pdf|jpg|gif|jpeg|svg|webp|doc|txt|rtf|bmp|webm|swf)$/
});

//var filteredTree2 = dirTree("C:\\Users\\Arthur\\Documents\\Wenestim\\staticNode\\public", {
var filteredTree2 = dirTree(cpath+"\\public", {
	attributes:['mode', 'mtime','size', 'type', 'extension'],
	extensions: /\.(png|js|html|htm|pdf|jpg|gif|jpeg|svg|webp|doc|txt|rtf|bmp|webm|swf)$/
});

//filteredTree = JSON.parse(JSON.stringify(filteredTree));
//filteredTree = addAttribute(filteredTree);
//filteredTree["collapsed"] = false;
//filteredTree = sortTree(filteredTree);
//writeToFile(filteredTree,"menu.json");

filteredTree2 = JSON.parse(JSON.stringify(filteredTree2));
filteredTree2 = addAttribute(filteredTree2);
filteredTree2["collapsed"] = false;
filteredTree2 = sortTree(filteredTree2);
writeToFile(filteredTree2,"menu2.json");

var error = {"status":"","stack":""};
var message = "";

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

router.get('/', function(req, res, next) {
	req.session["rpath"] = "/";
	var path = "";
	var type = "none";
	var tree = JSON.stringify(filteredTree);
	var tree2 = JSON.stringify(filteredTree2);
	message = "Explore Files";
	res.render('explore', {
		title:message,
		message:message,
		error:error,
		tree:tree,
		tree2:tree2,
		path:path,
		type:type
	});
});

router.post('/', function(req, res, next) {
	var dir = req.body.path;
	var name = req.body.name;
	var type = mime.lookup(req.body.name);
	//path
	var pathTo = path.relative(process.cwd(), dir);
	var rpath = path.relative(process.cwd(), req.body.fpath);
	rpath = rpath.replace(/ /g,"%20");
	rpath = rpath.replace(/\\/g, "/")
	
	if(rpath.startsWith("../../Fun%20Stuff")) {
		rpath = rpath.replace(/\.\.\/\.\./g, "")
	}
	
	req.session["rpath"] = rpath;
	console.log("rpath",rpath);
	
	var tree = JSON.stringify(filteredTree);
	var tree2 = JSON.stringify(filteredTree2);
	message = "Explore File";
	res.render('viewFile', {
		title:message,
		message:message,
		error:error,
		tree:tree,
		tree2:tree2,
		rpath:rpath,
		path:pathTo,
		type:type
	});
});

function common_substring(data) {
	var i, ch, memo, idx = 0
	do {
		memo = null
		for (i=0; i < data.length; i++) {
			ch = data[i].charAt(idx)
			if (!ch) break
			if (!memo) memo = ch
			else if (ch != memo) break
		}
	}
	while (i == data.length && idx < data.length && ++idx)
	
	return (data[0] || '').slice(0, idx)
}

function addAttribute(jsonObj) {
	jsonObj["collapsed"]=true;
	var childs = jsonObj.children;
	if(childs == undefined) {
		jsonObj["childs"] = 0;
		return jsonObj;
	}
	jsonObj["childs"] = childs.length;
	for(var i=0; i<childs.length; i++) {
		childs[i] = addAttribute(childs[i]);
		if(childs[i]["childs"] > jsonObj["childs"]) {
			jsonObj["childs"] = childs[i]["childs"];
		}
	}
	return jsonObj;
}

function writeToFile(data,name) {
	console.log("writeToFile",name);
	name = './public/json/'+name;
	var str = name.split('/');
	str = str[str.length-1];
	str = str.split('.');
	str = str[0];
	if(typeof(data) != 'string') data = JSON.stringify(data,null,2);
	fs.writeFile(name, str+" = "+data, (err) => {
		if (err) {
			throw err;
		}
		console.log("JSON data is saved.");
	});
}

function getDir() {
	return mountDir;
}

function sortTree(data) {
	data.children = data.children.sort(function(a, b) {
		var c = parseInt(a.name);
		var d = parseInt(b.name);
		if(c != NaN && d != NaN) {
			if(c < d) {
				return -1;
			}
			if(c > d) {
				return 1;
			}
			return 0;
		}
		else {
			if (a.name.toLowerCase() < b.name.toLowerCase()) {
				return -1;
			}
			if (a.name.toLowerCase() > b.name.toLowerCase()) {
				return 1;
			}
			return 0;
		}
	});
	if(data.children) {
		data.children.forEach(function(d) {
			d = sortChild(d);
		});
	}
	return data;
}

function sortChild(data) {
	if(data.children) {
		data.children = data.children.sort(function(a, b) {
			var c = parseInt(a.name);
			var d = parseInt(b.name);
			if(c != NaN && d != NaN) {
				if(c < d) {
					return -1;
				}
				if(c > d) {
					return 1;
				}
				return 0;
			}
			else {
				if (a.name.toLowerCase() < b.name.toLowerCase()) {
					return -1;
				}
				if (a.name.toLowerCase() > b.name.toLowerCase()) {
					return 1;
				}
				return 0;
			}
		});
	}
	if(data.children) {
		data.children.forEach(function(d) {
			d = sortChild(d);
		});
	}
	return data;
}

module.exports = router;
