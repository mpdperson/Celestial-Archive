var allDomains		= [];
var allFandoms		= [];
var allSources		= [];
var loadedJson		= [];
var importFile		= [];
var celestial_forge	= [];
var toAdd			= [];

var allUpper	= {};
var minDomains	= {};
var upperDict	= {};

var currentPerk	= 0;

var curFileName	= "";

var sourceReg		= new RegExp(/<([^>\n]+)>/g);
var titleReg		= new RegExp(/^([^<\n]+)/g);
var costReg			= new RegExp(/{([0-9]+)}/g);
var domainReg		= new RegExp(/^\[Domain:? ([^\r\n\]]+)\]/);
var prereqReg		= new RegExp(/^\[Requires?:? ([^\n\]]+)\]/);
var freereqReg		= new RegExp(/^\[Free:? ([^\n\]]+)\]/);
var discountreqReg	= new RegExp(/^\[Discounte?d?:? ([^\n\]]+)\]/);
var prereqReg1		= new RegExp(/\[Requires:? ([^\n\]]+)\]/);
var freeReg			= new RegExp(/\[Free:? ([^\n\]]+)\]/);
var discountReg		= new RegExp(/\[Discounte?d?:? ([^\n\]]+)\]/);
var restrictReg		= new RegExp(/\[Restricte?d?:? ([^\n\]]+)\]/);
var excludeReg		= new RegExp(/\[Excluded?:? ([^\n\]]+)\]/);
var conjoinReq		= new RegExp(/\[Conjoine?d?:? ([^\n\]]+)\]/);
var reg				= new RegExp(/:? /g);

var input		= document.getElementById('myFile');
var selectDom	= document.getElementById("Domain");
var selectOver	= document.getElementById("Over_Domain");

function qs(q) {
	return document.querySelector(q);
}

$.getJSON('public/json/all_upper.json', function(data) {
	var keys = Object.keys(data);
	keys.sort(function(a, b) {
		if(a.toLowerCase() < b.toLowerCase()) {
			return -1;
		}
		if(a.toLowerCase() > b.toLowerCase()) {
			return 1;
		}
		return 0;
	});
	for(var i=0; i<keys.length; i++) {
		upperDict[keys[i]] = data[keys[i]].sort(function(a, b) {
			if(a.toLowerCase() < b.toLowerCase()) {
				return -1;
			}
			if(a.toLowerCase() > b.toLowerCase()) {
				return 1;
			}
			return 0;
		});
	}
});

$("#Over_Domain").change(function() {
	var meh = $('option:selected', this).text();
	selectDom.innerHTML = "";
	var optionsUnder = allDomains[meh];
	if(!isNull(optionsUnder) && meh!="Add") {
		for(var j=0; j<optionsUnder.length; j++) {
			var opt2 = optionsUnder[j];
			var el2 = document.createElement("option");
			el2.textContent = opt2;
			el2.value = opt2;
			selectDom.appendChild(el2);
		}
	}
	else {
		fillDrop();
	}
	
	$("#Domain").val(toAdd[currentPerk].Domain);
});

input.addEventListener('change',() => {
	let files = input.files;
	if(files.length == 0) return;
	const file = files[0];
	let reader = new FileReader();
	
	reader.onload = (e) => {
		const file = e.target.result;
		const lines = file.split(/\r\n|\n|\r/);
		importFile = lines;
		var fileName = getFileName();
		var ext = fileName.split(".")[1];
		if(ext=="json") {
			console.log("jsonParse");
			try {
				var obj = JSON.parse(file);
				if(!isNull(obj)) {
					toAdd = flatJson(createNotes(checkPerks(formatPerks(obj))));
					processFile(true);
				}
			}
			catch(error) {
				console.error(error);
			}
		}
		else if(ext=="txt") {
			console.log("txtParse");
			processFile();
		}
	};
	
	reader.onerror = (e) => alert(e.target.error.name);
	reader.readAsText(file);
});

function processFile(bypass) {
	if(isNull(bypass)) bypass = false;
	if(!bypass) parseFile();
	if(toAdd.length > 0) {
		fillDrop();
		toAdd = [...new Set(toAdd)];
		isEdit = false;
		
		toAdd = toAdd.filter(word => word.Title.length > 0);
		prevPerk();
		$("#popUp").toggleClass("hidden");
		$("#myFile").val("");
	}
}

