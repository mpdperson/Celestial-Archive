function authenticate() {
    return gapi.auth2.getAuthInstance()
	.signIn({
		scope: "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.photos.readonly https://www.googleapis.com/auth/drive.readonly"
	})
	.then(function() {
		console.log("Sign-in successful");
	},
	function(err) {
		console.error("Error signing in", err);
	});
}

function loadClient() {
    gapi.client.setApiKey("AIzaSyCDQNcP2vOJqVRZ7YkKQ3VW2pPR0QCOKEM");
    return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/drive/v3/rest")
	.then(function() { 
		console.log("GAPI client loaded for API"); 
	},
	function(err) { 
		console.error("Error loading GAPI client for API", err); 
	});
}

function execute() {
    return gapi.client.drive.files.list({
		"corpora": "user"
	})
	.then(function(response) {
		// Handle the results here (response.result has the parsed body).
		console.log("Response", response);
	},
	function(err) { 
		console.error("Execute error", err); 
	});
}

function loadAPI() {
	gapi.load("client:auth2", function() {
		gapi.auth2.init({client_id: "celestialarchive"});
		//gapi.auth2.init({client_id: "852045897070"});
	});
}

function authLoad() {
	loadAPI();
	sleepMe(300).then(() => {
		authenticate().then(loadClient);
	});
}

function sleepMe(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}