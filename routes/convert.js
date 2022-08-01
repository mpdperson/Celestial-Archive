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

const {GoogleAuth} = require('google-auth-library');
const {google} = require('googleapis');

const TOKEN_PATH = 'token.json';
const API_KEY = fs.readFileSync("API_KEY.txt").toString('UTF8');
const scopes = [
  'https://www.googleapis.com/auth/drive'
];

var word_list = wordList;
/*
	for(var i=0; i<wordList.length; i++) {
	word_list.push(wordList[i]);
	}
//*/

var docTypes = ['doc', 'htm', 'html', 'js', 'json', 'pdf', 'rtf', 'txt'];
var imgTypes = ['bmp', 'gif', 'jpeg', 'jpg', 'png', 'svg', 'swf', 'webm', 'webp'];
var error = {"status":"","stack":""};
var message = "";
var stat = "";
var seeConsole = false;
var count = 0;
var doc = "";
var files = [];

//“”
//‘’
var notSpecial = new RegExp(/([^\(\[\]\)\{\}\<\>\n\r\:]+)/);

var prereqReg = new RegExp(/^\[?Requires:? ([^\n\]]+)\]/);
var freereqReg = new RegExp(/^\[?Free:? ([^\n\]]+)\]/);
var discountreqReg = new RegExp(/^\[?Discounte?d?:? ([^\n\]]+)\]/);

