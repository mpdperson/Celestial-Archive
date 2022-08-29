const bodyParser = require('body-parser');
const cors = require('cors');
const createError = require('http-errors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const ejs = require('ejs');
const express = require('express');
const fs = require("fs");
const http = require('http');
const morgan = require('morgan');
const path = require('path');
const resolve = require('path').resolve;
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const session = require('express-session');
const cookieSession = require('cookie-session');
var os = require("os");
var hostname = os.hostname();
var cpath = process.cwd();

const HOST = "127.0.0.1";
var port = process.env.PORT || 3000;
if(hostname=="KZJmTO6d3d"){
	//port = 80;
}
var cpath = process.cwd();
console.log("hostname",hostname);
console.log("cpath",cpath);

var servers = [];
var s;

const app = express();

app.use(cookieSession({
	name: 'session',
	keys: ['key1']
}));

//routes
var cyoaRouter = require('./routes/cyoa');
var convertRouter = require('./routes/convert');
var exploreRouter = require('./routes/explore');
var dictRouter = require('./routes/dictionary');
var fileRouter = require('./routes/file');
var indexRouter = require('./routes/index');

function reqHandler(req, res) {
	console.log({
		remoteAddress: req.socket.remoteAddress,
		remotePort: req.socket.remotePort,
		localAddress: req.socket.localAddress,
		localPort: req.socket.localPort,
	});
}

//views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(express.static('..\..\Fun Stuff'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/cyoa', cyoaRouter);
app.use('/convert', convertRouter);
app.use('/explore', exploreRouter);
app.use('/dictionary', dictRouter);
app.use('/file', fileRouter);
app.use('/', indexRouter);

app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/builder', express.static(resolve('..\builder')));
app.use('/archive', express.static(resolve('..\archive')));
//app.use('/forge', express.static(resolve('..\forge')));
app.use('/forge', express.static(resolve('..\quasar\dist\spa')));

app.get('/public/*', function(req, res, next) {
	var newUrl = req.url.replace("/public/","");
	if(newUrl.endsWith("/")) {
		newUrl = newUrl.substring(0, newUrl.length - 1);
	}
	res.redirect("/"+newUrl);
});

/*
app.get('/forge/*', function(req, res, next) {
	var newUrl = req.url.replace("/forge/","");
	newUrl = newUrl.replace(/\//g,"\\");
	res.sendFile(resolve(".\\forge\\"+newUrl));
});

app.get('/forge', function(req, res, next) {
	res.sendFile(resolve(".\\forge\\celestial_archive.html"));
});
//*/
	
app.get('/forge/*', function(req, res, next) {
	var newUrl = req.url.replace("/forge/","");
	newUrl = newUrl.replace(/\//g,"\\");
	res.sendFile(resolve(".\\quasar\\dist\\spa\\"+newUrl));
});

app.get('/forge', function(req, res, next) {
	res.sendFile(resolve(".\\quasar\\dist\\spa\\index.html"));
});

app.get('/format', function(req, res, next) {
	res.sendFile(resolve(".\\forge\\updatePerks.html"));
});

app.get('/archive/*', function(req, res, next) {
	var newUrl = req.url.replace("/archive/","");
	newUrl = newUrl.replace(/\//g,"\\");
	res.sendFile(resolve(".\\archive\\"+newUrl));
});

app.get('/archive', function(req, res, next) {
	res.sendFile(resolve(".\\archive\\Archive.html"));
});

app.get('/builder/*', function(req, res, next) {
	var newUrl = req.url.replace("/builder/","");
	newUrl = newUrl.replace(/\//g,"\\");
	res.sendFile(resolve(".\\builder\\"+newUrl));
});

app.get('/builder', function(req, res, next) {
	res.sendFile(resolve(".\\builder\\Builder.html"));
});

app.use(function(req, res, next) {
	try {
		console.log("Unknown URL:",req.url);
		var test = req.url;
		var newbase = req.session.rpath;
		
		if(test.startsWith("/Fun")) {
			console.log("Redirect");
			res.redirect(req.url);
		}
		
		if(req.session.rpath == "/" || test.includes(".map")) {
			next(createError(404));
		}
		else {
			if(test.startsWith("/Fun")) {
				next(createError(404));
			}
			else {
				var newpath = newbase + req.url;
				console.log("newpath:",newpath);
				res.redirect(newpath);
			}
		}
	}
	catch(e) {
		
	}
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	
	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

app.listen(port, () => {
	console.log('Listening on port: '+port);
});