function getFileName() {
	var fullPath = document.getElementById('myFile').value;
	if(fullPath) {
		var startIndex = (fullPath.indexOf('\\')>=0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
		var filename = fullPath.substring(startIndex);
		if(filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
			filename = filename.substring(1);
		}
		curFileName = filename.replaceAll(" ","_");
		return filename;
	}
	curFileName = "";
	return "";
}

function checkPerk(jsonObj,overStr) {
	if(isNull(jsonObj.Title)) {
		jsonObj["Title"] = "";
	}
	if(isNull(jsonObj.Domain)) {
		jsonObj["Domain"] = "Add";
	}
	if(isNull(jsonObj.Restrict_Title)) {
		jsonObj["Restrict_Title"] = "";
	}
	if(isNull(jsonObj.Exclude_Title)) {
		jsonObj["Exclude_Title"] = "";
	}
	if(isNull(jsonObj.Over_Domain)) {
		if(isNull(overStr)) {
			if(isNull(jsonObj.Domain)) {
				jsonObj["Over_Domain"] = "Add";
			}
			else {
				jsonObj["Over_Domain"] = jsonObj.Domain;
			}
		}
		else {
			jsonObj["Over_Domain"] = overStr;
		}
	}
	if(isNull(jsonObj.Description)) {
		jsonObj["Description"] = "";
	}
	else {
		jsonObj["Description"] = jsonObj["Description"].replace(/([ ]+)/g," ");
		jsonObj["Description"] = jsonObj["Description"].trim();
	}
	if(isNull(jsonObj.Retake_Multiplier)) {
		jsonObj["Retake_Multiplier"] = 1;
	}
	if(isNull(jsonObj.Retake_Limit)) {
		jsonObj["Retake_Limit"] = 0;
	}
	if(isNull(jsonObj.Dice)) {
		jsonObj["Dice"] = "1d1";
	}
	if(isNull(jsonObj.Retake)) {
		jsonObj["Retake"] = false;
	}
	if(isNull(jsonObj.Taken)) {
		jsonObj["Taken"] = false;
	}
	if(isNull(jsonObj.Tags)) {
		jsonObj["Tags"] = [];
	}
	if(isNull(jsonObj.Discount_Title)) {
		jsonObj["Discount_Title"] = "";
	}
	if(isNull(jsonObj.Discount_Multiplier)) {
		jsonObj["Discount_Multiplier"] = 0.5;
	}
	if(isNull(jsonObj.Free_Title)) {
		jsonObj["Free_Title"] = "";
	}
	if(isNull(jsonObj.Prereq_Title)) {
		jsonObj["Prereq_Title"] = "";
	}
	if(isNull(jsonObj.Conjoin_Title)) {
		jsonObj["Conjoin_Title"] = "";
	}
	if(isNull(jsonObj.Cost)) {
		jsonObj["Cost"] = 0;
	}
	if(isNull(jsonObj.Retake_Cost)) {
		jsonObj["Retake_Cost"] = 0;
	}
	if(isNull(jsonObj.Discount_Cost)) {
		jsonObj["Discount_Cost"] = 0;
	}
	if(isNull(jsonObj.Source)) {
		jsonObj["Source"] = "Add";
	}
	if(isNull(jsonObj.Upper_Source)) {
		jsonObj["Upper_Source"] = getUpper(jsonObj);
	}
	if(!isNull(jsonObj.Upper_Sources)) {
		if(jsonObj.Upper_Sources.length == 1) {
			if(jsonObj.Upper_Sources[0]=="") {
				delete jsonObj.Upper_Sources;
			}
		}
	}
	return jsonObj;
}

function getUpper(obj) {
	var meh = upperDict[obj.Source];
	if(isNull(meh)) {
		return obj.Source;
	}
	else {
		if(meh.length==1) {
			return meh[0];
		}
		else {
			return obj.Source;
		}
	}
}

function capitalSentance(txt) {
	var tmpTxt = stripString(txt);
	var regex = new RegExp(/^([A-Z ]+)/g);
	if(regex.test(tmpTxt) && tmpTxt.length!=1) {
		txt = txt.toLowerCase();
	}
	if(txt.length == 1) {
		return txt.toUpperCase();
	}
	var saveWords = tmpTxt.split(" ");
	var words = tmpTxt.split(" ");
	for(var i=0; i<words.length; i++) {
		if(words[i].includes("-")) {
			var sWords = words[i].split("-");
			for(var j=0; j<sWords.length; j++) {
				sWords[j] = capital(sWords[j]);
			}
			words[i] = sWords.join("-");
		}
		else {
			words[i] = capital(words[i]);
		}
		//txt.replace(saveWords[i], words[i]);
	}
	return words.join(" ");
}

function stripLowerString(str) {
	str = ""+str;
	str = str.toLowerCase();
	str = str.replaceAll(/[^a-z0-9 \-]/ig,"");
	return str;
}

function stripString(str) {
	str = ""+str;
	str = str.replaceAll(/[^A-Za-z0-9 \-]/ig,"");
	return str;
}

function capital(txt) {
	if(txt.length == 1) {
		return txt.toUpperCase();
	}
	return txt.charAt(0).toUpperCase() + txt.substr(1);
}

function jsonToArray(obj) {
	var keys = Object.keys(obj);
	var newArr = [];
	if(isFormated(obj[keys[0]])) {
		for(var i=0; i<keys.length; i++) {
			newArr.push(obj[keys[i]]);
		}
		return newArr;
	}
	else if(isPerk(obj[keys[0]])) {
		var newJson = {};
		for(var i=0; i<keys.length; i++) {
			var tmp = {"Domain":obj[keys[i]].Domain,"Over_Domain":domainLookup(obj[keys[i]]),"Perks":[obj[keys[i]]]};
			if(newJson.hasOwnProperty(obj[keys[i]].Domain)) {
				newJson[obj[keys[i]].Domain].Perks.push(obj[keys[i]]);
			}
			else {
				newJson[obj[keys[i]].Domain] = tmp;
			}
		}
		var jKeys = Object.keys(newJson);
		for(var i=0; i<jKeys.length; i++) {
			newArr.push(newJson[jKeys[i]]);
		}
		return newArr;
	}
}

function isPerk(obj) {
	return (
		obj.hasOwnProperty("Domain")
		&& obj.hasOwnProperty("Title")
		&& obj.hasOwnProperty("Cost")
		&& obj.hasOwnProperty("Description")
		&& obj.hasOwnProperty("Source")
	);
}

function isFormated(obj) {
	if(isNull(obj)) return false;
	return (obj.hasOwnProperty("Domain") && obj.hasOwnProperty("Over_Domain") && obj.hasOwnProperty("Perks"));
}

function isBullet(txt) {
	if(txt.startsWith("-") || txt.startsWith("+") || txt.startsWith("●") || txt.startsWith("*")) {
		return true;
	}
	var regex = new RegExp(/^([A-Za-z0-9]+):/);
	return regex.test(txt);
}

function findBestMatch(res) {
	var bMatch = "";
	var lm = 0;
	var matched = {};
	for(var pm of allFandoms) {
		var per = similarity(pm,res);
		if(per.as>lm) {
			lm = per.as;
			bMatch = pm;
			matched = per;
			matched["source"] = pm;
		}
	}
	if(lm = 0) {
		bMatch = res;
	}
	return bMatch;
}

function formatPerks(obj) {
	if(obj.constructor = [].constructor) {
		if(isFormated(obj[0])) {
			return obj;
		}
	}
	var domains = {};
	var allDoms = [];
	obj.forEach(function(n) {
		if(!isNull(n)) {
			var tmp = {"Domain":n.Domain,"Over_Domain":domainLookup(n),"Perks":[n]};
			if(!isNull(n) && !isNull(n.Domain)) {
				if(domains.hasOwnProperty(n.Domain)) {
					domains[n.Domain].Perks.push(n);
				}
				else {
					domains[n.Domain] = tmp;
				}
			}
		}
	});
	var keys = Object.keys(domains);
	keys.sort(function(a, b) {
		if(a.toLowerCase() < b.toLowerCase()) {
			return -1;
		}
		if(a.toLowerCase() > b.toLowerCase()) {
			return 1;
		}
		return 0;
	});
	for(var i=0; i<keys.length; i++) {
		allDoms.push(domains[keys[i]]);
	}
	return allDoms;
}

function domainLookup(obj) {
	if(isNull(obj.Domain)) return "";
	if(isNull(obj.Over_Domain)) {
		if(obj.Domain.includes(":")) {
			return obj.Domain.split(":")[0].trim();
		}
		else {
			return obj.Domain;
		}
	}
	else {
		return obj.Over_Domain;
	}
}

function isNull(meh) {
	if(meh == null || meh == undefined) {
		return true;
	}
	if(meh.constructor == [].constructor) {
		if(meh.length == 0) {
			return true;
		}
		else {
			return false;
		}
	}
	if(meh.constructor == {}.constructor) {
		var keys = Object.keys(meh);
		if(keys.length == 0) {
			return true;
		}
		else {
			return false;
		}
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
	return false;
}

function saveJson(jsonData, fileName, isVar) {
	if(isNull(isVar)) isVar = true;
	var ext = fileName.split(".").pop();
	var varName = fileName.split(".")[0];
	if((ext=="js") && isVar) {
		download("var "+varName+" = "+JSON.stringify(jsonData, null, 2), fileName, 'text/plain');
	}
	else {
		download(JSON.stringify(jsonData, null, 2), fileName, 'text/plain');
	}
}

function download(content, fileName, contentType) {
	var a = document.createElement("a");
	var file = new Blob([content], {type: contentType});
	a.href = URL.createObjectURL(file);
	a.download = fileName;
	a.click();
}

function checkPerks(obj) {
	obj.forEach(function(d) {
		d.Perks.forEach(function(p,idx,theArr) {
			theArr[idx] = checkPerk(p,d.Over_Domain);
		});
	});
	return obj;
}

function flatJson(obj) {
	var newArr = [];
	obj.forEach(function(d) {
		d.Perks.forEach(function(p) {
			newArr.push(p);
		});
	});
	return newArr;
}

function sortForge(obj) {
	if(isNull(obj)) return obj;
	obj.sort(function(a, b) {
		if(a.Domain.toLowerCase() < b.Domain.toLowerCase()) {
			return -1;
		}
		if(a.Domain.toLowerCase() > b.Domain.toLowerCase()) {
			return 1;
		}
		return 0;
	});
	var simP = [];
	var domainCount = 0;
	obj.forEach(function(d) {
		var perkCount = 0;
		d.Perks = d.Perks.sort(function(a, b) {
			if(a.Title.toLowerCase() < b.Title.toLowerCase()) {
				return -1;
			}
			if(a.Title.toLowerCase() > b.Title.toLowerCase()) {
				return 1;
			}
			return 0;
		});
		d.Perks.forEach(function(p,idx,theArr) {
			p.Domain_Number = domainCount;
			p.Perk_Number = perkCount;
			var tmpP = Object.keys(p).sort().reduce(
				(obj, key) => {
					obj[key] = p[key];
					return obj;
				},
				{}
			);
			var tTitle = tmpP.Title;
			var tTaken = tmpP.Taken;
			var newP = {};
			newP["Title"] = tTitle;
			var keys = Object.keys(tmpP);
			for(var i=0; i<keys.length; i++) {
				if(keys[i]!="Title" && keys[i]!="Taken") {
					newP[keys[i]] = tmpP[keys[i]];
				}
			}
			newP["Domain"] = d.Domain;
			newP["Taken"] = tTaken;
			theArr[idx] = newP;
			perkCount++;
			if(d.Over_Domain=="Origins") {
				addOrigin(newP);
			}
		});
		d.Perks = d.Perks.filter(function(p) {
			return (!isNull(p));
		});
		domainCount++;
	});
	return obj;
}

function sameTitleDomain(obj) {
	var titleArray = [];
	var uniqueArray = [];
	var matchArray = [];
	var perks = [];
	$.each(obj, function(index, item) {
		$.each(item.Perks, function(idx,value) {
			if(!isNull(value)) {
				if($.inArray(value.Title.toLowerCase()+"_"+value.Source.toLowerCase(), titleArray) === -1) {
					titleArray.push(value.Title.toLowerCase()+"_"+value.Source.toLowerCase());
					uniqueArray.push(value);
				}
				else {
					matchArray.push(titleArray.findIndex(value.Title.toLowerCase()+"_"+value.Source.toLowerCase()));
					perks.push(value);
				}
			}
		});
	});
	perks.sort(function(a, b) {
		if(a.Domain_Number < b.Domain_Number) return 1;
		else if(a.Domain_Number > b.Domain_Number) return -1;
		else if(a.Perk_Number < b.Perk_Number) return 1;
		else if(a.Perk_Number > b.Perk_Number) return -1;
		else return 0;
	});
	for(var i=0; i<perks.length; i++) {
		var deleteMe = getSmallerIndex(uniqueArray[matchArray[i]],perks[i]);
		delete obj[deleteMe.Domain_Number].Perks[deleteMe.Perk_Number];
	}
	obj = obj.filter(function(p) {
		return (!isNull(p));
	});
	obj.forEach(function(d) {
		d.Perks = d.Perks.filter(function(p) {
			return (!isNull(p));
		});
	});
	return obj;
}

function getSmallerIndex(a,b) {
	var result = {"Domain_Number":b.Domain_Number,"Perk_Number":b.Perk_Number};
	var aKeys = Object.keys(a);
	var bKeys = Object.keys(b);
	if(aKeys.length>bKeys.length) {
		return {"Domain_Number":b.Domain_Number,"Perk_Number":b.Perk_Number};
	}
	if(bKeys.length>aKeys.length) {
		return {"Domain_Number":a.Domain_Number,"Perk_Number":a.Perk_Number};
	}
	if(bKeys.length==aKeys.length) {
		for(var i=0; i<aKeys.length; i++) {
			if(typeof a[aKeys[i]] == "string") {
				if(a[aKeys[i]].length>b[abKeys[i]].length) {
					return {"Domain_Number":b.Domain_Number,"Perk_Number":b.Perk_Number};
				}
				if(b[abKeys[i]].length>a[aKeys[i]].length) {
					return {"Domain_Number":a.Domain_Number,"Perk_Number":a.Perk_Number};
				}
			}
		}
	}
	return result;
}

function createNotes(obj) {
	if(isNull(createNotes)) return null;
	allDomains = [];
	allFandoms = [];
	allSources = [];
	minDomains = {};
	obj = sortForge(obj);
	var count = 0;
	var dcount = 0;
	obj.forEach(function(d) {
		if(!minDomains.hasOwnProperty(d.Domain)) {
			minDomains[d.Domain] = count;
			count++;
		}
		if(!allDomains.hasOwnProperty(d.Over_Domain)) {
			allDomains[d.Over_Domain] = [];
			allDomains[d.Over_Domain].push(d.Domain);
		}
		else {
			allDomains[d.Over_Domain].push(d.Domain);
		}
		var pcount = 0;
		d.Perks.forEach(function(p) {
			p["Domain_Number"] = dcount;
			p["Perk_Number"] = pcount;
			if(!allSources.includes(p.Source)) {
				allSources.push(p.Source);
			}
			if(!allFandoms.includes(p.Upper_Source)) {
				allFandoms.push(p.Upper_Source);
			}
			if(!upperDict.hasOwnProperty(p.Source) && !isNull(p.Upper_Source)) {
				upperDict[p.Source] = isNull(p.Upper_Sources) ? [p.Upper_Source] : p.Upper_Sources.sort();
			}
			else if(!isNull(p.Upper_Source)) {
				upperDict[p.Source].concat(isNull(p.Upper_Sources) ? [p.Upper_Source] : p.Upper_Sources.sort());
				upperDict[p.Source] = [...new Set(upperDict[p.Source])];
				upperDict[p.Source] = upperDict[p.Source].sort();
			}
			pcount++;
		});
		dcount++;
	});
	upperDict = Object.keys(upperDict).sort().reduce(
		(obj, key) => {
			obj[key] = upperDict[key];
			return obj;
		},
		{}
	);
	allFandoms.sort(function(a, b) {
		if(a.toLowerCase() < b.toLowerCase()) {
			return -1;
		}
		if(a.toLowerCase() > b.toLowerCase()) {
			return 1;
		}
		return 0;
	});
	allSources.sort(function(a, b) {
		if(a.toLowerCase() < b.toLowerCase()) {
			return -1;
		}
		if(a.toLowerCase() > b.toLowerCase()) {
			return 1;
		}
		return 0;
	});
	return obj;
}

function saveNotes() {
	saveJson(allFandoms,"allFandoms.json");
	saveJson(allSources,"allSources.json");
	saveJson(upperDict,"allUpper.json");
	saveJson(allDomains,"allDomains.json");
}

function prevPerk() {
	currentPerk--;
	
	if(currentPerk < 0) {
		currentPerk = 0;
	}
	
	if(currentPerk == (toAdd.length - 1)) {
		if($("#perk_submit").hasClass("hidden")) {
			$("#perk_submit").toggleClass("hidden");
		}
	}
	else if(!$("#perk_submit").hasClass("hidden")) {
		$("#perk_submit").toggleClass("hidden");
	}
	
	showPerk();
	
	var l1 = $('#Domain').children('option').length;
	var l2 = $('#Domain2').children('option').length;
	if(l1==1) {
		$("#Domain").val($("#Domain option:first").val());
	}
	if(l2==1) {
		$("#Domain2").val($("#Domain2 option:first").val());
	}
	topFunction();
}

function topFunction() {
	document.body.scrollTop = 0; // For Safari
	document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function nextPerk() {
	if(qs("#Auto_Save").checked) {
		saveCurrentPerk();
	}
	currentPerk++;
	
	if(currentPerk >= toAdd.length) {
		currentPerk = toAdd.length - 1;
	}
	
	if(currentPerk == (toAdd.length - 1)) {
		if($("#perk_submit").hasClass("hidden")) {
			$("#perk_submit").toggleClass("hidden");
		}
	}
	
	showPerk();
	
	var l1 = $('#Domain').children('option').length;
	var l2 = $('#Domain2').children('option').length;
	if(l1==1) {
		$("#Domain").val($("#Domain option:first").val());
	}
	if(l2==1) {
		$("#Domain2").val($("#Domain2 option:first").val());
	}
	topFunction();
}

function showPerk() {
	var tmp_perk = toAdd[currentPerk];
	if(isNull(tmp_perk)) return;
	tmp_perk = checkPerk(tmp_perk,tmp_perk.Over_Domain);
	$("#Title").val(isNull(tmp_perk.Title) ? "" : tmp_perk.Title);
	$("#Source").val(isNull(tmp_perk.Source) ? "" : tmp_perk.Source);
	$("#Upper_Source").val(isNull(tmp_perk.Upper_Source) ? "" : tmp_perk.Upper_Source);
	$("#Upper_Sources").val(isNull(tmp_perk.Upper_Sources) ? "" : tmp_perk.Upper_Sources.join("~|~"));
	$("#Cost").val(isNull(tmp_perk.Cost) ? 0 : roundCost(tmp_perk.Cost));
	$("#Description").val(isNull(tmp_perk.Description) ? "" : tmp_perk.Description);
	$("#Prereq_Title").val(isNull(tmp_perk.Prereq_Title) ? "" : tmp_perk.Prereq_Title);
	$("#Free_Title").val(isNull(tmp_perk.Free_Title) ? "" : tmp_perk.Free_Title);
	$("#Discount_Title").val(isNull(tmp_perk.Discount_Title) ? "" : tmp_perk.Discount_Title);
	$("#Restrict_Title").val(isNull(tmp_perk.Restrict_Title) ? "" : tmp_perk.Restrict_Title);
	$("#Conjoin_Title").val(isNull(tmp_perk.Conjoin_Title) ? "" : tmp_perk.Conjoin_Title);
	$("#Exclude_Title").val(isNull(tmp_perk.Exclude_Title) ? "" : tmp_perk.Exclude_Title);
	$("#Retake").prop('checked', isNull(tmp_perk.Retake) ? false : tmp_perk.Retake);
	$("#Delete").prop('checked', isNull(tmp_perk.Delete) ? false : tmp_perk.Delete);
	$("#Retake_Cost").val(isNull(tmp_perk.Retake_Cost) ? 0 : roundCost(tmp_perk.Retake_Cost));
	$("#Retake_Limit").val(isNull(tmp_perk.Retake_Limit) ? 0 : tmp_perk.Retake_Limit);
	$("#Retake_Multiplier").val(isNull(tmp_perk.Retake_Multiplier) ? 1 : tmp_perk.Retake_Multiplier);
	$("#Dice").val(isNull(tmp_perk.Dice) ? "1d1" : tmp_perk.Dice);
	$("#Discount_Multiplier").val(isNull(tmp_perk.Discount_Multiplier) ? 0.5 : tmp_perk.Discount_Multiplier);
	$("#Perk_Number").val(isNull(tmp_perk.Perk_Number) ? -1 : tmp_perk.Perk_Number);
	$("#Domain_Number").val(isNull(tmp_perk.Domain_Number) ? -1 : tmp_perk.Domain_Number);
	$("#Discount_Cost").val(isNull(tmp_perk.Discount_Cost) ? 0 : roundCost(tmp_perk.Discount_Cost));
	doUnder(tmp_perk.Over_Domain);
	sleep(300).then(() => {
		var tmpOD = getOverDomain(toAdd[currentPerk]);
		$("#Domain").val(isNull(toAdd[currentPerk].Domain) ? "" : toAdd[currentPerk].Domain);
		$("#Over_Domain").val(isNull(toAdd[currentPerk].Over_Domain) ? tmpOD : toAdd[currentPerk].Over_Domain);
	});
	sleep(400).then(() => {
		if($("#Over_Domain").val()=="") {
			tmpOD = getOverDomain(toAdd[currentPerk]);
			$("#Over_Domain").val(tmpOD);
		}
	});
	sleep(500).then(() => {
		if($("#Domain").val()=="") {
			$("#Domain").val($("#Domain option:first").val());
		}
	});
}

function isDupe(obj,arr) {
	for(var d of arr) {
		for(var p of d.Perks) {
			if(p.Title.toLowerCase() == obj.Title.toLowerCase() && p.Source.toLowerCase() == obj.Source.toLowerCase()) {
				return true;
			}
		}
	}
	return false;
}

function getOverDomain(obj) {
	var keys = Object.keys(allDomains);
	for(var i=0; i<keys.length; i++) {
		for(var j=0; j<allDomains[keys[i]].length; j++) {
			if(obj.Domain.toLowerCase() == allDomains[keys[i]][j].toLowerCase()) {
				return keys[i];
			}
		}
	}
	return "";
}

function addDomain(over, txt) {
	if(!allDomains.hasOwnProperty(over)) {
		allDomains[over] = [txt];
		celestial_forge.push({"Domain":txt,"Over_Domain":over,"Perks":[]});
	}
	else if(!isNull(allDomains[over])) {
		if(!allDomains[over].includes(txt)) {
			allDomains[over].push(txt);
			minDomains[txt] = Object.keys(minDomains).length;
			celestial_forge.push({"Domain":txt,"Over_Domain":over,"Perks":[]});
		}
	}
}

function addOverDomain(txt) {
	if(!allDomains.hasOwnProperty(txt)) {
		allDomains[txt] = [txt];
		celestial_forge.push({"Domain":txt,"Over_Domain":txt,"Perks":[]});
	}
}

function saveCurrentPerk() {
	var od2 = document.getElementById('Add_Over_Domains');
	if(od2.value.trim()!="") {
		addOverDomain(od2.value.trim());
		fillDrop();
		od2.value = "";
		return;
	}
	
	var ad2 = document.getElementById('Add_Domains');
	if(ad2.value.trim()!="") {
		var under = ad2.value.trim();
		var over = under.split(":")[0];
		if(isNull(over)) {
			over = under;
		}
		else {
			over = over.trim();
		}
		addDomain(over,under);
		fillDrop();
		ad2.value = "";
		return;
	}
	
	var meh = {
		"Title":$("#Title").val(),
		"Cost":roundCost(parseInt($("#Cost").val())),
		"Description":$("#Description").val(),
		"Dice":$("#Dice").val(),
		"Discount_Multiplier":parseFloat($("#Discount_Multiplier").val()),
		"Discount_Cost":roundCost(parseInt($("#Discount_Cost").val())),
		"Discount_Title":$("#Discount_Title").val(),
		"Domain":$("#Domain").val(),
		"Domain_Number":parseInt($("#Domain_Number").val()),
		"Exclude_Title":$("#Exclude_Title").val(),
		"Free_Title":$("#Free_Title").val(),
		"Conjoin_Title":$("#Conjoin_Title").val(),
		"Perk_Number":parseInt($("#Perk_Number").val()),
		"Prereq_Title":$("#Prereq_Title").val(),
		"Restrict_Title":$("#Restrict_Title").val(),
		"Retake":$("#Retake").prop('checked'),
		"Retake_Cost":roundCost(parseInt($("#Retake_Cost").val())),
		"Retake_Multiplier":parseInt($("#Retake_Multiplier").val()),
		"Retake_Limit":parseInt($("#Retake_Limit").val()),
		"Source":$("#Source").val(),
		"Upper_Source":$("#Upper_Source").val(),
		"Upper_Sources":$("#Upper_Sources").val().split("~|~"),
		"Taken":false,
		"Over_Domain":$("#Over_Domain").val(),
		"Delete":$("#Delete").prop('checked'),
	}
	toAdd[currentPerk] = meh;
}

document.onkeydown = function(e) {
	e = e || window.event;
	var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
	if(document.activeElement.nodeName!="INPUT" && document.activeElement.nodeName!="TEXTAREA") {
		switch(event.keyCode) {
			case 37:
			//Left key pressed
			prevPerk();
			break;
			case 38:
			//Up key pressed
			break;
			case 39:
			//Right key pressed'
			nextPerk();
			break;
			case 40:
			//Down key pressed
			break;
			case 13:
			//Enter key pressed
			saveCurrentPerk();
			break;
		}
	}
};

function cancelProcess() {
	var tmp = document.getElementById("popUp");
	tmp.classList.add('hidden');
}

function savePerks() {
	celestial_forge = [];
	var keys = Object.keys(minDomains);
	for(var i=0; i<keys.length; i++) {
		var ukeys = Object.keys(allDomains[keys[i]]);
		for(var j=0; j<ukeys.length; j++) {
			var tmpD = {"Domain": ukeys[j], "Over_Domain": keys[i], "Perks":[]};
			celestial_forge.push(tmpD);
		}
	}
	
	for(var perk of toAdd) {
		if(!perk.Delete) {
			var addThis = {
				"Title":perk.Title,
				"Cost":roundCost(perk.Cost),
				"Description":perk.Description,
				"Dice":perk.Dice,
				"Discount_Cost":roundCost(perk.Discount_Cost),
				"Discount_Multiplier":perk.Discount_Multiplier,
				"Discount":perk.Discount,
				"Discount_Title":perk.Discount_Title,
				"Domain":perk.Domain,
				"Domain_Number":perk.Domain_Number,
				"Free":perk.Free_Req,
				"Free_Title":perk.Free_Title,
				"Lewd":perk.Lewd,
				"Over_Domain":perk.Over_Domain,
				"Prereq":perk.Prereq,
				"Perk_Number":perk.Perk_Number,
				"Prereq_Title":perk.Prereq_Title,
				"Restrict":perk.Restrict,
				"Restrict_Title":perk.Restrict_Title,
				"Retake":perk.Retake,
				"Retake_Cost":roundCost(perk.Retake_Cost),
				"Retake_Limit":perk.Retake_Limit,
				"Retake_Multiplier":perk.Retake_Multiplier,
				"Source":perk.Source,
				"Upper_Source":perk.Upper_Source,
				"Taken":false,
			}
			if(!isNull(perk.Upper_Sources)) {
				addThis["Upper_Sources"] = perk.Upper_Sources;
			}
			addThis = checkPerk(addThis,);
			if(isNull(perk.Domain)) {
				var optionsUnder = allDomains[perk.Over_Domain];
				addThis.Domain = optionsUnder[0];
			}
			if(isNull(celestial_forge[minDomains[addThis.Domain]])) {
				celestial_forge[minDomains[perk.Domain]] = {
					"Domain": addThis.Domain, "Over_Domain": addThis.Over_Domain, "Perks":[]
				};
			}
			celestial_forge[minDomains[perk.Domain]].Perks.push(addThis);
		}
	}
	celestial_forge.forEach(function(d) {
		d.Perks = d.Perks.filter(function(p) {
			if(!isNull(p.Delete)) {
				if(p.Delete) {
					return false;
				}
				else {
					delete p.Delete;
					return (p.Domain==d.Domain);
				}
			}
			else {
				return (p.Domain==d.Domain);
			}
		});
	});
	celestial_forge = formatPerks(toAdd);
	saveJson(celestial_forge, curFileName+".json");
}

function validateMyForm() {
	var fileName = getFileName();
	var ext = fileName.split(".")[1];
	if($("#url").val()=="" && fileName=="" && ext!="pdf" && ext!="txt") {
		return false;
	}
	else {
		return true;
	}
}

function fillDrop() {
	selectOver.innerHTML = "";
	selectDom.innerHTML = "";
	var tmpOpt = document.createElement("option");
	var tmpOpt2 = document.createElement("option");
	tmpOpt2.textContent = "Select One";
	tmpOpt.textContent = "Select One";
	tmpOpt2.value = "";
	tmpOpt.value = "";
	selectOver.appendChild(tmpOpt);
	selectDom.appendChild(tmpOpt2);
	
	var optionsOver = Object.keys(allDomains);
	for(var i=0; i < optionsOver.length; i++) {
		var opt = optionsOver[i];
		var el = document.createElement("option");
		el.textContent = opt;
		el.value = opt;
		selectOver.appendChild(el);
		var optionsUnder = allDomains[optionsOver[i]];
		for(var j=0; j<optionsUnder.length; j++) {
			var opt2 = optionsUnder[j];
			var el2 = document.createElement("option");
			el2.textContent = opt2;
			el2.value = opt2;
			selectDom.appendChild(el2);
		}
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function isDomain(txt) {
	var regex1 = new RegExp(/^\=([^=\r\n]+)\=/g);
	if(regex1.test(txt)) {
		return 1;
	}
	return 0;
}

function multiReq(txt) {
	return (
		prereqReg1.test(txt)
		|| freeReg.test(txt)
		|| discountReg.test(txt)
		|| restrictReg.test(txt)
		|| excludeReg.test(txt)
		|| conjoinReq.test(txt)
	);
}


function parseFile() {
	toAdd = [];
	if(importFile.length == 0) {
		return toAdd;
	}
	var nOver_Domain = "";
	var trimedPerk = emptyPerk();
	for(var i=0; i<importFile.length; i++) {
		var parseLine = importFile[i].trim();
		if(isDomain(parseLine)) {
			nOver_Domain = parseLine.replaceAll("=","");
			if(nOver_Domain == "Unknown") nOver_Domain = "";
			trimedPerk = emptyPerk();
		}
		else if(domainReg.test(parseLine)) {
			nOver_Domain = parseLine.match(domainReg)[1].trim();
			if(nOver_Domain == "Unknown") nOver_Domain = "";
			trimedPerk = emptyPerk();
		}
		else if(isTitle(parseLine)) {
			var titleMatch = parseLine.match(titleReg);
			var sourceMatch = parseLine.match(sourceReg);
			var title = titleMatch[0];
			title = title.trim();
			
			var source = sourceMatch[0];
			source = source.replaceAll("<","");
			source = source.replaceAll(">","");
			source = source.trim();
			
			var overSource = findBestMatch(source);
			
			var cost = parseLine.match(costReg)[0].trim();
			cost = cost.replaceAll("{","");
			cost = cost.replaceAll("}","");
			cost = parseInt(cost);
			
			if(cost < 50 && cost < 30) { cost = 0;}
			if(cost < 50 && cost >= 30) { cost = 50;}
			title = capitalSentance(title);
			
			trimedPerk["Cost"] = cost;
			trimedPerk["Title"] = title;
			trimedPerk["Source"] = source;
			trimedPerk["Domain"] = nOver_Domain;
			trimedPerk["Over_Domain"] = nOver_Domain.split(":")[0];
			trimedPerk["Upper_Source"] = overSource;
		}
		else if(isBullet(parseLine)) {
			if(isNull(trimedPerk["Description"])) {
				trimedPerk["Description"] = parseLine.trim();
				if(getMulti(trimedPerk["Description"])) {
					trimedPerk["Retake"] = true;
				}
			}
			else {
				trimedPerk["Description"] = trimedPerk["Description"] + " \r&emsp; " + parseLine.trim();
				if(getMulti(trimedPerk["Description"])) {
					trimedPerk["Retake"] = true;
				}
			}
		}
		else if(multiReq(parseLine)) {
			if(isNull(trimedPerk["Description"])) {
				trimedPerk["Description"] = parseLine.trim();
				if(prereqReg1.test(parseLine)) {
					if(isNull(trimedPerk["Prereq_Title"])) {
						trimedPerk["Prereq_Title"] = parseLine.match(prereqReg1)[1].trim();
					}
					else {
						trimedPerk["Prereq_Title"] = trimedPerk["Prereq_Title"] + " && " + parseLine.match(prereqReg1)[1].trim();
					}
				}
				if(freeReg.test(parseLine)) {
					if(isNull(trimedPerk["Free_Title"])) {
						trimedPerk["Free_Title"] = parseLine.match(freeReg)[1].trim();
					}
					else {
						trimedPerk["Free_Title"] = trimedPerk["Free_Title"] + " && " + parseLine.match(freeReg)[1].trim();
					}
				}
				if(discountReg.test(parseLine)) {
					if(isNull(trimedPerk["Discount_Title"])) {
						trimedPerk["Discount_Title"] = parseLine.match(discountReg)[1].trim();
					}
					else {
						trimedPerk["Discount_Title"] = trimedPerk["Discount_Title"] + " && " + parseLine.match(discountReg)[1].trim();
					}
				}
				if(restrictReg.test(parseLine)) {
					if(isNull(trimedPerk["Restrict_Title"])) {
						trimedPerk["Restrict_Title"] = parseLine.match(restrictReg)[1].trim();
					}
					else {
						trimedPerk["Restrict_Title"] = trimedPerk["Restrict_Title"] + " && " + parseLine.match(restrictReg)[1].trim();
					}
				}
				if(excludeReg.test(parseLine)) {
					if(isNull(trimedPerk["Exclude_Title"])) {
						trimedPerk["Exclude_Title"] = parseLine.match(excludeReg)[1].trim();
					}
					else {
						trimedPerk["Exclude_Title"] = trimedPerk["Exclude_Title"] + " && " + parseLine.match(excludeReg)[1].trim();
					}
				}
				if(conjoinReq.test(parseLine)) {
					if(isNull(trimedPerk["Conjoin_Title"])) {
						trimedPerk["Conjoin_Title"] = parseLine.match(conjoinReq)[1].trim();
					}
					else {
						trimedPerk["Conjoin_Title"] = trimedPerk["Conjoin_Title"] + " && " + parseLine.match(conjoinReq)[1].trim();
					}
				}
				if(getMulti(trimedPerk["Description"])) {
					trimedPerk["Retake"] = true;
				}
			}
			else {
				trimedPerk["Description"] = trimedPerk["Description"] + " \\r&emsp; " + parseLine.trim();
				if(prereqReg1.test(parseLine)) {
					if(isNull(trimedPerk["Prereq_Title"])) {
						trimedPerk["Prereq_Title"] = parseLine.match(prereqReg1)[1].trim();
					}
					else {
						trimedPerk["Prereq_Title"] = trimedPerk["Prereq_Title"] + " && " + parseLine.match(prereqReg1)[1].trim();
					}
					trimedPerk["Prereq"] = true;
				}
				if(freeReg.test(parseLine)) {
					if(isNull(trimedPerk["Prereq_Title"])) {
						trimedPerk["Free_Title"] = parseLine.match(freeReg)[1].trim();
					}
					else {
						trimedPerk["Free_Title"] = trimedPerk["Free_Title"] + " && " + parseLine.match(freeReg)[1].trim();
					}
					trimedPerk["Free"] = true;
				}
				if(discountReg.test(parseLine)) {
					if(isNull(trimedPerk["Prereq_Title"])) {
						trimedPerk["Discount_Title"] = parseLine.match(discountReg)[1].trim();
					}
					else {
						trimedPerk["Discount_Title"] = trimedPerk["Discount_Title"] + " && " + parseLine.match(discountReg)[1].trim();
					}
					trimedPerk["Discount"] = true;
				}
				if(getMulti(trimedPerk["Description"])) {
					trimedPerk["Retake"] = true;
				}
			}
		}
		else if(isPrereq(parseLine)) {
			if(isNull(trimedPerk["Description"])) {
				trimedPerk["Description"] = parseLine.replace(/\[ /g,"[").replace(/ \]/g,"]").trim();
				trimedPerk["Prereq_Title"] = parseLine.match(prereqReg)[1].trim();
				trimedPerk["Prereq"] = true;
				if(getMulti(trimedPerk["Description"])) {
					trimedPerk["Retake"] = true;
				}
			}
			else {
				trimedPerk["Description"] = trimedPerk["Description"] + " \\r&emsp; " + parseLine.trim();
				if(getMulti(trimedPerk["Description"])) {
					trimedPerk["Retake"] = true;
				}
			}
		}
		else if(isFreereq(parseLine)) {
			if(isNull(trimedPerk["Description"])) {
				trimedPerk["Description"] = parseLine.replace(/\[ /g,"[").replace(/ \]/g,"]").trim();
				trimedPerk["Free_Title"] = parseLine.match(freereqReg)[1].trim();
				trimedPerk["Free"] = true;
				if(getMulti(trimedPerk["Description"])) {
					trimedPerk["Retake"] = true;
				}
			}
			else {
				trimedPerk["Description"] = trimedPerk["Description"] + " \\r&emsp; " + parseLine.trim();
				if(getMulti(trimedPerk["Description"])) {
					trimedPerk["Retake"] = true;
				}
			}
		}
		else if(isDiscountreq(parseLine)) {
			if(isNull(trimedPerk["Description"])) {
				trimedPerk["Description"] = parseLine.replace(/\[ /g,"[").replace(/ \]/g,"]").trim();
				trimedPerk["Discount_Title"] = parseLine.match(discountreqReg)[1].trim();
				trimedPerk["Discount"] = true;
				if(getMulti(trimedPerk["Description"])) {
					trimedPerk["Retake"] = true;
				}
			}
			else {
				trimedPerk["Description"] = trimedPerk["Description"] + " \\r&emsp; " + parseLine.trim();
				if(getMulti(trimedPerk["Description"])) {
					trimedPerk["Retake"] = true;
				}
			}
		}
		else if(parseLine != '') {
			if(isNull(trimedPerk["Description"])) {
				trimedPerk["Description"] = parseLine.trim();
				if(getMulti(trimedPerk["Description"])) {
					trimedPerk["Retake"] = true;
				}
			}
			else {
				trimedPerk["Description"] = trimedPerk["Description"] + " " + parseLine.trim();
				if(getMulti(trimedPerk["Description"])) {
					trimedPerk["Retake"] = true;
				}
			}
		}
		else {
			if(!isNull(trimedPerk.Discount_Title)) {
				if(trimedPerk.Discount_Title.includes("&&") && trimedPerk.Discount_Title.includes("||")) {
					if(!trimedPerk.Discount_Title.startsWith("(") && !trimedPerk.Discount_Title.endsWith("(")) {
						trimedPerk.Discount_Title = "("+trimedPerk.Discount_Title+")";
					}
				}
			}
			if(!isNull(trimedPerk.Free_Title)) {
				if(trimedPerk.Free_Title.includes("&&") && trimedPerk.Free_Title.includes("||")) {
					if(!trimedPerk.Free_Title.startsWith("(") && !trimedPerk.Free_Title.endsWith("(")) {
						trimedPerk.Free_Title = "("+trimedPerk.Free_Title+")";
					}
				}
			}
			if(!isNull(trimedPerk.Prereq_Title)) {
				if(trimedPerk.Prereq_Title.includes("&&") && trimedPerk.Prereq_Title.includes("||")) {
					if(!trimedPerk.Prereq_Title.startsWith("(") && !trimedPerk.Prereq_Title.endsWith("(")) {
						trimedPerk.Prereq_Title = "("+trimedPerk.Prereq_Title+")";
					}
				}
			}
			if(!isNull(trimedPerk.Exclude_Title)) {
				if(trimedPerk.Exclude_Title.includes("&&") && trimedPerk.Exclude_Title.includes("||")) {
					if(!trimedPerk.Exclude_Title.startsWith("(") && !trimedPerk.Exclude_Title.endsWith("(")) {
						trimedPerk.Exclude_Title = "("+trimedPerk.Exclude_Title+")";
					}
				}
			}
			if(!isNull(trimedPerk.Conjoin_Title)) {
				if(trimedPerk.Conjoin_Title.includes("&&") && trimedPerk.Conjoin_Title.includes("||")) {
					if(!trimedPerk.Conjoin_Title.startsWith("(") && !trimedPerk.Conjoin_Title.endsWith("(")) {
						trimedPerk.Conjoin_Title = "("+trimedPerk.Conjoin_Title+")";
					}
				}
			}
			if(!isNull(trimedPerk.Restrict_Title)) {
				if(trimedPerk.Restrict_Title.includes("&&") && trimedPerk.Restrict_Title.includes("||")) {
					if(!trimedPerk.Restrict_Title.startsWith("(") && !trimedPerk.Restrict_Title.endsWith("(")) {
						trimedPerk.Restrict_Title = "("+trimedPerk.Restrict_Title+")";
					}
				}
			}
			toAdd.push(trimedPerk);
			trimedPerk = emptyPerk();
		}
	}
	
	createNotes(checkPerks(formatPerks(toAdd)));
}

function getMulti(obj) {
	obj = obj.toLowerCase();
	if(obj.includes("purchased multiple times")) {
		return true;
	}
	if(obj.includes("purchased multiple")) {
		return true;
	}
	if(obj.includes("multiple purchases allowed")) {
		return true;
	}
	if(obj.includes("can be taken more than once")) {
		return true;
	}
	if(obj.includes("multiple purchases")) {
		return true;
	}
	return false;
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

function isTitle(txt) {
	if((txt.endsWith("}") && txt.includes("{")) && (txt.includes(">") && txt.includes("<"))) {
		return true;
	}
	
	return false;
}

function roundCost(obj) {
	var value = Math.round(obj);
	var remainder = obj % 50;
	remainder = Math.floor(remainder);
	if(value>0) {
		value = value - remainder;
	}
	else {
		value = value + remainder;
	}
	return value;
}

function emptyPerk() {
	var meh = {
		"Title":"",
		"Source":"",
		"Cost":"",
		"Description":""
	}
	return meh;
}

function save() {
	saveJson(celestial_forge, curFileName+".json");
}

function doUnder(meh) {
	meh = isNull(meh) ? "" : meh;
	selectDom.innerHTML = "";
	if(isNull(allDomains[meh])) {
		fillDrop();
	}
	else {
		var optionsUnder = allDomains[meh];
		for(var j=0; j<optionsUnder.length; j++) {
			var opt2 = optionsUnder[j];
			var el2 = document.createElement("option");
			el2.textContent = opt2;
			el2.value = opt2;
			selectDom.appendChild(el2);
		}
		if(optionsUnder.length==1) {
			$("#Domain").val(optionsUnder[0]);
		}
	}
}

