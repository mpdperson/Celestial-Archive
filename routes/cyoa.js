var express = require('express');
var router = express.Router();
var fs = require('fs');
var formidable = require('formidable');
var path = require('path');
var dirTree = require("directory-tree");

var docTypes = ['doc', 'htm', 'html', 'js', 'json', 'pdf', 'rtf', 'txt'];
var imgTypes = ['bmp', 'gif', 'jpeg', 'jpg', 'png', 'svg', 'swf', 'webm', 'webp'];
var error = {"status":"","stack":""};
var message = "";
var os = require("os");
var hostname = os.hostname();
var cpath = process.cwd();

var filteredTree = dirTree("C:\\Users\\Arthur\\Documents\\Fun Stuff", {
	attributes:['mode', 'mtime','size', 'type', 'extension'],
	exclude: /C:\\Users\\Arthur\\Documents\\Fun Stuff\\Games/,
	extensions: /\.(png|js|html|htm|pdf|jpg|gif|jpeg|svg|webp|doc|txt|rtf|bmp|webm|swf)$/
});

//var filteredTree2 = dirTree("C:\\Users\\Arthur\\Documents\\Wenestim\\staticNode\\public\\cyoa", {
var filteredTree2 = dirTree(cpath+"\\public\\cyoa", {
	attributes:['mode', 'mtime','size', 'type', 'extension'],
	extensions: /\.(png|js|html|htm|pdf|jpg|gif|jpeg|svg|webp|doc|txt|rtf|bmp|webm|swf)$/
});

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

// parse when receive a SAML Response from IdP
router.get('/', (req, res, next) => {
	var message = "Get CYOA";
	res.render('cyoa', {title:'Get CYOA',message:message,error:error});
});

router.post('/', (req, res, next) => {
	console.log("\nFilenames in directory:");
	var form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, files) {
		console.log("fields", JSON.stringify(fields, null, 2));
		console.log("files", JSON.stringify(files, null, 2));
		var newFields = [];
		
		/*
		if(!files.myFile.length) {
			var file = files.myFile;
			var result = findFile(file);
			if(result != "" && isNull(fields.dir)) {
				fields.dir = result;
			}
		}
		//*/
		
		if(!Object.keys(fields).length) {
			var message = "Get CYOA";
			error = {"status":"There was no files.", "stack":""};
			res.render('cyoa', {title:'Get CYOA', message:message, error:error});
		}
		else {
			var dir = fields.dir;
			var pathTo = path.relative(process.cwd(), dir);
			console.log("relative path", pathTo);
			let fileDir = fs.readdirSync(dir);
			var files = [];
			var fileNames = [];
			var fName = "";
			
			fileDir.forEach((file) => {
				fName = file.toString();
				fileNames.push(fName);
				files.push(pathTo + "\\" + fName);
			});
			
			files.sort(function(a, b) {
				var c = a.split("\\");
				var d = b.split("\\");
				c = c[c.length-1];
				d = d[d.length-1];
				c = parseInt(c);
				d = parseInt(d);
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
					if(a.toLowerCase() < b.toLowerCase()) {
						return -1;
					}
					if(a.toLowerCase() > b.toLowerCase()) {
						return 1;
					}
					return 0;
				}
			});
			
			var commonName = common_substring(fileNames);
			if(commonName == "") {
				commonName = dir.split("\\").pop();
			}
			console.log("commonName ",commonName);
			res.render('images', {title:commonName, message:commonName, error:error, files:files, fileNames:files});
		}
	});
});

function common_substring(data) {
	var i, ch, memo, idx = 0
	do {
		memo = null
		for(i=0; i < data.length; i++) {
			ch = data[i].charAt(idx)
			if(!ch) break
			if(!memo) memo = ch
			else if(ch != memo) break
		}
	}
	while (i == data.length && idx < data.length && ++idx)
	
	return (data[0] || '').slice(0, idx)
}

function findFile(file) {
	if(filteredTree.name == file.originalFilename) {
		return filteredTree.path;
	}
	else {
		var result = "";
		filteredTree.children.forEach(function(f) {
			result+=findFileDir(file,f);
		});
		return result;
	}
}

function findFileDir(file,arr) {
	if(arr.name == file.originalFilename) {
		return arr.path;
	}
	else {
		var result = "";
		filteredTree.children.forEach(function(f) {
			result+=findFileDir(file,f);
		});
		return result;
	}
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

module.exports = router;