var title1 = new RegExp(/^([^\n\r]+)\[([^\n\r]+)(CP|MP)([^\n\r]*)/g);
var title2 = new RegExp(/^([^\n\r]+)\(([^\n\r]+)(CP|MP)([^\n\r]*)/g);
var title3 = new RegExp(/^([^\n\r]+): \(?\[?(Free|free)([^\n]*)/);
var title4 = new RegExp(/^([^\n\r]+): \(?\[?([0-9]+)([ ])?(CP|MP)([^\n]*)/);
var title5 = new RegExp(/^: \(?\[?([0-9]+) (CP|MP)([^\n]*)/);
var title6 = new RegExp(/^([^\n\r]+)\[([0-9]+)(CP|MP)?([^\n\r]*)/g);
var title7 = new RegExp(/^([^\n\r]+)\[Free\/([0-9]+)([^\n\r]*)/g);
var title8 = new RegExp(/^([^\n\r]+)\[Free,([0-9]+)([^\n\r]*)/g);
var title9 = new RegExp(/^([^\n\r]+)\[([0-9]+)(CP|MP)?\/([^\n\r]*)/g);
var title0 = new RegExp(/^([^\n\r]+)\[([0-9]+)(CP|MP)?,([^\n\r]*)/g);
var title11 = new RegExp(/^([^\n\r]+)\(([0-9]+)([ ])?(CP|MP)\)([^\n\r]*)/g);
var title12 = new RegExp(/^([^\n\r]+)\((Free|Free All)([^\n\r\)]*)\)([^\n\r]*)/g);
var title13 = new RegExp(/^([^\n\r]+)\(([0-9]+)([ ])?(CP|MP)([^\n\r]*)/g);
var title14 = new RegExp(/^([^\n\r]+)\(([0-9\+\-\/\\]+)([ ])?(CP|MP)([^\n\r]*)/g);
var title15 = new RegExp(/^([^\n\r]+)\((Discounted for|Free for)([^\n\r\)]*)\)([^\n\r]*)/g);
var title16 = new RegExp(/^([^\n\r]+)\[([0-9\+\-\/\\]+)([ ])?(CP|MP)([^\n\r]*)/g);
var title17 = new RegExp(/^([^\n\r]+)\[(Free\Discounted)([^\n\r]*)/g);

var section1 = new RegExp(/^Age and Gender:?/);
var section2 = new RegExp(/^Time and Place:?/);
var section3 = new RegExp(/^Locations:?/);
var section4 = new RegExp(/^Origins:?/);
var section5 = new RegExp(/^Species:?/);
var section6 = new RegExp(/^Races:?/);
var section7 = new RegExp(/^General:?/);
var section8 = new RegExp(/^Drop-in:?/);
var section9 = new RegExp(/^Endings?:?/);
var section10 = new RegExp(/^Notes:?/);
var section11 = new RegExp(/^Genders:?/);
var section12 = new RegExp(/^Age:?/);
var section13 = new RegExp(/^Drawbacks:?/);
var section14 = new RegExp(/^Identity:?/);
var section15 = new RegExp(/^Drawbacks and Objectives:?/);
var section16 = new RegExp(/^Objectives:?/);
var section17 = new RegExp(/^Changes:?/);

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

router.get('/', function(req, res, next){	
	message = "Convert Files";
	res.render('convert', {
		title:message,
		message:message,
		error:error,
		stat:stat
	});
});

var fileID = "";
router.post('/', (req, res, next) => {
	console.log("\nFilenames in directory:");
	var form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, files) {
		console.log("fields", JSON.stringify(fields, null, 2));
		console.log("files", JSON.stringify(files, null, 2));
		var title = "File Uploaded";
		
		if (!files.myFile.length) {
			var file = files.myFile;
			uploadFile(file);
		}
		else {
			files.myFile.forEach(function(d) {
				uploadFile(d);
			});
		}
		
		var curdir = path.join(__dirname, '../public/upload');
		
		if(fields.url != "") {
			console.log("Attempt to download a file");
			var url = fields.url;
			var fullUrl = fields.url;
			var ext = url.split(".").pop();
			if(ext.startsWith("com")) {
				ext = ".html";
			}
			else {
				ext = "." + ext;
			}
			var downfile = fs.createWriteStream(curdir + "/" + "download" + ext);
			
			if(fullUrl.includes("drive.google.com") || fullUrl.includes("docs.google.com")) {
				console.log("get drive.google.com");
				fileID = getFileId(url);
				console.log("fileID",fileID);
				if(!isNull(fileID)) {
					fs.readFile('credentials.json', (err, content) => {
						if (err) {
							console.log('Error loading client secret file:', err);
						}
						else {
							authorize(JSON.parse(content), getDoc);
						}
					});
				}
			}
			else if(url.startsWith("https")) {
				console.log("get https");
				if(url.startsWith("https://drive.google.com/file/d/") && google_api) {
					url = url.replace("https://drive.google.com/file/d/","");
					url = url.split("/").shift();
					console.log("new url: ",url);
					url = "https://www.googleapis.com/drive/v3/files/" + url + "?alt=media";
				}
				
				var request = https.get(url, function(response) {
					response.pipe(downfile);
					
					// after download completed close filestream
					downfile.on("finish", () => {
						downfile.close();
						console.log("Download Completed");
						//uploadFile
					});
				});
			}
			else {
				console.log("get http");
				var request = http.get(url, function(response) {
					response.pipe(downfile);
					
					// after download completed close filestream
					downfile.on("finish", () => {
						downfile.close();
						console.log("Download Completed");
						//uploadFile
					});
				});
			}
		}
		
		if(!isNull(fields.dir)) {
			doDrive(fields.dir);
		}
		
		res.render('index', {title:title, message:message, error:error, stat:stat, lastPage: "convert"});
	});
});

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function createApiDown(str) {
	//https://www.googleapis.com/drive/v3/files/[FILEID]/export?key=[YOUR_API_KEY]
	//mimeType=application%2Fpdf&
	var fileID = getFileId(str);
	var result = "https://www.googleapis.com/drive/v3/files/"+fileID+"/export?mimeType=application%2Fpdf&key="+API_KEY;
	return result;
}

var isAuth = true;
function getDoc(auth) {
	console.log("getDoc called");
	if(fileID!="") {
		var curdir = path.join(__dirname, '../public/upload');
		//exportPdf(fileID,auth).then((googleDoc) => {
		downloadFile(fileID,auth).then((googleDoc) => {
			console.log("googleDoc",googleDoc);
			if(!isNull(googleDoc)) {
				/*/
				var downfile = fs.createWriteStream(curdir + "/" + fileID + ".pdf");//googleDoc.name
				googleDoc.response.pipe(downfile);
				
				downfile.on("finish", () => {
					downfile.close();
					console.log("Download Completed");
					//uploadFile
				});
				//*/
			}
		});
	}
	else {
		return;
	}
}

async function doDrive(dir) {
	count = 0;
	if(isNull(dir)) {
		dir = resolve("../staticNode/public/process")
		pathTo = "../staticNode/public/process";
	}
	
	var pathTo = path.relative(process.cwd(), dir);
	var fileDir = fs.readdirSync(dir);
	files = [];
	
	fileDir.forEach((file) => {
		var temp = {
			"originalFilename":file.toString(),
			"oldPath": pathTo + "\\" + file.toString(),
			"filepath": pathTo + "\\" + file.toString(),
		};
		console.log("file",temp);
		files.push(temp);
	});
	
	for(var i=0; i<files.length; i++) {
		var sleeptime = (i+1)*2000;
		sleep(sleeptime).then(() => {
			sleepFile();
		});
	}
}

function createFileForParse(obj) {
	
}

function sleepFile() {
	console.log("sleepFile "+count);
	uploadFile(files[count]);
	count++;
}

async function uploadFile(file) {
	var isValid = isFileValid(file);
	var fileName = encodeURIComponent(file.originalFilename.replace(/\s/g, "_"));//
	
	if(isValid) {
		var oldPath = file.filepath;
		var extension = file.originalFilename.split(".").pop();
		var newPath = path.join(__dirname, '../public/converted')+ '/'+fileName;
		var rawData = fs.readFileSync(oldPath)
		
		switch(extension) {
			case "pdf":
			pdfToTxt(file);
			break;
			case "txt":
			readFileTxt(file);
			break;
			default:
			fs.writeFile(newPath, rawData, function(err){
				if(err) {
					console.log(err);
					stat = "Fail";
					message = "Failed upload";
				}
				else {
					console.log("Success");
					stat = "Success";
					message = "Successfully uploaded";
				}
			});
			break;
		}
	}
}

function readFileTxt(file) {
	console.log("readFileTxt");
	var oldPath = file.filepath;
	var fileName = file.originalFilename.split(".")[0];
	var nameAdd = fileName.replace(/_/g, " ");
	nameAdd = nameAdd.replace(/ ([ ]+)/g," ");
	
	addWords(nameAdd);
	addWords(fileName);
	
	fs.readFile(oldPath, 'utf8', function(err, data) {
		if (err) {
			console.log(err);
		}
		doc = data;
		data = data.replace(/​/g,"")
		.replace(/–/g,"-").replace(/"([^"\n]+)"/g,"“$1”")
		.replace(//g,"●").replace(/…./g,"…")
		.replace(/‘([^‘’\n]+)’/g,"“$1”");
		writeToFile(data,"original.txt");
		console.log("Finished Writing readFileTxt");
		var txt = data;
		txt = parseTxt(data,fileName);
		writeToFile(txt,fileName+".txt");
	});
}

function isFileValid(file) {
	var type = file.originalFilename.split(".").pop();
	if (docTypes.indexOf(type) === -1) {
		return false;
	}
	return true;
}

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
		for (let item of textContent.items) {
			if (lastY == item.transform[5] || !lastY){
				text += item.str.replace(/​/g,"")
				.replace(/–/g,"-").replace(/"([^"\n]+)"/g,"“$1”")
				.replace(//g,"●").replace(/…./g,"…")
				.replace(/‘([^‘’\n]+)’/g,"“$1”");
			}	
			else{
				text +='\n' + item.str.replace(/​/g,"")
				.replace(/–/g,"-").replace(/"([^"\n]+)"/g,"“$1”")
				.replace(//g,"●").replace(/…./g,"…")
				.replace(/‘([^‘’\n]+)’/g,"“$1”");
			}
			lastY = item.transform[5];
		}
		return text;
	});
}

let options = {
	pagerender: render_page
};

function pdfToTxt(file) {
	console.log("readFileTxt");
	var oldPath = file.filepath;
	var fileName = file.originalFilename.split(".")[0];
	var nameAdd = fileName.replace(/_/g, " ");
	nameAdd = nameAdd.replace(/ ([ ]+)/g," ");
	
	addWords(nameAdd);
	addWords(fileName);
	
	/*
		new PdfReader().parseFileItems(oldPath, (err, item) => {
		if (err) console.error("error:", err);
		else if (!item) console.warn("end of file");
		else if (item.text) console.log(item.text);
		doc = item.text;
		writeToFile(item.text,"original.txt");
		console.log("Finished Writing pdfToTxt");
		var txt = parseTxt(item.text,fileName);
		writeToFile(txt,fileName+".txt");
		});
	//*/
	
	//*
	var dataBuffer = fs.readFileSync(oldPath);
	pdf(dataBuffer,options).then(function(data) {
		// number of pages
		//console.log(data.numpages);
		// number of rendered pages
		//console.log(data.numrender);
		// PDF info
		//console.log(data.info);
		// PDF metadata
		//console.log(data.metadata);
		// PDF.js version
		// check https://mozilla.github.io/pdf.js/getting_started/
		//console.log(data.version);
		// PDF text
		//console.log(data.text);
		doc = data.text;
		writeToFile(data.text,"original.txt");
		console.log("Finished Writing pdfToTxt");
		var txt = parseTxt(data.text,fileName);
		writeToFile(txt,fileName+".txt");
	});
	//*/
}

function writeToFile2(data,name) {
	console.log("writeToFile2",name);
	name = './public/dictionaries/'+name;
	var str = "module.exports = ";
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

function writeToFile6(data,name) {
	console.log("writeToFile6",name);
	name = './public/dictionaries/'+name;
	var str = "";
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

function writeToFile4(data,name) {
	console.log("writeToFile4",name);
	name = './public/dictionaries/'+name;
	var str = "";
	if(typeof(data) != 'string') {
		data = JSON.stringify(data,null,2);
	}
	fs.writeFile(name, data, (err) => {
		if (err) {
			throw err;
		}
		console.log("JSON data is saved.");
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
		if (err) {
			throw err;
		}
		console.log("JSON data is saved.");
	});
}

/*
	function writeToFile3(data,name) {
	console.log("writeToFile3",name);
	var variable = name.split(".")[0];
	name = '../../Fun Stuff/CYOA/Rollers/Celestial Forge/js/'+name;
	
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
//*/

function writeToFile(data,name) {
	console.log("writeToFile",name);
	name = './public/converted/'+name;
	var str = name.split('/');
	str = str[str.length-1];
	str = str.split('.');
	str = str[0];
	
	var spacer = "";
	for(var i=0; i<str.length; i++) {
		spacer+="=";
	}
	spacer+="======\n";
	
	if(typeof(data) != 'string') {
		data = JSON.stringify(data,null,2);
	}
	fs.writeFile(name, spacer+"==="+str+"===\n"+spacer+data, (err) => {
		if (err) {
			throw err;
		}
		console.log("JSON data is saved.");
	});
}

function addWord(txt) {
	word_list.push(txt);
}

function sortWordList() {
	word_list.sort();
	word_list.reverse();
	word_list.sort(function(a, b) {
		if (a.length < b.length) {
			return -1;
		}
		if (a.length > b.length) {
			return 1;
		}
		return 0;
	});
}

function wordListCap() {
	var words = [];
	var words2 = [];
	
	for(var i=0; i<word_list.length; i++) {
		words.push(capital(word_list[i]));
	}
	for(var i=0; i<words.length; i++) {
		words2.push(words[i]);
		words2.push(word_list[i]);
	}
	
	words2 = [...new Set(words2)];
	words2.sort();
	words2.reverse();
	words2.sort(function(a, b) {
		if (a.length < b.length) {
			return -1;
		}
		if (a.length > b.length) {
			return 1;
		}
		return 0;
	});
	
	return words2;
}

function capList(arr) {
	var newArr = [];
	
	for(var i=0; i<arr.length; i++) {
		var word = capital(arr[i]);
		newArr.push(word);
	}
	
	for(var i=0; i<newArr.length; i++) {
		arr.push(newArr[i]);
	}
	arr = [...new Set(arr)];
	
	return arr;
}

function capital(txt) {
	if(txt.length == 1) {
		return txt.toUpperCase();
	}
	return txt.charAt(0).toUpperCase() + txt.substr(1);
}

function parseTxt(txt,fileName) {
	//console.log("parseTxt");
	if(isNull(txt)) {
		return txt;
	}
	txt = txt.replace(/'/g,"’");
	txt = txt.replace(/^\n\n([^\n]+)Drawbacks\n\n/g,"\n\n$1Drawbacks=\n\n");
	txt = txt.replace(/^\n\n([^\n]+)Perks\n\n/g,"\n\n$1Perks=\n\n");
	txt = txt.replace(/^\n\n([^\n]+)Items\n\n/g,"\n\n$1Items=\n\n");
	
	fileName = fileName.replace(/_/g," ");
	txt = txt.replace(/\n([\n]+)/g,"\n\n");
	txt = txt.replace(/\"([^\"]+)\"/g, "“$1”");
	//txt = txt.replace(/‘([^‘’\n]+)’/g, "“$1”");//‘’
	txt = txt.replace(/\[([^0-9\[\]\n]*)Free([^0-9\[\]\n]*)\]/g,"[0]");
	txt = txt.replace(/\(([^0-9\[\]\n]*)Free([^0-9\[\]\n]*)\)/g,"[0]");
	
	var txts = txt.split("\n");
	
	txts = parseLines(txts,fileName);
	txts = cleanUpTxt(txts.join("\n"),true);
	
	txt = txts.join("\n");
	txt = cleanDoc(txt);
	
	txt = checkSpell(txt);
	txt = respaceDoc(txt);
	//txt = rejoinWords(txt);
	txt = cleanDoc(txt);
	//txt = trimTxt(txt);
	
	return txt;
}

function cleanDoc(txt) {
	//console.log("cleanDoc");
	txt = txt.replace(/@\n/g," ");
	txt = txt.replace(/,\n+/g,", ");
	txt = txt.replace(/\)\n\</g,") <");
	txt = txt.replace(/e\. g\./g,"e.g.");
	txt = txt.replace(/E\. g\./g,"E.g.");
	txt = txt.replace(/\n([ ]*)/g,"\n");
	txt = txt.replace(/([ ]*)\n/g,"\n");
	txt = txt.replace(/\}\n\-([\s]*)/g,"}\n");
	txt = txt.replace(/,([A-Za-z]+)/g,", $1");
	txt = txt.replace(/\.([A-Za-z]+)/g,". $1");
	txt = txt.replace(/\!([A-Za-z]+)/g,"! $1");
	txt = txt.replace(/\?([A-Za-z]+)/g,"? $1");
	txt = txt.replace(/\}\n\\r&emsp; /g,"}\n");
	txt = txt.replace(/\}\n<br\/>&emsp; /g,"}\n");
	txt = txt.replace(/'s([A-Za-z]+)/g,"'s $1");
	txt = txt.replace(/’s([A-Za-z]+)/g,"’s $1");
	txt = txt.replace(/”\n([A-Za-z]+)/g,"” $1");
	txt = txt.replace(/([A-Za-z]+)\n“/g,"$1 “");
	txt = txt.replace(/([A-Za-z]+)\n\-/g,"$1 -");
	txt = txt.replace(/\)\n([A-Za-z]+)/g,") $1");
	txt = txt.replace(/([\.\!\?]+)\n+\\/g,"$1 \\");
	txt = txt.replace(/\}\n\n+([A-Za-z]+)/g,"}\n$1");
	txt = txt.replace(/([a-z]+)\n+([a-z]+)/g,"$1 $2");
	txt = txt.replace(/([0-9]+)\n([a-z]+)/g,"$1 $2");
	txt = txt.replace(/([a-z]+)\n\(([a-z]+)/g,"$1 ($2");
	txt = txt.replace(/([A-Z])([A-Z]+)([a-z])/g,"$1$2 $3");
	txt = txt.replace(/([\.\!\?]+)\n([A-Za-z]+)/g,"$1 $2");
	txt = txt.replace(/([A-Za-z,]+)\n([A-Za-z,]+)/g,"$1 $2");
	txt = txt.replace(/> ([\s\-{0}]+){([0-9]+)}\n/g,"> {$2}\n");
	txt = txt.replace(/> {([0-9]+)}([\s\-{0}]+)\n/g,"> {$1}\n");
	txt = txt.replace(/ canal so /g," can also ");
	txt = txt.replace(/ ([ ]+)/g," ");
	txt = txt.replace(/CP\)([A-Za-z]+)/g,"\n$1");
	txt = txt.replace(/ o fan /g," of an ");
	//txt = txt.replace(/\[([^0-9\[\]\n]*)([0-9\+]+)([^0-9\[\]\n]*)\]/g,"{$2}");
	
	txt = txt.replace(/\~\{\!\$\!\}\~/g,"");
	txt = txt.replace(/\n([\n]+)/g,"\n\n");
	return txt;
}

function trimTxt(txt) {
	var txts = txt.split("\n");
	for(var i=0; i<txts.length; i++) {
		txts[i] = txts[i].trim();
	}
	return txts.join("\n");
}

function findWord(txt) {
	var dictFind = dict.lookup(txt);
	if(!dictFind.found) {
		return true;
	}
	
	return word_list.includes(txt);
}

function checkSpell(txt) {
	//console.log("checkSpell");
	if(txt=="") return "";
	var regex = RegExp(/^[A-Z]([a-z]+)/);
	var txts = txt.split("\n");
	var misspelled = [];
	
	for(var i=0; i<txts.length; i++) {
		var before = txts[i];
		var line = txts[i].split(" ");
		
		if(!isTitle(before)) {
			for(var j=0; j<line.length; j++) {
				var word = onlyWords(line[j]);
				var splits = splitWord(line[j]);
				var dictFind = dict.lookup(word);
				var sugestions = [];
				
				if(!dictFind.found) {
					for(var x=0; x<dictFind.length; x++) {
						sugestions.push[dictFind[x].word];
					}
					
					if(sugestions.length == 1) {
						if(word.toLowerCase() != sugestions[0].toLowerCase() && !word.endsWith("s")) {
							line[j] = sugestions[0];
						}
					}
					else {
						line[j] = splits;
					}
				}
			}
		}
		
		var after = line.join(" ");
		txts[i] = after;
	}
	
	var doc = txts.join("\n")
	return doc;
}

function rejoinWords(txt) {
	var txts = txt.split("\n");
	for(var i=0; i<txts.length; i++) {
		txts[i] = rejoinLine(txts[i].split(" "));
	}
	txt = txts.join("\n");
	return txt;
}

function rejoinLine(txts) {
	var notMatch = [];
	var found = 0;
	for(var i=0; i<txts.length; i++) {
		var word = txts[i];
		var dictFind = dict.lookup(word);
		if(!txts[i].includes(" ")) {
			if(found<1) {
				found++;
			}
			else {
				var meh = notMatch.join("");
				var newArr = [txts[0]+" "+meh];
				newArr.concat(txts.splice(i,txts.length-1));
				return rejoinLine(newArr);
			}
		}
		else if(dictFind.found) {
			if(found<1) {
				found++;
			}
			else {
				var meh = notMatch.join("");
				var newArr = [txts[0]+" "+meh];
				newArr.concat(txts.splice(i,txts.length-1));
				return rejoinLine(newArr);
			}
		}
		else {
			notMatch.push(txts[i]);
		}
	}
	return txts;
}

function parseLines(txts,fileName) {
	//console.log("parseLines");
	for(var i=0; i<txts.length; i++) {
		var t = txts[i];
		var before = txts[i];
		
		t = t.trim();
		var titleType = isTitle(t);
		if(titleType) {
			switch(titleType) {
				case 0:
				break;
				case 1://(
				var ts = t.match(title1);
				t = createTitle(ts,fileName,t);
				break;
				case 2://[
				var ts = t.match(title2);
				t = createTitle(ts,fileName,t);
				break;
				case 3:
				var ts = t.match(title3);
				t = createTitle(ts,fileName,t);
				break;
				case 4:
				var ts = t.match(title4);
				t = createTitle(ts,fileName,t);
				break;
				case 5:
				var ts = t.match(title5);
				t = createTitle(ts,fileName,t);
				break;
				case 6:
				var ts = t.match(title6);
				t = createTitle(ts,fileName,t);
				break;
				case 7:
				var ts = t.match(title7);
				t = createTitle(ts,fileName,t);
				break;
				case 8:
				var ts = t.match(title8);
				t = createTitle(ts,fileName,t);
				break;
				case 9:
				var ts = t.match(title9);
				t = createTitle(ts,fileName,t);
				break;
				case 10:
				var ts = t.match(title0);
				t = createTitle(ts,fileName,t);
				break;
				case 11:
				var ts = t.match(title11);
				t = createTitle(ts,fileName,t);
				break;
				case 12:
				var ts = t.match(title12);
				t = createTitle(ts,fileName,t);
				break;
				case 13:
				var ts = t.match(title13);
				t = createTitle(ts,fileName,t);
				break;
				case 14:
				var ts = t.match(title14);
				t = createTitle(ts,fileName,t);
				break;
				case 15:
				var ts = t.match(title15);
				t = createTitle(ts,fileName,t);
				break;
				case 16:
				var ts = t.match(title16);
				t = createTitle(ts,fileName,t);
				break;
				case 17:
				var ts = t.match(title17);
				t = createTitle(ts,fileName,t);
				break;
				case 99:
				var ts = t.split("-");
				t = createTitle(ts,fileName,t);
				break;
				default:
				t = t.replace(/\[/g," [");
				t = t.replace(/\(/g," (");
				t = t.replace(/\{/g," {");
				t = t.replace(/\</g," <");
				t = t.replace(/ ([ ]+)/g," ");
				var ts = t.split(" ");
				t = createTitle(ts,fileName,t);
				break;
			}
		}
		else if(isBullet(t)) {
			t = " <br/>&emsp; " + t;
		}
		
		t = t.trim();
		
		txts[i] = t;
	}
	return txts;
}

function isNull(meh) {
	if(meh == null || meh == undefined) {
		return true;
	}
	if(typeof meh == "string") {
		if(meh == "") {
			return true;
		}
		else {
			return false;
		}
	}
	if(typeof meh == "number") {
		if(isNaN(meh)) {
			return true;
		}
		else {
			return false;
		}
	}
	if([].constructor == meh.constructor && meh.length == 0) {
		return true;
	}
	if({}.constructor == meh.constructor) {
		var keys = Object.keys(meh);
		if(keys == 0) {
			return true;
		}
		else {
			return false;
		}
	}
	return false;
}

function createTitle(arr,fileName,line) {
	if(arr.length==1) {
		var txt = arr[0];
		txt = txt.replace(/\[/g," [");
		txt = txt.replace(/ ([ ]+)/g," ");
		var txts = txt.split(" ");
		return createTitle(txts,fileName,line);
	}
	var type = isTitle(line);
	var result = "";
	var newarr = [];
	
	for(var i=0; i<arr.length; i++) {
		if(arr[i] != line) {
			arr[i] = arr[i].trim();
			var num = onlyNumbers(arr[i]);
			var lower = arr[i].toLowerCase()
			if(!isNaN(num)) {
				arr[i] = "{" + num + "}";
			}
			if(typeof num == 'string') {
				arr[i] = "{" + num + "}";
			}
			
			if(lower == "(drop-in)" || lower == "[drop-in]") {
				newarr.push("");
			}
			else if(lower == "free" || lower == "[free]" || lower == "(free)" ||	lower == "(free all)") {
				newarr.push("{0}");
			}
			else if(
				arr[i]=="CP" || arr[i]=="CP)" || arr[i]=="CP]" || arr[i]=="MP"
				|| arr[i]=="MP)" || arr[i]=="MP]" || arr[i]=="CP;" || arr[i]=="CP;"
				|| arr[i]=="Discount:" || arr[i]=="Discount" || arr[i]=="CP:"
				|| arr[i]=="MP:" || arr[i]=="Discount-"
				) {
				newarr.push("");
			}
			else if(arr[i] == "-" || arr[i] == "–") {
				newarr.push("");
			}
			else {
				newarr.push(arr[i]);
			}
		}
	}
	
	result = newarr.join(" ");
	result = result.replace(/ ([ ]+)/g," ");
	result = result.replace("{","<"+fileName+"> {");
	if(!result.endsWith("}") && result != "")	{
		result = result.replace(/}([^}]*)/, "}\n$1");
	}
	
	if(result == "") {
		result = createTitle(line.split(" "),fileName,line);
		result = cleanUpTxt(result,false).join("\n");
	}
	else {
		addWords(result);
	}
	
	return "\n\n~{!$!}~" + result;
}

function respaceDoc(txt) {
	//console.log("respaceDoc");
	var txts = txt.split("\n");
	var result = "";
	var previous = "";
	for(var i=0; i<txts.length; i++) {
		if(isSection(txts[i])) {
			switch(previous) {
				default:
				result+="\n\n"+txts[i]+"\n\n";
				break;
			}
			previous="Section";
		}
		else if(isTitle(txts[i])) {
			switch(previous) {
				default:
				result+="\n\n"+txts[i];
				break;
			}
			previous="Title";
		}
		else if(isBullet(txts[i])) {
			switch(previous) {
				default:
				result+=" "+txts[i];
				break;
			}
			previous="Bullet";
		}
		else if(isPrereq(txts[i])) {
			switch(previous) {
				default:
				result+="\n"+txts[i];
				break;
			}
			previous="Prereq";
		}
		else if(isFreereq(txts[i])) {
			switch(previous) {
				default:
				result+="\n"+txts[i];
				break;
			}
			previous="Prereq";
		}
		else if(isDiscountreq(txts[i])) {
			switch(previous) {
				default:
				result+="\n"+txts[i];
				break;
			}
			previous="Prereq";
		}
		else {
			switch(previous) {
				default:
				result+="\n"+txts[i];
				break;
			}
			previous="Other";
		}
	}
	
	result = result.replace(/\n([\n]+)/g,"\n\n");
	
	return result;
}

function isPrereq(txt) {
	if(txt.startsWith("[Require")) {
		return true;
	}
	
	return prereqReg.test(txt);
}

function isFreereq(txt) {
	if(txt.startsWith("[Free")) {
		return true;
	}
	
	return freereqReg.test(txt);
}

function isDiscountreq(txt) {
	if(txt.startsWith("[Discount")) {
		return true;
	}
	
	return discountreqReg.test(txt);
}

function addWords(txt) {
	if(txt=="") return;
	txt = txt.replace(/\//g," ");
	txt = txt.replace(/,/g," ");
	txt = txt.replace(/\./g," ");
	txt = txt.replace(/\!/g," ");
	txt = txt.replace(/\?/g," ");
	txt = txt.replace(/\:/g," ");
	txt = txt.replace(/\;/g," ");
	txt = txt.replace(/\(/g," ");
	txt = txt.replace(/\)/g," ");
	txt = txt.replace(/</g," ");
	txt = txt.replace(/>/g," ");
	txt = txt.replace(/“/g," ");
	txt = txt.replace(/”/g," ");
	txt = txt.replace(/‘/g," ");
	txt = txt.replace(/ ([ ]+)/g," ");
	
	var idx = txt.indexOf("<");
	txt = txt.substr(0,idx);
	txt = txt.trim();
	var txts = txt.split(" ");
	for(var i=0; i<txts.length; i++) {
		word_list.push(txts[i])
		word_list.push(txts[i].toLowerCase())
	}
}

function onlyWords(txt) {
	var regex = new RegExp(/([A-Za-z ]+)/g);
	var words = txt.match(regex);
	words = [...new Set(words)];
	return words.join(" ");
}

function onlyNumbers(txt) {
	var regex = new RegExp(/([0-9]+)/g);
	if(txt.toLowerCase().includes("free") && !regex.test(txt)) {
		return 0;
	}
	var result = txt.match(regex);
	if(isNull(result)) return NaN;
	var num = NaN;
	for(var i=0; i<result.length; i++) {
		if(isNaN(num)) {
			num = parseInt(result[i]);
		}
		else if(!isNaN(parseInt(result[i]))) {
			num = [num].concat(parseInt(result[i]));
		}
	}
	if(isArray(num)) num = num.join("-");
	return num;
}

function isArray(obj) {
	return ([].constructor == obj.constructor);
}

function cleanUpTxt(txt,secondRun) {
	var txts = txt.split("\n");
	var regex1 = new RegExp(/^Discount for ([^\]]+)\]([^\n]+)/);
	var regex2 = new RegExp(/^for ([^\]]+)\]([^\n]+)/);
	var regex3 = new RegExp(/^\[?\(?([A-Za-z]+)\]?\)?/);
	var regex4 = new RegExp(/^Free for ([^\]]+)\]([^\n]+)/);
	
	for(var i=0; i<txts.length; i++) {
		txts[i] = txts[i].trim();
		if(regex1.test(txts[i])) {
			txts[i] = "\n[Discount: "+txts[i].match(regex1)[2]+"]@";
			txts[i] = txts[i].replace(/ \- /g,"");
		}
		if(regex2.test(txts[i])) {
			txts[i] = txts[i].match(regex2)[2];
			txts[i] = txts[i].substr(3);
		}
		if(regex4.test(txts[i])) {
			txts[i] = "\n[Free: "+txts[i].match(regex4)[2]+"]@";
			txts[i] = txts[i].substr(3);
		}
		if(txts[i].startsWith("– ")) {
			txts[i] = txts[i].substr(2);
		}
		if(txts[i].startsWith("for Drop-In] –")) {
			txts[i] = txts[i].substr(14);
		}
		if(txts[i].startsWith("(Drop-In)")) {
			txts[i] = txts[i].substr(9);
		}
		if(txts[i].startsWith("CP ") || txts[i].startsWith("CP)")) {
			txts[i] = txts[i].substr(3);
		}
		if(txts[i].startsWith("CP) ")) {
			txts[i] = txts[i].substr(4);
		}
		if(txts[i]=="CP" || txts[i]=="CP)") {
			txts[i]="";
		}
		
		txts[i] = txts[i].trim();
		
		if(isSection(txts[i])) {
			txts[i]="\n\n="+txts[i]+"=\n\n";
		}
		if((regex3.test(txts[i]) && txts[i].match(regex3)[1].length == txts[i].length)) {
			txts[i]="\n\n="+txts[i]+"=\n\n";
		}
		if(txts[i].endsWith("Perks=") || txts[i].endsWith("Items=") || txts[i].endsWith("Drawbacks=")) {
			txts[i]="\n\n="+txts[i]+"\n\n";
		}
	}
	txt = txts.join("\n");
	//txt = txt.replace(/\n([\n]+)/g,"\n\n");
	
	return txt.split("\n");
}

function isSection(txt) {
	if(section1.test(txt)) {
		return 1;
	}
	if(section2.test(txt)) {
		return 2;
	}
	if(section3.test(txt)) {
		return 3;
	}
	if(section4.test(txt)) {
		return 4;
	}
	if(section5.test(txt)) {
		return 5;
	}
	if(section6.test(txt)) {
		return 6;
	}
	if(section7.test(txt)) {
		return 7;
	}
	if(section8.test(txt)) {
		return 8;
	}
	if(section9.test(txt)) {
		return 9;
	}
	if(section10.test(txt)) {
		return 10;
	}
	if(section11.test(txt)) {
		return 11;
	}
	if(section12.test(txt)) {
		return 12;
	}
	if(section13.test(txt)) {
		return 13;
	}
	if(section14.test(txt)) {
		return 14;
	}
	if(section15.test(txt)) {
		return 15;
	}
	if(section16.test(txt)) {
		return 16;
	}
	if(section17.test(txt)) {
		return 17;
	}
	
	return 0;
}

function isTitle(txt) {
	if(txt=="") {
		return false;
	}
	var hasNum = new RegExp(/([0-9]+)/);
	
	if(txt.endsWith("]") && txt.includes("[") && title1.test(txt)) {
		return 1;
	}
	if(txt.endsWith(")") && txt.includes("(") && title2.test(txt)) {
		return 2;
	}
	if(title3.test(txt)) {
		return 3;
	}
	if(title4.test(txt)) {
		return 4;
	}
	if(title5.test(txt)) {
		return 5;
	}
	if(title6.test(txt)) {
		return 6;
	}
	if(title7.test(txt)) {
		return 7;
	}
	if(title8.test(txt)) {
		return 8;
	}
	if(title9.test(txt)) {
		return 9;
	}
	if(title0.test(txt)) {
		return 10;
	}
	if(title11.test(txt)) {
		return 11;
	}
	if(title12.test(txt)) {
		return 12;
	}
	if(title13.test(txt)) {
		return 13;
	}
	if(title14.test(txt)) {
		return 14;
	}
	if(title15.test(txt)) {
		return 15;
	}
	if(title16.test(txt)) {
		return 16;
	}
	if(title17.test(txt)) {
		return 17;
	}
	if(txt.endsWith("CP") && hasNum.test(txt) && txt.includes("-")) {
		return 99;
	}
	
	return 0;
}

function splitWord(txt) {
	txt = txt.replace(/,/g," , ");
	txt = txt.replace(/\./g," . ");
	txt = txt.replace(/\!/g," ! ");
	txt = txt.replace(/\?/g," ? ");
	txt = txt.replace(/\:/g," : ");
	txt = txt.replace(/\;/g," ; ");
	txt = txt.replace(/&emsp ;/g,"&emsp;");
	txt = txt.replace(/\\r&emsp ;/g,"\\r&emsp;");
	txt = txt.replace(/<br\/>&emsp ;/g,"<br\/>&emsp;");
	txt = txt.replace(/\\r& em sp ;/g,"\\r&emsp;");
	txt = txt.replace(/<br\/>& em sp ;/g,"<br\/>&emsp;");
	txt = txt.replace(/\(/g," ( ");
	txt = txt.replace(/\)/g," ) ");
	txt = txt.replace(/</g," < ");
	txt = txt.replace(/>/g," > ");
	txt = txt.replace(/“/g," “ ");
	txt = txt.replace(/”/g," ” ");
	txt = txt.replace(/‘/g," ‘ ");
	txt = txt.replace(/’/g," ’");
	txt = txt.replace(/\//g," / ");
	txt = txt.replace(/([ ]+)/g," ");
	txt = txt.replace(/([A-Z])([a-z]+)/g," $1$2");
	
	var last = commons.length;
	last--;
	var splitList = [];
	var lastIdx = txt.length;
	for(var i=last; i>=0; i--) {
		var idx = txt.indexOf(commons[i]);
		var begin = idx;
		var end = commons[i].length + idx;
		if(idx != -1 && !onSplitList(splitList,commons[i],begin,end)) {
			var first = txt.substr(0,idx);
			lastIdx = idx + commons[i].length;
			var last = txt.substr(lastIdx);
			txt = first + " " + commons[i] + " " + last;
			splitList.push({"Index":idx,"Word":commons[i],"Original":txt,"End":(commons[i].length+idx)});
		}
	}
	
	last = wordList.length;
	last--;
	splitList = [];
	lastIdx = txt.length;
	for(var i=last; i>=0; i--) {
		var idx = txt.indexOf(wordList[i]);
		var begin = idx;
		var end = wordList[i].length + idx;
		if(idx != -1 && !onSplitList(splitList,wordList[i],begin,end)) {
			var first = txt.substr(0,idx);
			lastIdx = idx + wordList[i].length;
			var last = txt.substr(lastIdx);
			txt = first + " " + wordList[i] + " " + last;
			splitList.push({"Index":idx,"Word":wordList[i],"Original":txt,"End":(wordList[i].length+idx)});
		}
	}
	
	txt = txt + " ";
	txt = txt.replace(/([ ]+)/g," ");
	txt = txt.replace(/ ,/g,",");
	txt = txt.replace(/ \./g,".");
	txt = txt.replace(/ \!/g,"!");
	txt = txt.replace(/ \?/g,"?");
	txt = txt.replace(/ \:/g,":");
	txt = txt.replace(/ \;/g,";");
	txt = txt.replace(/\( /g,"(");
	txt = txt.replace(/ \)/g,")");
	txt = txt.replace(/< /g,"<");
	txt = txt.replace(/ >/g,">");
	txt = txt.replace(/“ /g,"“");
	txt = txt.replace(/ ”/g,"”");
	txt = txt.replace(/ ’/g,"’");
	txt = txt.replace(/‘ /g,"‘");
	txt = txt.replace(/ \/ /g,"/");
	txt = txt.replace(/\\r& em sp;/g,"\\r&emsp;");
	txt = txt.replace(/<br\/>& em sp;/g,"<br\/>&emsp;");
	var mreg = new RegExp(/([A-Z])([ /s/t]+)([A-Z])([ /s/t]+)([A-Z]+)/);
	while(mreg.test(txt)) {
		txt = txt.replace(/([A-Z])([ /s/t]+)([A-Z])([ /s/t]+)([A-Z]+)/g,"$1$3$5");
	}
	
	txt = txt.replace(/ es(\.|\?|\!| |\,|"|'|:|;)/g,"es$1");
	txt = txt.replace(/ ed(\.|\?|\!| |\,|"|'|:|;)/g,"ed$1");
	txt = txt.replace(/ er(\.|\?|\!| |\,|"|'|:|;)/g,"er$1");
	txt = txt.replace(/ est(\.|\?|\!| |\,|"|'|:|;)/g,"est$1");
	txt = txt.replace(/ ly(\.|\?|\!| |\,|"|'|:|;)/g,"ly$1");
	txt = txt.replace(/ s(\.|\?|\!| |\,|"|'|:|;)/g,"s$1");
	txt = txt.replace(/ ing(\.|\?|\!| |\,|"|'|:|;)/g,"ing$1");
	txt = txt.replace(/ n't(\.|\?|\!| |\,|"|'|:|;)/g,"n’t$1");
	txt = txt.replace(/ n’t(\.|\?|\!| |\,|"|'|:|;)/g,"n’t$1");
	txt = txt.replace(/ 's(\.|\?|\!| |\,|"|'|:|;)/g,"’s$1");
	txt = txt.replace(/’ s(\.|\?|\!| |\,|"|'|:|;)/g,"’s$1");
	txt = txt.replace(/ ’s(\.|\?|\!| |\,|"|'|:|;)/g,"’s$1");
	txt = txt.replace(/ s’(\.|\?|\!| |\,|"|'|:|;)/g,"s’$1");
	txt = txt.replace(/’ re /g,"’re ");
	txt = txt.replace(/’ ve /g,"’ve ");
	txt = txt.replace(/e d /g,"ed ");
	txt = txt.replace(/e r /g,"er ");
	txt = txt.replace(/e st /g,"est ");
	txt = txt.replace(/ s=/g,"s=");
	txt = txt.replace(/ -([a-z]+)/g,"-$1");
	txt = txt.replace(/ - ([a-z]+)/g,"-$1");
	txt = txt.replace(/^= /g,"=");
	txt = txt + " ";
	txt = txt.replace(/ ([ ]+)/g," ");
	
	txt = txt.trim();
	return txt;
}

function splitFind(txt) {
	txt = splitWord(txt);
	var txts = txt.split(" ");
	for(var i=0; i<txts.length; i++) {
		if(!findWord(txts[i])) {
			return false;
		}
	}
	return true;
}

function onSplitList(idxs,txt,idx) {
	var len = txt.length + idx;
	for(var i=0; i<idxs.length; i++) {
		if(idxs[i]["Word"].includes(txt)) {
			return true;
		}
	}
	return false;
}

function isBullet(txt) {
	var regex = new RegExp(/^([A-Za-z0-9]+):/);
	var regex1 = new RegExp(/^([A-Za-z0-9]+): </);
	var regex2 = new RegExp(/^\-([\-]+)/);
	var regex3 = new RegExp(/^([0-9]+)\. /);
	var regex4 = new RegExp(/^([0-9]+)\) /);
	
	if(txt.startsWith("+") || txt.startsWith("●") || txt.startsWith("*")) {
		return true;
	}
	
	if(txt.startsWith("-") && !regex2.test(txt)) {
		if(!isNull(txt.match(regex2))) {
			if(txt.match(regex2)[1]==txt) return true;
		}
	}
	
	if(title3.test(txt) || regex1.test(txt)) {
		return false;
	}
	
	var tri = txt.trim();
	if(tri=="Location:" || tri=="Backgrounds:" || tri=="Perks:" || tri=="Companions:" || tri=="Drawbacks:" || tri=="Scenario:") {
		return false;
	}
	
	return ((regex.test(txt) || regex3.test(txt) || regex4.test(txt)) && !regex1.test(txt) && !isTitle(txt));
}

function respace() {
	for(var i=0; i<word_list.length; i++) {
		word_list[i] = word_list[i].replace(/ /g,"");
		word_list[i] = word_list[i].trim();
	}
	return word_list;
}

function arrayToDictionary(wordArr) {
	var temp_dict = {};
	var add_words = dictionary.split(" ");
	for (i = 0; i < add_words.length; i++) {
		temp_dict[add_words[i]] = add_words[++i];
	}
	
	for(var i=0; i<wordArr.length; i++) {
		if(isNull(temp_dict[wordArr[i]])) {
			temp_dict[wordArr[i]] = 1;
		}
		else {
			temp_dict[wordArr[i]] = temp_dict[wordArr[i]] + 1;
		}
	}
	var new_dict = "\"";
	var keys = Object.keys(temp_dict);
	keys.sort();
	for(var i=0; i<keys.length; i++) {
		new_dict = new_dict + " " + keys[i] + " " + temp_dict[keys[i]];
	}
	new_dict = new_dict + "\"";
	writeToFile2(new_dict, "new_dict.js");
}

function sortList(arr) {
	arr.sort();
	arr.reverse();
	arr.sort(function(a, b) {
		if (a.length < b.length) {
			return -1;
		}
		if (a.length > b.length) {
			return 1;
		}
		return 0;
	});
	
	return arr;
}

function fileToWordList(name) {
	fs.readFile("../staticNode/public/dictionaries/"+name, 'utf8', function(err, data) {
		if (err) {
			console.log(err);
		}
		var words = data.split("\n");
		for(var i=0; i<words.length; i++) {
			word_list.push(words[i]);
		}
		
		word_list = wordListCap();
		word_list = [...new Set(word_list)];
		word_list.sort();
		word_list.reverse();
		word_list.sort(function(a, b) {
			if (a.length < b.length) {
				return -1;
			}
			if (a.length > b.length) {
				return 1;
			}
			return 0;
		});
		
		//writeToFile6(word_list, "wordList.json");
		writeToFile5(word_list, "wordList.js");
	});
}

function updateWordList() {
	//respace();
	word_list = wordListCap();
	word_list = [...new Set(word_list)];
	word_list.sort();
	word_list.reverse();
	word_list.sort(function(a, b) {
		if (a.length < b.length) {
			return -1;
		}
		if (a.length > b.length) {
			return 1;
		}
		return 0;
	});
	
	writeToFile5(word_list, "wordList.js");
	writeToFile6(word_list, "wordList.js");
}

function updateCommons() {
	//commons = capList(commons);
	commons = sortList(commons);
	writeToFile4(commons,"commons.json");
	writeToFile5(commons,"commons.js");
}

async function downloadFile(fileId,auth) {
	console.log("downloadFile",fileId);
	const service = google.drive({version: 'v3', auth});
	
	try {
		const file = await service.files.get({
			fileId: fileId,
			alt: 'media',
			//mimeType: 'application/pdf',
			key: API_KEY,
		});
		console.log(file.status);
		return file.status;
	}
	catch (err) {
		console.log("Error:",err);
	}
};

fs.readFile('credentials.json', (err, content) => {
	if (err) return console.log('Error loading client secret file:', err);
	// Authorize a client with credentials, then call the Google Drive API.
	authorize(JSON.parse(content), listFiles);
});

function authorize(credentials, callback) {
	//console.log("credentials",credentials);
	try {
		const {client_secret, client_id, redirect_uris} = credentials.installed;
		const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
		
		// Check if we have previously stored a token.
		fs.readFile(TOKEN_PATH, (err, token) => {
			if (err) return getAccessToken(oAuth2Client, callback);
			oAuth2Client.setCredentials(JSON.parse(token));
			callback(oAuth2Client);
		});
	}
	catch (err) {
		console.log("Error",err);
	}
}

function getAccessToken(oAuth2Client, callback) {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	});
	console.log('Authorize this app by visiting this url:', authUrl);
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	rl.question('Enter the code from that page here: ', (code) => {
		rl.close();
		oAuth2Client.getToken(code, (err, token) => {
			if (err) return console.error('Error retrieving access token', err);
			oAuth2Client.setCredentials(token);
			// Store the token to disk for later program executions
			fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
				if (err) return console.error(err);
				console.log('Token stored to', TOKEN_PATH);
			});
			callback(oAuth2Client);
		});
	});
}

function listFiles(auth) {
	const drive = google.drive({version: 'v3', auth});
	drive.files.list({
		pageSize: 10,
		fields: 'nextPageToken, files(id, name)',
	},
	(err, res) => {
		if (err) return console.log('The API returned an error: ' + err);
		const files = res.data.files;
		if (files.length) {
			console.log('Files:');
			files.map((file) => {
				console.log(`${file.name} (${file.id})`);
			});
		}
		else {
			console.log('No files found.');
		}
	});
}

function getFileId(str) {
	if(str.includes("drive.google.com")) {
		console.log("drive.google.com");
		if(str.startsWith("https://drive.google.com/open?id=")) {
			str = str.replace("https://drive.google.com/open?id=","");
			return str;
		}
		if(str.startsWith("https://docs.google.com/spreadsheets/d/")) {
			str = str.replace("https://docs.google.com/spreadsheets/d/","");
			str = str.split("/")[0];
			return str;
		}
	}
	if(str.includes("docs.google.com")) {
		console.log("docs.google.com");
		if(str.startsWith("https://docs.google.com/document/d/")) {
			str = str.replace("https://docs.google.com/document/d/","");
			str = str.split("/")[0];
			return str;
		}
	}
	return "";
}

async function exportPdf(fileId,auth) {
	console.log("exportPdf called");
	const service = google.drive({version: 'v3', auth});
	
	try {
		const result = await service.files.export({
			fileId: fileId,
			mimeType: 'application/pdf',
			key: API_KEY,
		});
		console.log("result.status:",result.status);
		return result;
	}
	catch (err) {
		isAuth = false;
		console.log("Error",err);
	}
}

//updateCommons();
//updateWordList();

module.exports = router;
