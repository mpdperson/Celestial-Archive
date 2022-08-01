var allSkills = magic_skills.concat(science_skills);
allSkills = allSkills.sort();
allSkills = [...new Set(allSkills)];

var body = document.body;
var html = document.documentElement;

var allRollCount	= 0;
var loadedJson		= {};
var doRerolls		= false;
var sleepTime		= 500;
var canRun			= true;
var filled			= false;
var gained			= false;
var isRunning		= false;
var untilPerk		= false;
var currentCP		= 0;
var currentPerk		= 0;
var missedPerk		= 0;
var allDomains		= [];
var allFandoms		= [];
var allMisses		= [];
var allRolls		= [];
var allSources		= [];
var currentPerks	= [];
var currentTitles	= [];
var importFile		= [];
var toAdd			= [];
var trimPerks		= [];
var allUpper		= {};
var minDomains		= {};
var perksNum		= {};
var temp			= emptyPerk();
var doWait			= true;
var totalPerks		= 0;
var totalForge		= 0;
var currentRolls	= 0;
var toggleCost		= [];
var saveCost		= [];
var toggleDomain	= [];
var saveDomain		= [];
var domainNumber	= {};

var input			= document.getElementById('myFile');
var selectDom		= document.getElementById("Domain");
var selectDom2		= document.getElementById("Domain2");
var selectOver		= document.getElementById("Over_Domain");
var selectOver2		= document.getElementById("Over_Domain2");

var sourceReg		= new RegExp(/<([^>\n]+)>/g);
var titleReg		= new RegExp(/^([^<\n]+)/g);
var costReg			= new RegExp(/{([0-9]+)}/g);
var domainReg		= new RegExp(/=([^=\n]+)=/g);
var prereqReg		= new RegExp(/^\[?Requires:? ([^\n\]]+)\]/);
var freereqReg		= new RegExp(/^\[?Free:? ([^\n\]]+)\]/);
var discountreqReg	= new RegExp(/^\[?Discounte?d?:? ([^\n\]]+)\]/);
var prereqReg1		= new RegExp(/\[?Requires:? ([^\n\]]+)\]/);
var freereqReg1		= new RegExp(/\[?Free:? ([^\n\]]+)\]/);
var discountreqReg1	= new RegExp(/\[?Discounte?d?:? ([^\n\]]+)\]/);
var restrictreqReg1	= new RegExp(/\[?Restricte?d?:? ([^\n\]]+)\]/);
var excludereqReg1	= new RegExp(/\[?Excluded?:? ([^\n\]]+)\]/);
var reg				= new RegExp(/:? /g);
var reloadStarters	= true;

function toggleCosts(obj) {
	console.log("toggleCosts");
	obj = obj;
	if(toggleCost.includes(obj)) {
		toggleCost = toggleCost.filter(function(n){ return n != obj});
	}
	else {
		toggleCost.push(obj);
	}
}

function toggleDomains(obj) {
	console.log("toggleDomains");
	obj = obj.replaceAll("_"," ");
	toggleDomain[domainNumber[obj]] = !toggleDomain[domainNumber[obj]];
}

function loadProgress() {
	console.log("loadProgress");
	if(!isNull(loadedJson)) {
		var extra = document.getElementById("extra");
		var perks = document.getElementById("perks");
		perks.innerHTML = "";
		extra.innerHTML = "";
		currentPerks = [];
		currentTitles = [];
		trimPerks = [];
		
		allMisses = loadedJson.All_Misses;
		allRolls = loadedJson.All_Rolls;
		allRollCount = loadedJson.Roll_Count;
		currentCP = loadedJson.Current_CP;
		currentRolls = loadedJson.Current_Rolls;
		missedPerk = loadedJson.Missed_Perk;
		
		var cp = loadedJson.Gained_Perks;
		var hasStarters = false;
		if(reloadStarters) {
			cp = cp.filter(function(p) {
				return (p.Domain!="Starters");
			});
		}
		else {
			for(var p of cp) {
				if(p.Domain=="Starters") {
					hasStarters = true;
					break;
				}
			}
		}
		
		if(!hasStarters) {
			doStarters();
		}
		
		for(var i=0; i<cp.length; i++) {
			var tmpPerk = updatePerk(cp[i]);
			addPerk(tmpPerk,qs("#Freebies").checked,true);
		}
	}
	
	totalPerks = currentPerks.length;
	totalForge = 0;
	var keys = Object.keys(perksNum);
	for(var i=0; i<keys.length; i++) {
		totalForge+=perksNum[keys[i]];
	}
	
	var tp = document.getElementById("TP");
	var tp2 = document.getElementById("TP2");
	var rollNum = document.getElementById('rollNum');
	var mpDiv = document.getElementById('missedPerks');
	var pDiv = document.getElementById('points');
	tp.innerHTML = totalForge;
	tp2.innerHTML = totalPerks;
	rollNum.innerHTML = allRollCount;
	mpDiv.innerHTML = missedPerk;
	pDiv.innerHTML = currentCP;
	
	sleep(10000).then(() => {
		//$("#myFile").val("");
	});
}

function updatePerk(obj) {
	console.log("updatePerk");
	var tmp = null;
	celestial_forge.forEach(function(d) {
		d.Perks.forEach(function(p) {
			if(p.Title.toLowerCase() == obj.Title.toLowerCase() && p.Upper_Source.toLowerCase() == obj.Upper_Source.toLowerCase()) {
				p.Taken = obj.Taken;
				p.Retake_Times = obj.Retake_Times;
				if(!isNull(obj.Dice_List)) {
					p["Dice_List"] = obj.Dice_List;
				}
				tmp = p;
			}
		});
	});
	return tmp;
}

function stopAtPerk() {
	untilPerk = true;
}

function toggleAtPerk() {
	untilPerk = !untilPerk;
}

function runUntilDone() {
	untilPerk = false;
	doRun();
}

function changeWait() {
	doWait = !doWait;
}

function getFileName() {
	console.log("getFileName");
	var fullPath = document.getElementById('myFile').value;
	if(fullPath) {
		var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
		var filename = fullPath.substring(startIndex);
		if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
			filename = filename.substring(1);
		}
		return filename;
	}
	return "";
}

function getTxtFile(fileName) {
	console.log("getTxtFile");
	var client = new XMLHttpRequest();
	client.open('GET', fileName);
	client.onreadystatechange = function() {
		alert(client.responseText);
	}
	client.send();
}

input.addEventListener('change', () => {
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
		if(ext=="js" || ext=="json" || ext=="txt") {
			if(!file.startsWith("var ") && !lines[0].includes("=")) {
				try {
					var obj = JSON.parse(file);
					if(!isNull(obj)) {
						loadedJson = obj;
					}
				}
				catch (error) {
					console.error(error);
				}
			}
		}
		else if(ext=="pdf") {
			
		}
	};
	
	reader.onerror = (e) => alert(e.target.error.name);
	
	reader.readAsText(file);
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

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
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
	showPerk2();
	
	var l1 = $('#Domain').children('option').length;
	var l2 = $('#Domain2').children('option').length;
	if(l1==1) {
		$("#Domain").val($("#Domain option:first").val());
	}
	if(l2==1) {
		$("#Domain2").val($("#Domain2 option:first").val());
	}
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
	showPerk2();
	var l1 = $('#Domain').children('option').length;
	var l2 = $('#Domain2').children('option').length;
	if(l1==1) {
		$("#Domain").val($("#Domain option:first").val());
	}
	if(l2==1) {
		$("#Domain2").val($("#Domain2 option:first").val());
	}
}

document.onkeydown = function(e) {
	e = e || window.event;
	//console.log(e.which,e.keyCode);
	var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
	if(document.activeElement.nodeName!="INPUT" && document.activeElement.nodeName!="TEXTAREA") {
		switch (event.keyCode) {
			case 37:
			//alert('Left key pressed');
			prevPerk();
			break;
			case 38:
			//alert('Up key pressed');
			break;
			case 39:
			//alert('Right key pressed');
			nextPerk();
			break;
			case 40:
			//alert('Down key pressed');
			break;
			case 13:
			//alert('Enter key pressed');
			saveCurrentPerk();
			break;
		}
	}
};

function saveCurrentPerk() {
	console.log("saveCurrentPerk");
	var od2 = document.getElementById('Add_Over_Domains');
	if(od2.value.trim()!="") {
		addOverDomain(od2.value.trim());
		fillDrop();
		od2.value = "";
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
	}
	
	var meh = {
		"Title":$("#Title").val(),
		"Cost":roundCost(parseInt($("#Cost").val())),
		"Description":$("#Description").val(),
		"Dice":$("#Dice").val(),
		"Discount_Multiplier":parseFloat($("#Discount_Multiplier").val()),
		"Discount_Cost":roundCost(parseInt($("#Discount_Cost").val())),
		"Discount":$("#Discount_Req").prop('checked'),
		"Discount_Title":$("#Discount_Title").val(),
		"Domain":$("#Domain").val(),
		"Domain_Number":parseInt($("#Domain_Number").val()),
		"Free":$("#Free_Req").prop('checked'),
		"Free_Title":$("#Free_Title").val(),
		"Lewd":$("#Lewd").prop('checked'),
		"Perk_Number":parseInt($("#Perk_Number").val()),
		"Prereq":$("#Prereq").prop('checked'),
		"Retake":$("#Retake").prop('checked'),
		"Retake_Cost":roundCost(parseInt($("#Retake_Cost").val())),
		"Retake_Multiplier":parseInt($("#Retake_Multiplier").val()),
		"Retake_Times":parseInt($("#Retake_Times").val()),
		"Source":$("#Source").val(),
		"Upper_Source":$("#Upper_Source").val(),
		"Upper_Sources":$("#Upper_Sources").val().split("~|~"),
		"Taken":false,
		"Over_Domain":$("#Over_Domain").val(),
		"Delete":$("#Delete").prop('checked'),
	}
	toAdd[currentPerk] = meh;
}

function resetAdds(obj) {
	toAdd = obj;
	showPerk();
}

function showPerk() {
	console.log("showPerk");
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
	$("#Prereq").prop('checked', isNull(tmp_perk.Prereq) ? false : tmp_perk.Prereq);
	$("#Free_Req").prop('checked', isNull(tmp_perk.Free_Req) ? false : tmp_perk.Free_Req);
	$("#Discount_Req").prop('checked', isNull(tmp_perk.Discount) ? false : tmp_perk.Discount);
	$("#Restrict").prop('checked', isNull(tmp_perk.Restrict) ? false : tmp_perk.Restrict);
	$("#Restrict_Title").val(isNull(tmp_perk.Restrict_Title) ? "" : tmp_perk.Restrict_Title);
	$("#Exclude_Title").val(isNull(tmp_perk.Exclude_Title) ? "" : tmp_perk.Exclude_Title);
	$("#Exclude").prop('checked', isNull(tmp_perk.Exclude) ? false : tmp_perk.Exclude);
	$("#Lewd").prop('checked', isNull(tmp_perk.Lewd) ? false : tmp_perk.Lewd);
	$("#Retake").prop('checked', isNull(tmp_perk.Retake) ? false : tmp_perk.Retake);
	$("#Delete").prop('checked', isNull(tmp_perk.Delete) ? false : tmp_perk.Delete);
	$("#Dupe").prop('checked', isDupe(tmp_perk));
	$("#Retake_Cost").val(isNull(tmp_perk.Retake_Cost) ? 0 : roundCost(tmp_perk.Retake_Cost));
	$("#Retake_Times").val(isNull(tmp_perk.Retake_Times) ? 0 : tmp_perk.Retake_Times);
	$("#Retake_Multiplier").val(isNull(tmp_perk.Retake_Multiplier) ? 1 : tmp_perk.Retake_Multiplier);
	$("#Dice").val(isNull(tmp_perk.Dice) ? "1d1" : tmp_perk.Dice);
	$("#Discount_Multiplier").val(isNull(tmp_perk.Discount_Multiplier) ? 0.5 : tmp_perk.Discount_Multiplier);
	$("#Perk_Number").val(isNull(tmp_perk.Perk_Number) ? -1 : tmp_perk.Perk_Number);
	$("#Domain_Number").val(isNull(tmp_perk.Domain_Number) ? -1 : tmp_perk.Domain_Number);
	$("#Discount_Cost").val(isNull(tmp_perk.Discount_Cost) ? 0 : roundCost(tmp_perk.Discount_Cost));
	var tmpOD = getOverDomain(tmp_perk);
	$("#Over_Domain").val(isNull(tmp_perk.Over_Domain) ? tmpOD : tmp_perk.Over_Domain);
	doUnder(tmp_perk.Over_Domain);
	$("#Domain").val(isNull(tmp_perk.Domain) ? "" : tmp_perk.Domain);
	if($("#Over_Domain").val()=="") {
		sleep(200).then(() => {
			tmpOD = getOverDomain(toAdd[currentPerk]);
			$("#Over_Domain").val(tmpOD);
		});
	}
	if($("#Domain").val()=="") {
		sleep(300).then(() => {
			$("#Domain").val($("#Domain option:first").val());
		});
	}
}

function getOverDomain(obj) {
	console.log("getOverDomain");
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

function cancelProcess() {
	console.log("cancelProcess");
	var tmp = document.getElementById("popUp");
	tmp.classList.add('hidden');
}

function showPerk2() {
	console.log("showPerk2");
	var tmp_perk = toAdd[currentPerk];
	if(isNull(tmp_perk)) return;
	$("#Title2").val(isNull(tmp_perk.Title) ? "" : tmp_perk.Title);
	$("#Source2").val(isNull(tmp_perk.Source) ? "" : tmp_perk.Source);
	$("#Upper_Source2").val(isNull(tmp_perk.Upper_Source) ? "" : tmp_perk.Upper_Source);
	$("#Upper_Sources2").val(isNull(tmp_perk.Upper_Sources) ? "" : tmp_perk.Upper_Sources.join("~|~"));
	$("#Cost2").val(isNull(tmp_perk.Cost) ? 0 : roundCost(tmp_perk.Cost));
	$("#Description2").val(isNull(tmp_perk.Description) ? "" : tmp_perk.Description);
	$("#Prereq_Title2").val(isNull(tmp_perk.Prereq_Title) ? "" : tmp_perk.Prereq_Title);
	$("#Prereq2").prop('checked', isNull(tmp_perk.Prereq) ? false : tmp_perk.Prereq);
	$("#Free_Req2").prop('checked', isNull(tmp_perk.Free_Req) ? false : tmp_perk.Free_Req);
	$("#Lewd2").prop('checked', isNull(tmp_perk.Lewd) ? false : tmp_perk.Lewd);
	$("#Retake2").prop('checked', isNull(tmp_perk.Retake) ? false : tmp_perk.Retake);
	//$("#Delete2").prop('checked', isNull(tmp_perk.Delete) ? false : tmp_perk.Delete);
	$("#Retake_Cost2").val(isNull(tmp_perk.Retake_Cost) ? 0 : roundCost(tmp_perk.Retake_Cost));
	$("#Retake_Times2").val(isNull(tmp_perk.Retake_Times) ? 0 : tmp_perk.Retake_Times);
	$("#Retake_Multiplier2").val(isNull(tmp_perk.Retake_Multiplier) ? 1 : tmp_perk.Retake_Multiplier);
	$("#Dice2").val(isNull(tmp_perk.Dice) ? "1d1" : tmp_perk.Dice);
	$("#Discount_Multiplier2").val(isNull(tmp_perk.Discount_Multiplier) ? 0.5 : tmp_perk.Discount_Multiplier);
	$("#Discount_Cost2").val(isNull(tmp_perk.Discount_Cost) ? 0 : roundCost(tmp_perk.Discount_Cost));
	
	$("#Over_Domain2").val(isNull(tmp_perk.Over_Domain) ? "" : tmp_perk.Over_Domain);
	doUnder2(tmp_perk.Over_Domain);
	$("#Domain2").val(isNull(tmp_perk.Domain) ? "" : tmp_perk.Domain);
	if($("#Domain2").val()=="") {
		$("#Domain2").val($("#Domain2 option:first").val());
	}
}

function toggleHidden() {
	fillDrop();
	showPerk();
	$("#popUp").toggleClass("hidden");
}

function reloadPage() {
	console.log("reloadPage");
	sleep(6000).then(() => {
		window.location.reload(true);
	});
}

function sendJSON(jsonObj,name) {
	console.log("sendJSON");
	let xhr = new XMLHttpRequest();
	let url = "/file";
	
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4 && xhr.status === 200) {
			//result.innerHTML = this.responseText;
			console.log("this.responseText", this.responseText);
			//reloadPage();
		}
	};
	
	var data = JSON.stringify({ "name": name, "jsonObj": jsonObj });
	xhr.send(data);
}

function savePerks() {
	console.log("savePerks");
	if(isEdit && isEditAll) {
		celestial_forge = [];
		var keys = Object.keys(minDomains);
		for(var i=0; i<keys.length; i++) {
			var ukeys = Object.keys(allDomains[keys[i]]);
			for(var j=0; j<ukeys.length; j++) {
				var tmpD = {"Domain": ukeys[j], "Over_Domain": keys[i], "Perks":[]};
				celestial_forge.push(tmpD);
			}
		}
	}
	if(isEdit && !isEditAll) {
		for(var i=0; i<toAdd.length; i++) {
			var dNum = toAdd[i].Domain_Number;
			var pNum = toAdd[i].Perk_Number;
			if(dNum!=-1 && pNum!=-1) {
				celestial_forge[dNum].Perks[pNum] = toAdd[i];
			}
			else if(pNum!=-1 && $("#Filter_Domain").val()!="") {
				var tmpD = $("#Filter_Domain").val();
				celestial_forge[minDomains[tmpD]].Perks[pNum] = toAdd[i];
			}
			else if($("#Filter_Domain").val()!="") {
				var tmpD = $("#Filter_Domain").val();
				celestial_forge[minDomains[tmpD]].Perks[i] = toAdd[i];
			}
			
		}
		if($("#Filter_Domain").val()!="") {
			var tmpD = $("#Filter_Domain").val();
			/*/
				toAdd = toAdd.filter(function(p) {
				return (p.Domain!=tmpD);
				});
			//*/
			//celestial_forge[minDomains[tmpD]].Perks[i]
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
				"Retake_Times":perk.Retake_Times,
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
	sortForge();
	//sendJSON(celestial_forge,"celestial_forge.js");
	saveJson(celestial_forge,"celestial_forge.js");
	//reloadPage();
}

function doUnder(meh) {
	console.log("doUnder");
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

function doUnder2(meh) {
	console.log("doUnder2");
	meh = isNull(meh) ? "" : meh;
	selectDom2.innerHTML = "";
	if(isNull(allDomains[meh])) {
		fillDrop2();
	}
	else {
		var optionsUnder = allDomains[meh];
		for(var j=0; j<optionsUnder.length; j++) {
			var opt2 = optionsUnder[j];
			var el2 = document.createElement("option");
			el2.textContent = opt2;
			el2.value = opt2;
			selectDom2.appendChild(el2);
		}
		if(optionsUnder.length==1) {
			$("#Domain2").val(optionsUnder[0]);
		}
	}
}

function qs(q) {
	return document.querySelector(q);
}

function getAllNotes() {
	console.log("getAllNotes");
	createNotes();
	saveJson(allDomains,"all_domains.js");
	saveJson(allFandoms,"all_fandoms.js");
	saveJson(allSources,"all_sources.js");
	saveJson(celestial_forge,"celestial_forge.js");
}

function createNotes() {
	console.log("createNotes");
	allDomains = [];
	allFandoms = [];
	allSources = [];
	allUpper = {};
	sortForge();
	var count = 0;
	var dcount = 0;
	celestial_forge.forEach(function(d) {
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
			if(!allUpper.hasOwnProperty(p.Source) && !isNull(p.Upper_Source)) {
				//allUpper[p.Source] = p.Upper_Source;
				allUpper[p.Source] = isNull(p.Upper_Sources) ? [p.Upper_Source] : p.Upper_Sources.sort();
			}
			else if(!isNull(p.Upper_Source)) {
				allUpper[p.Source].concat(isNull(p.Upper_Sources) ? [p.Upper_Source] : p.Upper_Sources.sort());
				allUpper[p.Source] = [...new Set(allUpper[p.Source])];
				allUpper[p.Source] = allUpper[p.Source].sort();
			}
			pcount++;
		});
		dcount++;
	});
	allUpper = Object.keys(allUpper).sort().reduce(
		(obj, key) => { 
			obj[key] = allUpper[key]; 
			return obj;
		}, 
		{}
	);
	allFandoms.sort(function(a, b) {
		if (a.toLowerCase() < b.toLowerCase()) {
			return -1;
		}
		if (a.toLowerCase() > b.toLowerCase()) {
			return 1;
		}
		return 0;
	});
	allSources.sort(function(a, b) {
		if (a.toLowerCase() < b.toLowerCase()) {
			return -1;
		}
		if (a.toLowerCase() > b.toLowerCase()) {
			return 1;
		}
		return 0;
	});
}

function saveForge() {
	console.log("saveForge");
	sortForge();
	resetForge();
	saveJson(celestial_forge,"celestial_forge.js");
}

function saveNotes() {
	console.log("saveNotes");
	saveJson(allFandoms,"allFandoms");
	saveJson(allSources,"allSources");
	saveJson(celestial_forge,"celestial_forge");
}

function addOverDomain(txt) {
	console.log("addOverDomain");
	if(!allDomains.hasOwnProperty(txt)) {
		allDomains[txt] = [txt];
		celestial_forge.push({"Domain":txt,"Over_Domain":txt,"Perks":[]});
	}
}

function addDomain(over, txt) {
	console.log("addDomain");
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

var Filter_Over_Domain = document.getElementById("Filter_Over_Domain");
Filter_Over_Domain.onchange = function() {
	fillFilterDrop();
};

function fillFilterUpperDrop() {
	console.log("fillFilterUpperDrop");
	Filter_Over_Domain.innerHTML = "";
	
	var tmpOpt2 = document.createElement("option");
	tmpOpt2.textContent = "Select One";
	tmpOpt2.value = "";
	Filter_Over_Domain.appendChild(tmpOpt2);
	
	var optionsOver = Object.keys(allDomains);
	for(var i=0; i<optionsOver.length; i++) {
		var opt = optionsOver[i];
		var el = document.createElement("option");
		el.textContent = opt;
		el.value = opt;
		Filter_Over_Domain.appendChild(el);
	}
}

function fillFilterDrop() {
	console.log("fillFilterDrop");
	var Filter_Domain = document.getElementById("Filter_Domain");
	Filter_Domain.innerHTML = "";
	
	var tmpOpt = document.createElement("option");
	tmpOpt.textContent = "Select One";
	tmpOpt.value = "";
	Filter_Domain.appendChild(tmpOpt);
	
	var optionsOver = Object.keys(allDomains);
	if(Filter_Over_Domain.value=="") {
		for(var i=0; i < optionsOver.length; i++) {
			var optionsUnder = allDomains[optionsOver[i]];
			for(var j=0; j<optionsUnder.length; j++) {
				var opt2 = optionsUnder[j];
				var el2 = document.createElement("option");
				el2.textContent = opt2;
				el2.value = opt2;
				Filter_Domain.appendChild(el2);
			}
		}
	}
	else {
		var optionsUnder = allDomains[Filter_Over_Domain.value];
		for(var j=0; j<optionsUnder.length; j++) {
			var opt2 = optionsUnder[j];
			var el2 = document.createElement("option");
			el2.textContent = opt2;
			el2.value = opt2;
			Filter_Domain.appendChild(el2);
		}
	}
}

function fillDrop() {
	console.log("fillDrop");
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
		//selectDom.value = optionsUnder[0];
	}
}

function fillDrop2() {
	console.log("fillDrop2");
	selectOver2.innerHTML = "";
	selectDom2.innerHTML = "";
	var tmpOpt = document.createElement("option");
	var tmpOpt2 = document.createElement("option");
	tmpOpt2.textContent = "Select One";
	tmpOpt.textContent = "Select One";
	tmpOpt2.value = "";
	tmpOpt.value = "";
	selectOver2.appendChild(tmpOpt);
	selectDom2.appendChild(tmpOpt2);
	
	var optionsOver = Object.keys(allDomains);
	for(var i=0; i < optionsOver.length; i++) {
		var opt = optionsOver[i];
		var el = document.createElement("option");
		el.textContent = opt;
		el.value = opt;
		selectOver2.appendChild(el);
		var optionsUnder = allDomains[optionsOver[i]];
		for(var j=0; j<optionsUnder.length; j++) {
			var opt2 = optionsUnder[j];
			var el2 = document.createElement("option");
			el2.textContent = opt2;
			el2.value = opt2;
			selectDom2.appendChild(el2);
		}
		//selectDom2.value = optionsUnder[0];
	}
}

function findWord(txt) {
	return wordList.includes(txt);
}

function inForge(res) {
	console.log("inForge");
	var margin = .9;
	var shouldSkip = false;
	celestial_forge.forEach(function(d) {
		d.Perks.forEach(function(e) {
			if (shouldSkip) {
				return;
			}
			if(e.Source.toLowerCase() == res.Source.toLowerCase() && e.Title.toLowerCase() == res.Title.toLowerCase()) {
				shouldSkip = true;
			}
			else if(e.Source.toLowerCase() == res.Source.toLowerCase() && compairThis(e.Description,res.Description,margin) >= margin) {
				shouldSkip = true;
			}
		});
	});
	return shouldSkip;
}

function sourceOrginRoller(str) {
	//source_origins
}

function getMulti(obj) {
	console.log("getMulti");
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

function uniqueTitles(obj) {
	console.log("uniqueTitles");
	var titleArray = [];
	var perks = [];
	$.each(obj.Perks, function(index, value) {
		if ($.inArray(value.Title.toLowerCase(), titleArray) === -1) {
			titleArray.push(value.Title.toLowerCase());
			perks.push(value);
		}
	});
	return perks;
}

function sameTitles(obj) {
	console.log("sameTitles");
	var titleArray = [];
	var perks = [];
	$.each(obj.Perks, function(index, value) {
		if ($.inArray(value.Title.toLowerCase()+"_"+value.Source.toLowerCase(), titleArray) === -1) {
			titleArray.push(value.Title.toLowerCase()+"_"+value.Source.toLowerCase());
		}
		else {
			perks.push(value);
		}
	});
	return perks;
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

function sameTitleDomain() {
	console.log("sameTitleDomain");
	var titleArray = [];
	var uniqueArray = [];
	var matchArray = [];
	var perks = [];
	$.each(celestial_forge, function(index, item) {
		$.each(item.Perks, function(idx,value) {
			if(!isNull(value)) {
				if ($.inArray(value.Title.toLowerCase()+"_"+value.Source.toLowerCase(), titleArray) === -1) {
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
		delete celestial_forge[deleteMe.Domain_Number].Perks[deleteMe.Perk_Number];
	}
	celestial_forge = celestial_forge.filter(function(p) {
		return (!isNull(p));
	});
	celestial_forge.forEach(function(d) {
		d.Perks = d.Perks.filter(function(p) {
			return (!isNull(p));
		});
	});
}

function sameTitleUpper() {
	console.log("sameTitleUpper");
	sortForge();
	var titleArray = [];
	var perks = [];
	$.each(celestial_forge, function(index, item) {
		$.each(item.Perks, function(idx,value) {
			if(!isNull(value)) {
				if ($.inArray(value.Title.toLowerCase()+"_"+value.Upper_Source.toLowerCase(), titleArray) === -1) {
					titleArray.push(value.Title.toLowerCase()+"_"+value.Upper_Source.toLowerCase());
				}
				else {
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
	return saveJson(perks,"SamePerksUpper");
}

function checkPerk(jsonObj,overStr) {
	if(isNull(jsonObj.Title)) {
		jsonObj["Title"] = "";
	}
	if(isNull(jsonObj.Domain)) {
		jsonObj["Domain"] = "Add";
	}
	if(isNull(jsonObj.Restrict)) {
		jsonObj["Restrict"] = false;
	}
	if(isNull(jsonObj.Restrict_Title)) {
		jsonObj["Restrict_Title"] = "";
	}
	if(isNull(jsonObj.Exclude)) {
		jsonObj["Exclude"] = false;
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
	if(isNull(jsonObj.Retake_Multiplier)) {
		jsonObj["Retake_Multiplier"] = 1;
	}
	if(isNull(jsonObj.Retake_Times)) {
		jsonObj["Retake_Times"] = 0;
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
	if(isNull(jsonObj.Lewd)) {
		jsonObj["Lewd"] = false;
	}
	if(isNull(jsonObj.Discount_Title)) {
		jsonObj["Discount_Title"] = "";
	}
	if(isNull(jsonObj.Discount_Multiplier)) {
		jsonObj["Discount_Multiplier"] = 0.5;
	}
	if(isNull(jsonObj.Discount)) {
		jsonObj["Discount"] = false;
	}
	if(isNull(jsonObj.Free_Title)) {
		jsonObj["Free_Title"] = "";
	}
	if(isNull(jsonObj.Free_Req)) {
		jsonObj["Free"] = false;
	}
	if(isNull(jsonObj.Prereq_Title)) {
		jsonObj["Prereq_Title"] = "";
	}
	if(isNull(jsonObj.Prereq)) {
		jsonObj["Prereq"] = "";
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
		jsonObj["Source"] = "";
	}
	if(isNull(jsonObj.Upper_Source)) {
		jsonObj["Upper_Source"] = jsonObj.Source;
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

function checkPerks() {
	console.log("checkPerks");
	celestial_forge.forEach(function(d) {
		d.Perks.forEach(function(p,idx,theArr) {
			theArr[idx] = checkPerk(p,d.Over_Domain);
		});
	});
}

function similarTitleDomain() {
	console.log("similarTitleDomain");
	sortForge();
	var titleArray = [];
	var perks = [];
	$.each(celestial_forge, function(index, item) {
		$.each(item.Perks, function(idx,value) {
			if ($.inArray(value.Title.toLowerCase(), titleArray) === -1) {
				titleArray.push(value.Title.toLowerCase());
			}
			else {
				perks.push(value);
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
	return perks;
}

function parseFile() {
	console.log("parseFile");
	toAdd = [];
	if(importFile.length == 0) {
		return toAdd;
	}
	createNotes();
	var nOver_Domain = "";
	var trimedPerk = emptyPerk();
	for(var i=0; i<importFile.length; i++) {
		var parseLine = importFile[i].trim();
		parseLine = parseLine.replaceAll("\\r","<br/>");
		if(isDomain(parseLine)) {
			nOver_Domain = parseLine.replaceAll("=","");
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
			trimedPerk["Over_Domain"] = nOver_Domain;
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
					trimedPerk["Prereq"] = true;
				}
				if(freereqReg1.test(parseLine)) {
					if(isNull(trimedPerk["Free_Title"])) {
						trimedPerk["Free_Title"] = parseLine.match(freereqReg1)[1].trim();
					}
					else {
						trimedPerk["Free_Title"] = trimedPerk["Free_Title"] + " && " + parseLine.match(freereqReg1)[1].trim();
					}
					trimedPerk["Free"] = true;
				}
				if(discountreqReg1.test(parseLine)) {
					if(isNull(trimedPerk["Discount_Title"])) {
						trimedPerk["Discount_Title"] = parseLine.match(discountreqReg1)[1].trim();
					}
					else {
						trimedPerk["Discount_Title"] = trimedPerk["Discount_Title"] + " && " + parseLine.match(discountreqReg1)[1].trim();
					}
					trimedPerk["Discount"] = true;
				}
				if(restrictreqReg1.test(parseLine)) {
					if(isNull(trimedPerk["Restrict_Title"])) {
						trimedPerk["Restrict_Title"] = parseLine.match(restrictreqReg1)[1].trim();
					}
					else {
						trimedPerk["Restrict_Title"] = trimedPerk["Restrict_Title"] + " && " + parseLine.match(restrictreqReg1)[1].trim();
					}
					trimedPerk["Restrict"] = true;
				}
				if(excludereqReg1.test(parseLine)) {
					if(isNull(trimedPerk["Exclude_Title"])) {
						trimedPerk["Exclude_Title"] = parseLine.match(excludereqReg1)[1].trim();
					}
					else {
						trimedPerk["Exclude_Title"] = trimedPerk["Exclude_Title"] + " && " + parseLine.match(excludereqReg1)[1].trim();
					}
					trimedPerk["Restrict"] = true;
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
				if(freereqReg1.test(parseLine)) {
					if(isNull(trimedPerk["Prereq_Title"])) {
						trimedPerk["Free_Title"] = parseLine.match(freereqReg1)[1].trim();
					}
					else {
						trimedPerk["Free_Title"] = trimedPerk["Free_Title"] + " && " + parseLine.match(freereqReg1)[1].trim();
					}
					trimedPerk["Free"] = true;
				}
				if(discountreqReg1.test(parseLine)) {
					if(isNull(trimedPerk["Prereq_Title"])) {
						trimedPerk["Discount_Title"] = parseLine.match(discountreqReg1)[1].trim();
					}
					else {
						trimedPerk["Discount_Title"] = trimedPerk["Discount_Title"] + " && " + parseLine.match(discountreqReg1)[1].trim();
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
				if(trimedPerk.Discount_Title.includes("&&") || trimedPerk.Discount_Title.includes("||")) {
					trimedPerk.Discount_Title = "("+trimedPerk.Discount_Title+")";
				}
			}
			if(!isNull(trimedPerk.Free_Title)) {
				if(trimedPerk.Free_Title.includes("&&") || trimedPerk.Free_Title.includes("||")) {
					trimedPerk.Free_Title = "("+trimedPerk.Free_Title+")";
				}
			}
			if(!isNull(trimedPerk.Prereq_Title)) {
				if(trimedPerk.Prereq_Title.includes("&&") || trimedPerk.Prereq_Title.includes("||")) {
					trimedPerk.Prereq_Title = "("+trimedPerk.Prereq_Title+")";
				}
			}
			toAdd.push(trimedPerk);
			trimedPerk = emptyPerk();
		}
	}
}

function checkAdds() {
	console.log("checkAdds");
	var meh = [];
	for(var i=0; i<toAdd.length; i++) {
		meh.push(toAdd[i]);
		meh[i]["Added"] = inForge(toAdd[i]);
	}
	return meh;
}

function isDomain(txt) {
	console.log("isDomain");
	var regex = new RegExp(/^\=([^=\n\r]+)\=/g);
	return regex.test(txt);
}

function isTitle(txt) {
	console.log("isTitle");
	var regex = new RegExp(/\{([0-9\+\-\/\\]+)\}/g);
	if((txt.endsWith("}") && txt.includes("{")) && (txt.includes(">") && txt.includes("<"))) {
		return regex.test(txt);
	}
	
	return 0;
}

function multiReq(txt) {
	console.log("multiReq");
	return (
		prereqReg1.test(txt) 
		|| freereqReg1.test(txt) 
		|| discountreqReg1.test(txt) 
		|| restrictreqReg1.test(txt)
		|| excludereqReg1.test(txt)
	);
}

function isPrereq(txt) {
	console.log("isPrereq");
	if(txt.startsWith("[Require")) {
		return true;
	}
	
	return prereqReg.test(txt);
}

function isRestrict(txt) {
	console.log("isRestrict");
	if(txt.startsWith("[Restrict")) {
		return true;
	}
	
	return restrictreqReg1.test(txt);
}

function isFreereq(txt) {
	console.log("isFreereq");
	if(txt.startsWith("[Free")) {
		return true;
	}
	
	return freereqReg.test(txt);
}

function isDiscountreq(txt) {
	console.log("isDiscountreq");
	if(txt.startsWith("[Discount")) {
		return true;
	}
	
	return discountreqReg.test(txt);
}

function isBullet(txt) {
	console.log("isBullet");
	if(txt.startsWith("-") || txt.startsWith("+") || txt.startsWith("●") || txt.startsWith("*")) {
		return true;
	}
	var regex = new RegExp(/^([A-Za-z0-9]+):/);
	return regex.test(txt);
}

function findBestMatch(res) {
	console.log("findBestMatch");
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

function emptyPerk() {
	console.log("emptyPerk");
	var meh = {
		"Title":"",
		"Source":"",
		"Cost":"",
		"Description":""
	}
	return meh;
}

qs("#last_points").innerText = "" + currentCP;
qs("#points").innerText = "" + currentCP;
qs("#missedPerks").innerText = "" + missedPerk;
qs("#cur_cost").innerText = "" + 0;

function doStarters() {
	console.log("doStarters");
	var extra = document.getElementById("extra");
	var perks = document.getElementById("perks");
	perks.innerHTML = "";
	extra.innerHTML = "";
	currentPerks = [];
	currentTitles = [];
	trimPerks = [];
	
	var meh = [];
	for(var i=0; i<celestial_forge.length; i++) {
		if(celestial_forge[i].Domain == "Starters") {
			meh = celestial_forge[i].Perks;
		}
	}
	meh.forEach(function(d) {
		addPerk(d,false);
		if(isNull(celestial_forge[d.Domain_Number].Perks[d.Perk_Number])) {
			celestial_forge[d.Domain_Number].Perks[d.Perk_Number]["Taken"] = true;
		}
		else {
			celestial_forge[d.Domain_Number].Perks[d.Perk_Number].Taken = true;
		}
	});
	perksNum["Starters"]=0;
	createNotes();
	redoPerkCheckList();
	sleep(2000).then(() => {
		qs("#Starters").innerText = "Starters (0)";
	});
	
	totalPerks = currentPerks.length;
	var keys = Object.keys(perksNum);
	totalForge = 0;
	for(var i=0; i<keys.length; i++) {
		totalForge+=perksNum[keys[i]];
	}
	var tp = document.getElementById("TP");
	var tp2 = document.getElementById("TP2");
	tp.innerHTML = totalForge;
	tp2.innerHTML = totalPerks;
}

function addPerk(res,doFrees,isLoad,addCount) {
	console.log("addPerk");
	if(isNull(isLoad)) isLoad = false;
	if(isNull(addCount)) addCount = 0;
	if(isNull(res)) return;
	if(isLoad) {
		if(isNull(res.Retake_Count)) {
			res["Retake_Count"] = 0;
		}
		else if(res.Retake_Count>=addCount) {
			return;
		}
	}
	
	var trimed = trimPerk(res);
	var frees = [];
	var ct = res.Title+"-"+res.Upper_Source;
	
	var extra = document.getElementById("extra");
	var perks = document.getElementById("perks");
	var subTitle = "";
	
	if(res.Domain == "Starters" && isLoad) {
		doFrees = false;
	}
	
	if(!trimPerks.includes(trimed) && !currentTitles.includes(ct)) {
		trimPerks.push(trimed);
		currentPerks.push(res);
		currentTitles.push(res.Title+"-"+res.Upper_Source);
		
		if(res.Dice != "1d1") {
			if(isLoad) {
				subTitle = res.Dice_List[addCount];
				if(subTitle=="") {
					res.Dice_List = res.Dice_List.filter(function(p) { return p!=""});
					subTitle = doSubRoll(res,res.Dice_List);
					res.Dice_List[addCount] = subTitle;
				}
			}
			else {
				if(!isNull(res.Dice_List) && !res.Taken) {
					if(res.Retake_Count<res.Dice_List.length) {
						subTitle = res.Dice_List[res.Retake_Count];
						if(subTitle=="") {
							res.Dice_List = res.Dice_List.filter(function(p) { return p!=""});
							subTitle = doSubRoll(res,res.Dice_List);
							res.Dice_List[res.Retake_Count] = subTitle;
						}
					}
					else {
						var Dice_List = getDiceList(res,isLoad);
						subTitle = doSubRoll(res,res.Dice_List);
						res.Dice_List.push(subTitle);
					}
				}
				else {
					var Dice_List = getDiceList(res,isLoad);
					subTitle = doSubRoll(res,res.Dice_List);
					res.Dice_List.push(subTitle);
				}
			}
		}
		
		var title = res.Title + " [" + res.Domain + "] (" + res.Source + ") (" + res.Cost + "CP)";
		if(subTitle!="") {
			title = res.Title + ": "+subTitle+" [" + res.Domain + "] (" + res.Source + ") (" + res.Cost + "CP)";
		}
		var title2 = document.createElement('h5');
		title2.innerText = title;
		var ptext = document.createElement('p');
		ptext.innerHTML = res.Description;
		res.Taken = true;
		if(!isLoad) res.Retake_Count++;
		
		perks.appendChild(title2);
		perks.appendChild(ptext);
	}
	else if(res.Retake) {
		if(res.Dice != "1d1") {
			if(isLoad) {
				subTitle = res.Dice_List[addCount];
				if(subTitle=="") {
					res.Dice_List = res.Dice_List.filter(function(p) { return p!=""});
					subTitle = doSubRoll(res,res.Dice_List);
					res.Dice_List[addCount] = subTitle;
				}
			}
			else {
				if(!isNull(res.Dice_List) && !res.Taken) {
					if(res.Retake_Count<res.Dice_List.length) {
						subTitle = res.Dice_List[res.Retake_Count];
						if(subTitle=="") {
							res.Dice_List = res.Dice_List.filter(function(p) { return p!=""});
							subTitle = doSubRoll(res,res.Dice_List);
							res.Dice_List[res.Retake_Count] = subTitle;
						}
					}
					else {
						var Dice_List = getDiceList(res,isLoad);
						subTitle = doSubRoll(res,res.Dice_List);
						res.Dice_List.push(subTitle);
					}
				}
				else {
					var Dice_List = getDiceList(res,isLoad);
					subTitle = doSubRoll(res,Dice_List);
					res.Dice_List.push(subTitle);
				}
			}
		}
		
		console.log("subTitle",subTitle);
		var title = res.Title + " [" + res.Domain + "] (" + res.Source + ") (" + res.Cost + "CP)";
		if(subTitle!="") {
			title = res.Title + ": "+subTitle+" [" + res.Domain + "] (" + res.Source + ") (" + res.Cost + "CP)";
		}
		var title2 = document.createElement('h5');
		title2.innerText = title;
		var ptext = document.createElement('p');
		ptext.innerHTML = res.Description;
		res.Taken = true;
		if(!isLoad) res.Retake_Count++;
		
		perks.appendChild(title2);
		perks.appendChild(ptext);
	}
	if(isLoad) {
		if(!isNull(res.Retake_Count)) {
			if(res.Retake_Count<addCount) {
				addPerk(res,doFrees,isLoad,addCount++);
			}
		}
	}
	if(doFrees) {
		frees = doFree(res);
		addFreebies(res,frees,isLoad);
	}
	
	totalPerks = currentPerks.length;
	var keys = Object.keys(perksNum);
	totalForge = 0;
	for(var i=0; i<keys.length; i++) {
		totalForge+=perksNum[keys[i]];
	}
	var tp = document.getElementById("TP");
	var tp2 = document.getElementById("TP2");
	tp.innerHTML = totalForge;
	tp2.innerHTML = totalPerks;
}

function isNull(meh) {
	console.log("isNull");
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

function capital(txt) {
	if(txt.length == 1) {
		return txt.toUpperCase();
	}
	return txt.charAt(0).toUpperCase() + txt.substr(1);
}

function capitalSentance(txt) {
	console.log("capitalSentance");
	var tmpTxt = stripString(txt);
	var regex = new RegExp(/^([A-Z ]+)/g);
	if(regex.test(tmpTxt) && tmpTxt.length!=1) {
		txt = txt.toLowerCase();
	}
	if(txt.length == 1) {
		return txt.toUpperCase();
	}
	var words = txt.split(" ");
	for(var i=0; i<words.length; i++) {
		words[i] = capital(words[i]);
	}
	return words.join(" ");
}

function isOrigins(obj) {
	for(var d of source_origins) {
		for(var p1 of d.Origins.Background) {
			if(p1.Source==obj.Source && p1.Title==obj.Title) {
				return true;
			}
			if(p1.Upper_Source==obj.Upper_Source && p1.Title==obj.Title) {
				return true;
			}
		}
		for(var p2 of d.Origins.Species) {
			if(p2.Source==obj.Source && p2.Title==obj.Title) {
				return true;
			}
			if(p2.Upper_Source==obj.Upper_Source && p2.Title==obj.Title) {
				return true;
			}
		}
	}
	return false;
}

function addOrigin(obj) {
	var isAdded = false;
	source_origins.forEach(function(d) {
		if(d.Source.toLowerCase()==obj.Source.toLowerCase()) {
			isAdded = true;
			if(obj.Domain.toLowerCase().includes("background")) {
				if(!isOrigins(obj)) d.Origins.Background.push(obj);
			}
			if(obj.Domain.toLowerCase().includes("species")) {
				if(!isOrigins(obj)) d.Origins.Species.push(obj);
			}
		}
	});
	if(!isAdded) {
		var tmpD = {"Source":obj.Source,"Upper_Source":obj.Upper_Source,"Origins":{"Background":[],"Species":[]}};
		if(obj.Domain.toLowerCase().includes("background")) {
			if(!disOrigins(obj)) tmpD.Origins.Background.push(obj);
		}
		if(obj.Domain.toLowerCase().includes("species")) {
			if(!isOrigins(obj)) tmpD.Origins.Species.push(obj);
		}
		source_origins.push(tmpD);
	}
}

function saveOrigins() {
	//source_origins
	source_origins.sort(function(a, b) {
		if (a.Source.toLowerCase() < b.Source.toLowerCase()) {
			return -1;
		}
		if (a.Source.toLowerCase() > b.Source.toLowerCase()) {
			return 1;
		}
		return 0;
	});
	source_origins.forEach(function(d) {
		d.Origins.Background = d.Origins.Background.sort(function(a, b) {
			if (a.Title.toLowerCase() < b.Title.toLowerCase()) {
				return -1;
			}
			if (a.Title.toLowerCase() > b.Title.toLowerCase()) {
				return 1;
			}
			return 0;
		});
		d.Origins.Species = d.Origins.Species.sort(function(a, b) {
			if (a.Title.toLowerCase() < b.Title.toLowerCase()) {
				return -1;
			}
			if (a.Title.toLowerCase() > b.Title.toLowerCase()) {
				return 1;
			}
			return 0;
		});
	});
	saveJson(source_origins,"source_origins.js");
}

function sortForge() {
	console.log("sortForge");
	celestial_forge.sort(function(a, b) {
		if (a.Domain.toLowerCase() < b.Domain.toLowerCase()) {
			return -1;
		}
		if (a.Domain.toLowerCase() > b.Domain.toLowerCase()) {
			return 1;
		}
		return 0;
	});
	var simP = [];
	var domainCount = 0;
	celestial_forge.forEach(function(d) {
		totalForge+=d.Perks.length;
		var perkCount = 0;
		d.Perks = d.Perks.sort(function(a, b) {
			if (a.Title.toLowerCase() < b.Title.toLowerCase()) {
				return -1;
			}
			if (a.Title.toLowerCase() > b.Title.toLowerCase()) {
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
	sameTitleDomain();
}

function isDupe(obj) {
	console.log("isDupe");
	for(var d of celestial_forge) {
		for(var p of d.Perks) {
			if(p.Title.toLowerCase() == obj.Title.toLowerCase() && p.Source.toLowerCase() == obj.Source.toLowerCase()) {
				return true;
			}
		}
	}
	return false;
}

function selectAllDomain() {
	console.log("selectAllDomain");
	toggleDomain.forEach(function(p,idx,theArr) {
		theArr[idx] = true;
	});
	var dm = qs("#roll")[2].children[2].children;
	if(dm[0].checked) {
		dm[3].checked = false;
		for (var i = 4; i < dm.length; i++) {
			if(dm[i].nodeName === "INPUT") {
				dm[i].checked = true;
			}
		}
	}
}

function selectAllCost() {
	console.log("selectAllCost");
	toggleCost = saveCost;
	var pr = qs("#roll")[2].children[1].children;
	if(pr[0].checked) {
		pr[3].checked = false;
		for (i = 4; i < pr.length; i++) {
			if(pr[i].nodeName === "INPUT") {
				pr[i].checked = true;
			}
		}
	}
}

function selectNoDomain() {
	console.log("selectNoDomain");
	toggleDomain.forEach(function(p,idx,theArr) {
		theArr[idx] = false;
	});
	var dm = qs("#roll")[2].children[2].children;
	if(dm[3].checked) {
		dm[0].checked = false;
		for (i = 4; i < dm.length; i++) {
			if(dm[i].nodeName === "INPUT") {
				dm[i].checked = false;
			}
		}
	}
}

function selectNoCost() {
	console.log("selectNoCost");
	toggleCost = [];
	var pr = qs("#roll")[2].children[1].children;
	if(pr[3].checked) {
		pr[0].checked = false;
		for (i = 4; i < pr.length; i++) {
			if(pr[i].nodeName === "INPUT") {
				pr[i].checked = false;
			}
		}
	}
}

var colapseable = false;
function redoPerkCheckList() {
	console.log("redoPerkCheckList");
	qs("#dmn").innerHTML = "";
	
	//*/
	qs("#dmn").innerHTML += '<input type="checkbox" name="dmn" onclick="selectAllDomain()" checked value=""><label>Select All</label><br>';
	qs("#dmn").innerHTML += '<input type="checkbox" name="dmn" onclick="selectNoDomain()" value=""><label>Select None</label><br>';
	//*/
	
	/*/
		var keys = Object.keys(allDomains);
		for(var i=0; i<keys.length; i++) {
		qs("#dmn").innerHTML += '<div class="collapsible" id="section1">'+keys[i]+'<span></span></div>';
		qs("#dmn").innerHTML += '<div class="container">';
		for(var j=0; j<allDomains[keys[i]].length; j++) {
		var d = celestial_forge[minDomains[allDomains[keys[i]][j]]];
		perksNum[d.Domain]=d.Perks.length;
		if(isNull(d.Domain)) console.log(d);
		var id = d.Domain.replace(reg,"_");
		id = id.split(" ").join("_");
		qs("#dmn").innerHTML += '<input type="checkbox" name="dmn" checked value="'+d.Domain+'"><label id="'+id+'">'+d.Domain+' ('+perksNum[d.Domain]+')</label><br>';
		}
		qs("#dmn").innerHTML += '</div>';
		}
	//*/
	
	//*/
	toggleDomain = [];
	var dNum = 0;
	celestial_forge.forEach(function(d) {
		domainNumber[d.Domain] = dNum;
		toggleDomain.push(true);
		perksNum[d.Domain]=d.Perks.length;
		if(isNull(d.Domain)) console.log(d);
		var id = d.Domain.replace(reg,"_");
		id = id.split(" ").join("_");
		qs("#dmn").innerHTML += '<input type="checkbox" name="dmn" checked onclick=toggleDomains("'+d.Domain+'") value="'+d.Domain+'"><label id="'+id+'">'+d.Domain+' ('+perksNum[d.Domain]+')</label><br>';
		dNum++;
	});
	saveDomain = toggleDomain;
	//*/
	
	prcs = [];
	
	celestial_forge.forEach(function(d) {
		d.Perks.forEach(function(f) {
			prcs.push(f.Cost);
		});
	});
	
	prcs = [...new Set(prcs)];
	
	prcs.sort(function(a, b) {
		return a - b
	});
	
	qs("#prc").innerHTML = "";
	
	//*/
	qs("#prc").innerHTML += '<input type="checkbox" name="prc" onclick="selectAllCost()" checked value=""><label>Select All</label><br>';
	qs("#prc").innerHTML += '<input type="checkbox" name="prc" onclick="selectNoCost()" value=""><label>Select None</label><br>';
	//*/
	
	toggleCost = [];
	prcs.forEach(function(d) {
		toggleCost.push(""+d);
		qs("#prc").innerHTML += '<input type="checkbox" name="prc" onclick=toggleCosts("'+d+'") value ="' + d + '" checked><label>' + d + '</label><br>';
	});
	saveCost = toggleCost;
	
	$('.collapsible').collapsible({
        defaultOpen: ''
	});
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

function processFile(bypass) {
	console.log("processFile");
	if(isNull(bypass)) bypass = false;
	var meh = true;
	if(!bypass) meh = parseFile();
	if(toAdd.length > 0) {
		fillDrop();
		toAdd = [...new Set(toAdd)];
		isEdit = false;
		
		toAdd = toAdd.filter(word => word.Title.length > 0);
		prevPerk();
		$("#popUp").toggleClass("hidden");
		$("#myFile").val("");
	}
	return meh;
}

function setForgeEdit() {
	console.log("setForgeEdit");
	toAdd = [];
	var tmpD = $("#Filter_Domain").val();
	if(tmpD=="") {
		celestial_forge.forEach(function(d) {
			d.Perks.forEach(function(p) {
				var tmp = p;
				tmp["Over_Domain"] = getOverDomain(p);
				toAdd.push(tmp);
			});
		});
	}
	else {
		celestial_forge[minDomains[tmpD]].Perks.forEach(function(p) {
			var tmp = p;
			tmp["Over_Domain"] = getOverDomain(p);
			toAdd.push(tmp);
		});
	}
}

var isEditSet = false;
var isEdit = false;
var isEditAll = false;
function editForge() {
	console.log("editForge");
	setForgeEdit();
	currentPerk = 0;
	
	if(toAdd.length > 0) {
		fillDrop();
		isEdit = true;
		if($("#Filter_Domain").val()=="") {
			isEditAll = true;
		}
		else {
			isEditAll = false;
		}
		prevPerk();
		$("#popUp").toggleClass("hidden");
	}
}

function compairTwo(o1,o2) {
	console.log("compairTwo");
	var k1 = Object.keys(o1).sort();
	var k2 = Object.keys(o2).sort();
	var missed = [];
	var count = 0;
	var min_size = (k1.length > k2.length) ? k2.length : k1.length;
	if(o1==o2) return {"match":1,"missed":missed};
	if(o1.source == o2.source && o1.Title == o2.Title) {
		return {"match":1,"missed":missed};
	}
	for (var i=0; i<min_size; i++) {
		if(o1[k1[i]] == o2[k1[i]] || o1[k2[i]] == o2[k2[i]]) {
			count++;
		}
		else {
			if(k1[i] == k2[i]) {
				missed.push(k1[i]);
			}
			else {
				missed.push(k1[i]);
				missed.push(k2[i]);
			}
		}
	}
	return {"match":(count/min_size),"missed":missed};
}

function compairMany(a1,o1,isList) {
	console.log("compairMany");
	if(isNull(isList)) {
		isList = false;
	}
	if(isNull(a1)) a1 = [];
	var tmpArr = [];
	for(var i=0; i<a1.length; i++) {
		tmpArr.push(trimPerk(a1[i]));
	}
	var tmpTrim = trimPerk(o1);
	var returnMe = [];
	var has = false;
	for(var i=0; i<a1.length; i++) {
		var tmpData = compairTwo(a1[i],tmpTrim);
		if(tmpData.match != 1 && tmpData.match < .6) {
			returnMe.push(tmpData);
		}
		else {
			has = true;
		}
	}
	if(isList) {
		return returnMe.push(tmpData);
	}
	else {
		return has;
	}
}

function roll(dmf,pf) {
	console.log("roll");
	pl = [];
	for (i = 0; i < dmf.length; i++) {
		if (dmf[i]) {
			pl = pl.concat(celestial_forge[i].Perks);
		}
	}
	if (pf != null) {
		pl = pl.filter(function(p) {
			return pf.includes(p.Cost.toString())
		});
	}
	return pl[Math.floor(Math.random()*pl.length)];
}

qs("#roll").onsubmit = function(e) {
	e.preventDefault();
	doRoll();
}

qs("#newPerk").onsubmit = function(e) {
	e.preventDefault();
}

qs("#pickPerks").onsubmit = function(e) {
	e.preventDefault();
}

function trimPerk(res) {
	console.log("trimPerk");
	if(isNull(res)) return null;
	var desc = stripString(res.Description);
	var meh = {
		"Title":stripString(res.Title),
		"Upper_Source":stripString(res.Upper_Source),
		"Domain":res.Domain,
		"Over_Domain":res.Over_Domain,
	}
	return meh;
}

function stripString(str) {
	str = ""+str;
	str = str.toLowerCase();
	str = str.replaceAll(/[^a-z0-9 \-]/ig,"");
	return str;
}

function findPrereq(obj) {
	console.log("findPrereq");
	var found = false;
	var tmp = [];
	var titleMatch = [];
	if(obj.Prereq_Title.includes("&&") || obj.Prereq_Title.includes("||")) {
		var tmpTitles = obj.Prereq_Title.replaceAll("(","");
		tmpTitles = tmpTitles.replaceAll(")","");
		var tmpTitleMatch = tmpTitles.split(/(\&\&|\|\|)/);
		for(var i=0; i<tmpTitleMatch.length; i++) {
			tmpTitleMatch[i] = tmpTitleMatch[i].trim();
			if(tmpTitleMatch[i]!="&&" && tmpTitleMatch[i]!="||") {
				titleMatch.push(tmpTitleMatch[i]);
			}
		}
	}
	else {
		titleMatch.push(obj.Prereq_Title.toLowerCase()+"-"+obj.Upper_Source.toLowerCase());
	}
	celestial_forge.forEach(function(d) {
		d.Perks.forEach(function(p) {
			var pTitle = p.Title.toLowerCase()+"-"+p.Upper_Source.toLowerCase();
			if(titleMatch.includes(pTitle)) {
				tmp.push(p);
			}
		});
	});
	return tmp;
}

function roundCost(obj) {
	console.log("roundCost");
	var value = Math.round(obj);
	var remainder = obj % 50;
	remainder = Math.floor(remainder);
	value = value - remainder;
	return value;
}

function getMultiplier(multiplier,times) {
	console.log("getMultiplier");
	if(multiplier==1) {
		return 1;
	}
	else {
		var multi = (times - 1);
		if(multi < 1) multi = 1;
		return multiplier * multi;
	}
}

function attemptPrereq(res) {
	console.log("attemptPrereq");
	var prereqPerk = findPrereq(res);
	if(!isNull(prereqPerk)) {
		var result = true;
		var prereqList = prereqPerk;
		var i = 0;
		
		while(i<prereqList.length && result) {
			var addCurrent = true;
			prereqPerk = prereqList[i];
			resCost = prereqPerk.Cost;
			
			if(!prereqPerk.Taken) {
				var resCost = prereqPerk.Cost;
				if(prereqPerk.Discount) {
					if(haveDiscount(prereqPerk)) {
						resCost = roundCost(resCost * prereqPerk.Discount_Multiplier);
					}
				}
				qs("#cur_cost").innerText = "" + resCost;
				
				if(!havePrereq(prereqPerk) && haveRestrict(e)) {
					addCurrent = attemptPrereq(prereqPerk);
				}
				else if(currentCP >= resCost && addCurrent) {
					temp = trimPerk(prereqPerk);
					var ct = prereqPerk.Title+"-"+prereqPerk.Upper_Source;
					if(!trimPerks.includes(temp) && !currentTitles.includes(ct) && !prereqPerk.Taken) {
						currentCP = currentCP - resCost;
						trimPerks.push(temp);
						currentPerks.push(prereqPerk);
						currentTitles.push(prereqPerk.Title+"-"+prereqPerk.Upper_Source);
						prereqPerk.Taken = true;
						prereqPerk.Retake_Count++;
						gained = true;
						allMisses.push(missedPerk);
						missedPerk = 0;
						if(untilPerk && isRunning) {
							canRun = false;
							isRunning = false;
							qs("#rollAll").innerText = "Continue";
						}
					}
					else if(prereqPerk.Retake && prereqPerk.Taken) {
						currentCP = currentCP - resCost;
						prereqPerk.Taken = true;
						prereqPerk.Retake_Count++;
						gained = true;
						allMisses.push(missedPerk);
						missedPerk = 0;
						if(untilPerk && isRunning) {
							canRun = false;
							isRunning = false;
							qs("#rollAll").innerText = "Continue";
						}
					}
					res = prereqPerk;
				}
				else {
					result = false;
				}
			}
			
			if(!addCurrent && result) {
				result = false;
			}
			i++;
		}
		
		return result;
	}
	else {
		return true;
	}
}

function doRoll(rollCount, isReroll) {
	console.log("doRoll");
	var canDoRoll = true;
	if(isNull(isReroll)) isReroll = false;
	if(isNull(rollCount)) rollCount = 0;
	if(qs("#Rerolls").checked) {
		if(rollCount > $("#reRolls").val()) {
			canDoRoll = false;
		}
	}
	
	totalPerks = currentPerks.length;
	var keys = Object.keys(perksNum);
	totalForge = 0;
	for(var i=0; i<keys.length; i++) {
		totalForge+=perksNum[keys[i]];
	}
	var tp = document.getElementById("TP");
	var tp2 = document.getElementById("TP2");
	tp.innerHTML = totalForge;
	tp2.innerHTML = totalPerks;
	
	if(!isReroll) {
		console.log("doRoll");
		currentCP+=100;
	}
	
	var dm = qs("#roll")[2].children[2].children;
	var pr = qs("#roll")[2].children[1].children;
	var mn = [];
	var rc = [];
	var retaken = false;
	
	if(qs("#Rerolls").checked) {
		doRerolls = true;
	}
	else {
		doRerolls = false;
	}
	/*/
		for (i = 0; i < dm.length; i++) {
		if(dm[i].nodeName === "INPUT" && dm[i].value!= "") {
		mn.push(dm[i].checked);
		}
		}
		
		for (i = 0; i < pr.length; i++) {
		if(pr[i].nodeName === "INPUT" && pr[i].checked && pr[i].value!= "") {
		rc.push(pr[i].value);
		}
		}
		
		if(isNull(rc) || isNull(mn)) {
		return;
		}
		console.log("mn",mn);
		console.log("rc",rc);
	//*/
	var res = roll(toggleDomain,toggleCost);
	
	//Check if need Reroll
	if(res.Taken && !res.Retake) {
		doRoll(rollCount,false);
	}
	if(res.Taken && res.Retake && res.Retake_Times!=0) {
		if(res.Retake_Count >= res.Retake_Times) {
			doRoll(rollCount,false);
		}
	}
	
	qs("#last_points").innerText = "" + currentCP;
	qs("#points").innerText = "" + currentCP;
	qs("#missedPerks").innerText = "" + missedPerk;
	
	var resCost = res.Cost;
	if(res.Taken && res.Retake) {
		resCost = resCost * getMultiplier(res.Retake_Multiplier,res.Retake_Times);
		if(res.Retake_Cost!=0) {
			resCost = res.Retake_Cost;
		}
	}
	if(res.Discount) {
		if(haveDiscount(res)) {
			resCost = roundCost(resCost * res.Discount_Multiplier);
			if(res.Discount_Cost!=0) {
				resCost = res.Discount_Cost;
			}
		}
	}
	qs("#cur_cost").innerText = "" + resCost;
	
	gained = false;
	var prereqPerk = findPrereq(res);
	
	if(currentCP >= resCost && havePrereq(res) && canDoRoll && haveRestrict(e)) {
		temp = trimPerk(res);
		var ct = res.Title+"-"+res.Upper_Source;
		if(!trimPerks.includes(temp) && !currentTitles.includes(ct)) {
			currentCP = currentCP - resCost;
			trimPerks.push(temp);
			if(!res.Taken) {
				currentPerks.push(res);
				currentTitles.push(res.Title+"-"+res.Upper_Source);
			}
			res.Taken = true;
			res.Retake_Count++;
			gained = true;
			allMisses.push(missedPerk);
			missedPerk = 0;
			if(untilPerk && isRunning) {
				canRun = false;
				isRunning = false;
				qs("#rollAll").innerText = "Continue";
			}
		}
	}
	else if(!isNull(prereqPerk) && canDoRoll) {
		var prereqList = prereqPerk;
		var i = 0;
		while(i<prereqList.length && !gained) {
			var addCurrent = true;
			prereqPerk = prereqList[i];
			resCost = prereqPerk.Cost;
			if(prereqPerk.Taken && !prereqPerk.Retake) {
				addCurrent = false;
			}
			if(prereqPerk.Taken && prereqPerk.Retake && prereqPerk.Retake_Times!=0) {
				if(prereqPerk.Retake_Count >= prereqPerk.Retake_Times) {
					addCurrent = false;
				}
			}
			if(!havePrereq(prereqPerk)) {
				addCurrent = attemptPrereq(prereqPerk);
			}
			if(prereqPerk.Taken && prereqPerk.Retake) {
				resCost = resCost * getMultiplier(prereqPerk.Retake_Multiplier,prereqPerk.Retake_Count);
			}
			if(prereqPerk.Discount) {
				if(haveDiscount(prereqPerk)) {
					resCost = roundCost(resCost * prereqPerk.Discount_Multiplier);
				}
			}
			qs("#cur_cost").innerText = "" + resCost;
			
			if(currentCP >= resCost && addCurrent) {
				temp = trimPerk(prereqPerk);
				var ct = prereqPerk.Title+"-"+prereqPerk.Upper_Source;
				if(!trimPerks.includes(temp) && !currentTitles.includes(ct) && !prereqPerk.Taken) {
					currentCP = currentCP - resCost;
					trimPerks.push(temp);
					currentPerks.push(prereqPerk);
					currentTitles.push(prereqPerk.Title+"-"+prereqPerk.Upper_Source);
					prereqPerk.Taken = true;
					prereqPerk.Retake_Count++;
					gained = true;
					allMisses.push(missedPerk);
					missedPerk = 0;
					if(untilPerk && isRunning) {
						canRun = false;
						isRunning = false;
						qs("#rollAll").innerText = "Continue";
					}
				}
				else if(prereqPerk.Retake && prereqPerk.Taken) {
					currentCP = currentCP - resCost;
					prereqPerk.Taken = true;
					prereqPerk.Retake_Count++;
					gained = true;
					allMisses.push(missedPerk);
					missedPerk = 0;
					if(untilPerk && isRunning) {
						canRun = false;
						isRunning = false;
						qs("#rollAll").innerText = "Continue";
					}
				}
				res = prereqPerk;
			}
			i++;
		}
	}
	else if(doRerolls && canDoRoll) {
		doRoll(rollCount++,true);
	}
	else {
		missedPerk++;
		qs("#missedPerks").innerText = "" + missedPerk;
	}
	
	currentRolls++;
	allRollCount++;
	var rollNum = document.getElementById('rollNum');
	rollNum.innerHTML = ""+allRollCount;
	
	var title = createTitle(res,retaken);
	var extra = document.getElementById("extra");
	var perks = document.getElementById("perks");
	extra.innerHTML = "";
	
	if(gained) {
		allRolls.push(currentRolls);
		currentRolls = 0;
		addThisPerk(res,retaken);
	}
	else {
		title = "Missed: " + title;
		var extra_title = "N/A";
		var extra_title2 = document.createElement('h5');
		extra_title2.innerText = extra_title;
		extra.appendChild(extra_title2);
	}
	
	qs("#title").innerText = title;
	qs("#ptext").innerHTML = res.Description;
	qs("#points").innerText = "" + currentCP;
	
	//*
	var finished = 0;
	
	//perksNum
	var count = Object.keys(perksNum);
	for(var i=0; i<count.length; i++) {
		finished+=perksNum[count[i]];
	}
	
	if(finished==0) {
		qs("#finish").innerText="Finished Perks:";
	}
	//*/
	
	return gained;
}

function endingReplace(txt) {
	console.log("endingReplace");
	var spacer = "(\\.|\\?|\\!| |\\,|\\\"|'|:|;|”|’)";
	for(var i=0; i<ending.length; i++) {
		var noDash = ending[i].replace(/\-/g,"");
		txt = txt.replace(RegExp(" \\"+ending[i]+spacer),ending[i]+"$1");
		txt = txt.replace(RegExp(" "+noDash+spacer),noDash+"$1");
	}
	return txt;
}

var lastSeenPerk = null;
var lastTitle = "";
function createTitle(res,retaken) {
	console.log("createTitle");
	if(isNull(retaken)) {
		retaken = false;
	}
	
	if(lastSeenPerk == res && !retaken) {
		return lastTitle;
	}
	else {
		lastSeenPerk = res;
		var subTitle = "";
		if(gained && res.dice != "1d1") {
			var Dice_List = getDiceList(res);
			subTitle = doSubRoll(res,Dice_List);
			celestial_forge[res.Domain_Number].Perks[res.Perk_Number]["Dice_List"] = [subTitle];
		}
		
		var title = res.Title + subTitle + " [" + res.Domain + "] (" + res.Source + ") (" + res.Cost + "CP)";
		lastTitle = title;
		return title;
	}
}

function findPerk(obj,recheck) {
	console.log("findPerk");
	if(isNull(recheck)) recheck == false;
	if(isNull(celestial_forge[obj.Domain_Number]) || recheck) {
		if(isNull(minDomains[obj.Domain]) || recheck) {
			if(isNull(obj.Over_Domain)) {
				for(var d of celestial_forge) {
					if(d.Over_Domain.toLowerCase().includes(obj.Domain.toLowerCase()) || d.Domain.toLowerCase().includes(obj.Domain.toLowerCase())) {
						for(var p of d.Perks) {
							if(p.Title.toLowerCase()==obj.Title.toLowerCase() && p.Upper_Source.toLowerCase()==obj.Upper_Source.toLowerCase()) {
								return p;
							}
						}
					}
				}
				return null;
			}
			else {
				for(var d of celestial_forge) {
					if(d.Over_Domain.toLowerCase()==obj.Over_Domain.toLowerCase()) {
						for(var p of d.Perks) {
							if(p.Title.toLowerCase()==obj.Title.toLowerCase() && p.Upper_Source.toLowerCase()==obj.Upper_Source.toLowerCase()) {
								return p;
							}
						}
					}
				}
				return null;
			}
		}
		else {
			for(var p of celestial_forge[minDomains[obj.Domain]].Perks) {
				if(p.Title.toLowerCase()==obj.Title.toLowerCase() && p.Upper_Source.toLowerCase()==obj.Upper_Source.toLowerCase()) {
					return p;
				}
			}
			return findPerk(obj,true);
		}
	}
	else if(isNull(celestial_forge[obj.Domain_Number].Perks[obj.Perk_Number])) {
		return findPerk(obj,true);
	}
	else {
		var p = celestial_forge[obj.Domain_Number].Perks[obj.Perk_Number];
		if(p.Title.toLowerCase()==obj.Title.toLowerCase() && p.Upper_Source.toLowerCase()==obj.Upper_Source.toLowerCase()) {
			return p;
		}
		else {
			return findPerk(obj,true);
		}
	}
}

function getDiceList(obj,isLoad) {
	console.log("getDiceList");
	var perk = findPerk(obj);
	if(isNull(perk)) return [];
	if(isLoad) {
		if(!isNull(obj.Dice_List)) {
			return obj.Dice_List;
		}
		else if(isNull(perk.Dice_List)) {
			return [];
		}
		else {
			return perk.Dice_List;
		}
	}
	if(isNull(perk.Dice_List)) {
		return [];
	}
	else {
		return perk.Dice_List;
	}
}

function addFreebies(res,frees,isLoad) {
	console.log("addFreebies");
	if(isNull(isLoad)) isLoad = false;
	var extra = document.getElementById("extra");
	var perks = document.getElementById("perks");
	
	if(isLoad) {
		res = findPerk(res);
	}
	
	if(frees.length > 0) {
		frees.forEach(function(d) {
			var subTitleExtra = "";
			var tempPerk = trimPerk(d);
			var ct = d.Title+"-"+d.Upper_Source;
			d["From_Free"] =  true;
			d["From"] = {
				"Title":res.Title,
				"Source":res.Source,
				"Upper_Source":res.Upper_Source,
				"Domain":res.Domain,
				"Over_Domain":res.Over_Domain
			};
			
			console.log("tempPerk",tempPerk);
			if(d.title != "" && !trimPerks.includes(tempPerk) && !currentTitles.includes(ct)) {
				if(tempPerk.Dice != "1d1") {
					var Dice_List = getDiceList(tempPerk);
					subTitleExtra = doSubRoll(tempPerk,Dice_List);
				}
				trimPerks.push(trimPerk(d));
				
				var extra_title = d.Title + subTitleExtra + " [" + d.Domain + "] (" + d.Source + ") (Free With: "+res.Title+")";
				var extra_title2 = document.createElement('h5');
				var extra_ptext = document.createElement('p');
				var isAdd = false;
				
				if(!d.Taken) {
					currentPerks.push(d);
					currentTitles.push(d.Title+"-"+d.Upper_Source);
					perksNum[d.Domain]--;
					if(isNull(d.Domain)) console.log(d);
					var id = d.Domain.replace(reg,"_");
					id = id.split(" ").join("_");
					qs("#"+id).innerText = d.Domain+" ("+perksNum[d.Domain]+")";
					d.Taken=true;
					d.Retake_Count++;
					extra_title2.innerText = extra_title;
					extra_ptext.innerHTML = d.Description;
					isAdd = true;
				}
				else if(d.Retake) {
					if(isNull(d.Domain)) console.log(d);
					var id = d.Domain.replace(reg,"_");
					id = id.split(" ").join("_");
					qs("#"+id).innerText = d.Domain+" ("+perksNum[d.Domain]+")";
					d.Taken=true;
					d.Retake_Count++;
					extra_title2.innerText = extra_title;
					extra_ptext.innerHTML = d.Description;
					isAdd = true;
				}
				
				if(isAdd) {
					if(!isLoad) extra.innerHTML += '<h5>'+extra_title+'</h5>\r<p>'+d.Description+'</p>\r';
					
					perks.appendChild(extra_title2);
					perks.appendChild(extra_ptext);
				}
			}
			else if(d.title != "" && d.Retake) {
				if(tempPerk.Dice != "1d1") {
					var Dice_List = getDiceList(tempPerk);
					subTitleExtra = doSubRoll(tempPerk,Dice_List);
				}
				trimPerks.push(trimPerk(d));
				
				var extra_title = d.Title + subTitleExtra + " [" + d.Domain + "] (" + d.Source + ") (Free With: "+res.Title+")";
				var extra_title2 = document.createElement('h5');
				var extra_ptext = document.createElement('p');
				var isAdd = false;
				
				if(d.Retake) {
					if(isNull(d.Domain)) console.log(d);
					var id = d.Domain.replace(reg,"_");
					id = id.split(" ").join("_");
					qs("#"+id).innerText = d.Domain+" ("+perksNum[d.Domain]+")";
					d.Taken=true;
					d.Retake_Count++;
					extra_title2.innerText = extra_title;
					extra_ptext.innerHTML = d.Description;
					isAdd = true;
				}
				
				if(isAdd) {
					if(!isLoad) extra.innerHTML += '<h5>'+extra_title+'</h5>\r<p>'+d.Description+'</p>\r';
					
					perks.appendChild(extra_title2);
					perks.appendChild(extra_ptext);
				}
			}
		});
	}
}

function addThisPerk(res,retaken) {
	console.log("addThisPerk");
	if(isNull(retaken)) {
		retaken = false;
	}
	
	var frees = [];
	var title = createTitle(res,retaken);
	var extra = document.getElementById("extra");
	var perks = document.getElementById("perks");
	extra.innerHTML = "";
	
	if(!res.Taken) {
		perksNum[res.Domain]--;
		var id = res.Domain.replace(reg,"_");
		id = id.split(" ").join("_");
		qs("#"+id).innerText = res.Domain+" ("+perksNum[res.Domain]+")";
		celestial_forge[res.Domain_Number].Perks[res.Perk_Number].Taken=true;
	}
	
	var title2 = document.createElement('h5');
	title2.innerText = title;
	var ptext = document.createElement('p');
	ptext.innerHTML = res.Description;
	
	perks.appendChild(title2);
	perks.appendChild(ptext);
	
	title = "Gained: " + title;
	if(qs("#Freebies").checked) {
		frees = doFree(res);
	}
	if(qs("#Rerolls").checked) {
		doRerolls = true;
	}
	else {
		doRerolls = false;
	}
	
	var subTitleExtra = "";
	if(frees.length > 0) {
		frees.forEach(function(d) {
			var tempPerk = trimPerk(d);
			var ct = d.Title+"-"+d.Upper_Source;
			if(!trimPerks.includes(tempPerk) && !currentTitles.includes(ct)) {
				if(tempPerk.Dice != "1d1") {
					var Dice_List = getDiceList(tempPerk);
					subTitleExtra = doSubRoll(tempPerk,Dice_List);
				}
				trimPerks.push(temp);
				currentPerks.push(d);
				currentTitles.push(d.Title+"-"+d.Upper_Source);
				var extra_title = d.Title + subTitleExtra + " [" + d.Domain + "] (" + d.Source + ") (" + d.Cost + "CP)";
				if(d.Cost != 0) extra_title = d.Title + subTitleExtra + " [" + d.Domain + "] (" + d.Source + ") (Free with: "+res.Title+")";
				var extra_title2 = document.createElement('h5');
				var extra_ptext = document.createElement('p');
				extra_title2.innerText = extra_title;
				extra_ptext.innerHTML = d.Description;
				
				if(!d.Taken) {
					perksNum[d.Domain]--;
					if(isNull(d.Domain)) console.log(d);
					var id = d.Domain.replace(reg,"_");
					id = id.split(" ").join("_");
					qs("#"+id).innerText = d.Domain+" ("+perksNum[d.Domain]+")";
					d.Taken=true;
				}
				
				extra.innerHTML += '<h5>'+extra_title+'</h5>\r<p>'+d.Description+'</p>\r';
				
				perks.appendChild(extra_title2);
				perks.appendChild(extra_ptext);
			}
		});
	}
	else {
		var extra_title = "None";
		var extra_title2 = document.createElement('h5');
		extra_title2.innerText = extra_title;
		extra.appendChild(extra_title2);
	}
}

function isNull(meh) {
	if(meh == null || meh == undefined ) {
		return true;
	}
	if(typeof meh == "string") {
		if(meh.trim()=="") return true;
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

function doSubRoll(res,TakenList) {
	console.log("doSubRoll");
	if(isNull(TakenList)) TakenList = [];
	var result = "";
	switch(res.Dice) {
		case "all_skills":
		result = getRandom(allSkills);
		break;
		case "craft_list":
		result = getRandom(craft_list);
		break;
		case "deities_list":
		result = getRandom(deities);
		break;
		case "magic_skills":
		result = getRandom(magic_skills);
		break;
		case "sciences":
		result = getRandom(sciences);
		break;
		case "science_skills":
		result = getRandom(science_skills);
		break;
		default:
		result = getDice(res);
		break;
	}
	if(TakenList.includes(result)) {
		if(TakenList.length<getListLength(res.Dice)) {
			return doSubRoll(res,TakenList);
		}
		else {
			return "";
		}
	}
	else {
		return result;
	}
}

function getListLength(obj) {
	console.log("getListLength");
	switch(obj) {
		case "all_skills":
		return allSkills.length;
		break;
		case "craft_list":
		return craft_list.length;
		break;
		case "deities_list":
		var dLength = 0;
		deities.forEach(function(d) {
			d.Gods.forEach(function(g) {
				dLength++;
			});
		});
		return dLength;
		break;
		case "magic_skills":
		return magic_skills.length;
		break;
		case "sciences":
		return sciences.length;
		break;
		case "science_skills":
		return science_skills.length;
		break;
		default:
		return 0;
		break;
	}
}

function getDice(res) {
	console.log("getDice");
	var dice = res.Dice;
	var result = rollDice(dice);
	if(!isNull(result)) {
		result = "(" + result.join(",") + ")";
	}
	else {
		result = "";
	}
	return result;
}

function rollDice(dice) {
	console.log("rollDice");
	var diceForm = new RegExp(/^([0-9]+)d([0-9]+)/);
	//Dice Format 1d1b1
	if(!diceForm.test(dice)) {
		return null;
	}
	var die = parseInt(dice.split("d")[0]);
	var side = parseInt(dice.split("d")[1]);
	var best = parseInt(dice.split("b")[1]);
	var rolls = [];
	if(!isNaN(best)) {
		for(var j=0; j<best; j++) {
			for(var i=0; i<die; i++) {
				rolls.push(Math.floor(Math.random() * side));
			}
		}
		rolls.sort();
		rolls = rolls.slice(0, best);
	}
	else {
		for(var i=0; i<die; i++) {
			rolls.push(Math.floor(Math.random() * side));
		}
	}
	return rolls
}

function getRandom(list) {
	console.log("getRandom");
	var idx = Math.floor(Math.random() * (list.length - 1));
	return list[idx];
}

function doRun() {
	console.log("doRun");
	if(!isRunning) {
		isRunning = true;
		canRun = true;
		qs("#rollAll").innerText = "Stop";
		run();
	}
	else {
		canRun = false;
		isRunning = false;
		qs("#rollAll").innerText = "Continue";
	}
}

function run() {
	console.log("run");
	var finished = 0;
	
	//perksNum
	var count = Object.keys(perksNum);
	for(var i=0; i<count.length; i++) {
		finished+=perksNum[count[i]];
	}
	
	if(finished != 0) {
		var pause = doRoll();
		var waitTime = sleepTime;
		if(pause && doWait) {
			waitTime*=10;
		}
		sleep(waitTime).then(() => {
			if(canRun) run();
		});
	}
}

function pickPerk() {
	console.log("pickPerk");
	$("#perkPick").toggleClass("hidden");
	var perkPick = document.getElementById('perkPick');
	if(!perkPick.classList.contains('hidden')) {
		clearSearch();
	}
}

function clearSearch() {
	console.log("clearSearch");
	$('#pickPerks').trigger("reset");
	fillDrop2();
}

function cancelPerk() {
	console.log("cancelPerk");
	$("#perkPick").toggleClass("hidden");
	toAdd = [];
	prevPerk();
	showPerk2();
}

function searchArchive() {
	console.log("searchArchive");
	var search = $("#Search").val();
	var filters = {
		"Source": $("#Source2").val(),
		"Upper_Source": $("#Upper_Source2").val(),
	};
	var att = ["Title","Description","Source","Upper_Source"];
	toAdd = searchPerk(search,filters,att);
	prevPerk();
	showPerk2();
}

var chargeForge = false;
function pickThisPerk() {
	console.log("pickThisPerk");
	$("#perkPick").toggleClass("hidden");
	var res = toAdd[currentPerk];
	
	var resCost = res.Cost;
	if(res.Taken && res.Retake) {
		resCost = resCost * getMultiplier(res.Retake_Multiplier,res.Retake_Times);
	}
	if(res.Discount) {
		if(currentTitles.includes(res.Discount_Title+"-"+res.Upper_Source)) {
			resCost = roundCost(resCost * res.Discount_Multiplier);
		}
	}
	var prereqPerk = findPrereq(res);
	
	if(chargeForge && currentCP < resCost) {
		while(currentCP<resCost) {
			currentCP+=100;
		}
	}
	
	if(currentCP >= resCost && havePrereq(res) && haveRestrict(e)) {
		currentCP -= resCost;
		addPerk(res,qs("#Freebies").checked);
	}
	else if(!isNull(prereqPerk)) {
		var prereqList = prereqPerk;
		for(var i=0; i<prereqList.length; i++) {
			prereqPerk = prereqList[i];
			resCost = prereqPerk.Cost;
			if(prereqPerk.Taken && prereqPerk.Retake) {
				resCost = resCost * getMultiplier(prereqPerk.Retake_Multiplier,prereqPerk.Retake_Times);
			}
			if(prereqPerk.Discount) {
				if(currentTitles.includes(prereqPerk.Discount_Title+"-"+prereqPerk.Upper_Source)) {
					resCost = roundCost(resCost * prereqPerk.Discount_Multiplier);
				}
			}
			if(currentCP >= resCost) {
				currentCP -= resCost;
				addPerk(prereqPerk,qs("#Freebies").checked);
			}
		}
	}
}

function searchPerk(search,filters,att,margin) {
	console.log("searchPerk",search);
	if(isNull(margin)) {
		//60% seems a decent threshold
		margin = .6;
	}
	if(isNull(att)) {
		att = ["Title","Description","Source","Upper_Source"];
	}
	if(isNull(search)) {
		search = $("#Search").val();
	}
	var filterSource = filters.Source;
	var filterUSource = filters.Upper_Source;
	
	
	
	var results = [];
	celestial_forge.forEach(function(d) {
		d.Perks.forEach(function(e) {
			att.forEach(function(a) {
				if((e[a].toLowerCase() == search.toLowerCase() || e[a].toLowerCase().includes(search.toLowerCase())) && checkCommon(search)) {
					if(isNull(filterSource) && isNull(filterUSource)) {
						if(!results.includes(e)) results.push(e);
					}
					else if(!isNull(filterSource) && !isNull(filterUSource)) {
						if(filterSource.toLowerCase() == e.Source.toLowerCase()) {
							if(filterUSource.toLowerCase() == e.Upper_Source.toLowerCase() || e.Source.toLowerCase().includes(filterUSource.toLowerCase())) {
								if(!results.includes(e)) results.push(e);
							}
							else if(!isNull(e.Upper_Sources)) {
								if(e.Upper_Sources.includes(filterUSource)) {
									if(!results.includes(e)) results.push(e);
								}
							}
						}
					}
					else if(!isNull(filterSource)) {
						if(filterSource.toLowerCase() == e.Source.toLowerCase()) {
							if(!results.includes(e)) results.push(e);
						}
					}
					else if(!isNull(filterUSource)) {
						if(filterUSource.toLowerCase() == e.Upper_Source.toLowerCase() || e.Source.toLowerCase().includes(filterUSource.toLowerCase())) {
							if(!results.includes(e)) results.push(e);
						}
						else if(!isNull(e.Upper_Sources)) {
							if(e.Upper_Sources.includes(filterUSource)) {
								if(!results.includes(e)) results.push(e);
							}
						}
					}
				}
				else if(compairThis(e[a],search,margin) >= margin) {
					if(isNull(filterSource) && isNull(filterUSource)) {
						if(!results.includes(e)) results.push(e);
					}
					else if(!isNull(filterSource) && !isNull(filterUSource)) {
						if(filterSource.toLowerCase() == e.Source.toLowerCase()) {
							if(filterUSource.toLowerCase() == e.Upper_Source.toLowerCase() || e.Source.toLowerCase().includes(filterUSource.toLowerCase())) {
								if(!results.includes(e)) results.push(e);
							}
							else if(!isNull(e.Upper_Sources)) {
								if(e.Upper_Sources.includes(filterUSource)) {
									if(!results.includes(e)) results.push(e);
								}
							}
						}
					}
					else if(!isNull(filterSource)) {
						if(filterSource.toLowerCase() == e.Source.toLowerCase()) {
							if(!results.includes(e)) results.push(e);
						}
					}
					else if(!isNull(filterUSource)) {
						if(filterUSource.toLowerCase() == e.Upper_Source.toLowerCase() || e.Source.toLowerCase().includes(filterUSource.toLowerCase())) {
							if(!results.includes(e)) results.push(e);
						}
						else if(!isNull(e.Upper_Sources)) {
							if(e.Upper_Sources.includes(filterUSource)) {
								if(!results.includes(e)) results.push(e);
							}
						}
					}
				}
			});
		});
	});
	toAdd = results;
	
	sleep(sleepTime).then(() => {
		prevPerk();
		showPerk2();
	});
	
	return results;
}

function checkCommon(search) {
	console.log("checkCommon",search);
	search = search.toLowerCase();
	common.every(function(d) {
		search = search.replaceAll(d,"");
		search = search.trim();
		if(search=="") {
			return false;
		}
	});
	return (search!="");
}

function compairThis(a,b,margin) {
	console.log("compairThis");
	if(isNull(margin)) {
		//60% seems a decent threshold
		margin = .6;
	}
	
	var result = similarity(a,b);
	var keys = ["ld", "cs", "jw", "as"]
	var val = 0;
	
	keys.forEach(function (d) {
		val+=result[d];
	});
	val = val / 4;
	
	return val;
}

function matchAnds(arr) {
	console.log("matchAnds");
	for(var i=0; i<arr.length; i++) {
		if(arr[i]!="true" && arr[i]!="false") {
			if(!currentTitles.includes(arr[i])) {
				return false;
			}
			else if(arr[i]=="false") {
				return false;
			}
		}
	}
	return true;
}

function matchOrs(arr) {
	console.log("matchOrs");
	for(var i=0; i<arr.length; i++) {
		if(arr[i]!="true" && arr[i]!="false") {
			if(currentTitles.includes(arr[i])) {
				return true;
			}
		}
		else if(arr[i]=="true") {
			return true;
		}
	}
	return false;
}

function evalTitles(obj,matchStr,titleType) {
	console.log("evalTitles");
	if(matchStr.includes("&&") && matchStr.includes("||")) {
		var preTitles = matchStr.split("||");
		for(var i=0; i<preTitles.length; i++) {
			preTitles[i] = preTitles[i].trim();
			if(preTitles[i].includes("&&")) {
				var preTitlesAnd = preTitles[i].split("&&");
				for(var j=0; j<preTitlesAnd.length; j++) {
					preTitlesAnd[j] = preTitlesAnd[j].trim();
					preTitlesAnd[j] = preTitlesAnd[j]+"-"+obj.Upper_Source;
				}
				var tmp = matchAnds(preTitlesAnd);
				if(tmp) return true;
			}
			else {
				var tmp = matchOrs([preTitles[i]+"-"+obj.Upper_Source]);
				if(tmp) return true;
			}
		}
		return false;
	}
	else if(matchStr.includes("&&")) {
		var preTitles = matchStr.split("&&");
		for(var i=0; i<preTitles.length; i++) {
			preTitles[i] = preTitles[i].trim();
			preTitles[i] = preTitles[i]+"-"+obj.Upper_Source;
		}
		return matchAnds(preTitles);
	}
	else if(matchStr.includes("||")) {
		var preTitles = matchStr.split("||");
		for(var i=0; i<preTitles.length; i++) {
			preTitles[i] = preTitles[i].trim();
			preTitles[i] = preTitles[i]+"-"+obj.Upper_Source;
		}
		return matchOrs(preTitles);
	}
	else {
		return currentTitles.includes(matchStr+"-"+obj.Upper_Source);
	}
}

function evalTrues(obj,evalStr) {
	console.log("evalTrues");
	if(evalStr.includes("&&") && evalStr.includes("||")) {
		var preTitles = evalStr.split("||");
		for(var i=0; i<preTitles.length; i++) {
			preTitles[i] = preTitles[i].trim();
			if(preTitles[i].includes("&&")) {
				var preTitlesAnd = preTitles[i].split("&&");
				for(var j=0; j<preTitlesAnd.length; j++) {
					preTitlesAnd[j] = preTitlesAnd[j].trim();
					if(preTitlesAnd[j]!="true" && preTitlesAnd[j]!="false") {
						preTitlesAnd[j] = preTitlesAnd[j]+"-"+obj.Upper_Source;
					}
				}
				var tmp = matchAnds(preTitlesAnd);
				if(tmp) return true;
			}
			else {
				if(preTitles[i]!="true" && preTitles[i]!="false") {
					var tmp = matchOrs([preTitles[i]+"-"+obj.Upper_Source]);
					if(tmp) return true;
				}
				else if(preTitles[i]=="true") {
					return true;
				}
			}
		}
		return false;
	}
	else if(evalStr.includes("&&")) {
		var preTitles = evalStr.split("&&");
		for(var i=0; i<preTitles.length; i++) {
			preTitles[i] = preTitles[i].trim();
			if(preTitles[i]!="true" && preTitles[i]!="false") {
				preTitles[i] = preTitles[i]+"-"+obj.Upper_Source;
			}
			else if(preTitles[i]=="false") {
				return false;
			}
		}
		return matchAnds(preTitles);
	}
	else if(evalStr.includes("||")) {
		var preTitles = evalStr.split("||");
		for(var i=0; i<preTitles.length; i++) {
			preTitles[i] = preTitles[i].trim();
			if(preTitles[i]!="true" && preTitles[i]!="false") {
				preTitles[i] = preTitles[i]+"-"+obj.Upper_Source;
			}
			else if(preTitles[i]=="true") {
				return true;
			}
		}
		return matchOrs(preTitles);
	}
}

//var para = new RegExp(/\(([^\(\)]+)\)/);
var para = new RegExp(/\s*\(.*?\)\s*/g);
function havePrereq(obj) {
	console.log("havePrereq");
	return haveTitle(obj,"Prereq_Title")
}

function haveExclude(obj) {
	console.log("haveExclude");
	return haveTitle(obj,"Exclude_Title");
}

function haveRestrict(obj) {
	console.log("haveRestrict");
	return haveTitle(obj,"Restrict_Title");
}

function haveTitle(obj,title) {
	console.log("haveTitle");
	var base = title.split("_")[0];
	if(obj[base]) {
		if(!obj[title].includes("&&") && !obj[title].includes("||")) {
			var tmpTitle = obj[title]+"-"+obj.Upper_Source;
			if(currentTitles.includes(tmpTitle)) {
				return true;
			}
			else {
				return false;
			}
		}
		else {
			var paras = obj[title].match(para);
			if(!isNull(paras)) {
				var origPara = obj[title];
				for(var i=0; i<paras.length; i++) {
					var tmp = paras[i];
					paras[i] = paras[i].trim();
					paras[i] = paras[i].replace("(","");
					paras[i] = paras[i].replace(")","");
					origPara.replace(tmp,""+evalTitles(obj,paras[i],title));
				}
				
				return evalTrues(obj,origPara);
			}
			else {
				return evalTitles(obj,obj[title],title);
			}
		}
	}
	else {
		return true;
	}
}

function haveFree(perk) {
	console.log("haveFree");
	if(perk.Free_Req) {
		if(perk.Free_Title.toLowerCase() == "drop-in" || perk.Free_Title.toLowerCase() == "drop in") {
			return true;
		}
		if(perk.Free_Title.toLowerCase() == "human" || perk.Free_Title.toLowerCase() == "engineer") {
			return true;
		}
		if(perk.Free_Title.toLowerCase() == "builder" || perk.Free_Title.toLowerCase() == "crafter") {
			return true;
		}
		if(perk.Free_Title.toLowerCase() == "scientist" || perk.Free_Title.toLowerCase() == "doctor") {
			return true;
		}
		return haveTitle(obj,"Free_Title");
	}
	else {
		return false;
	}
}

function haveDiscount(perk) {
	console.log("haveDiscount");
	if(perk.Discount) {
		if(perk.Discount_Title.toLowerCase() == "drop-in" || perk.Discount_Title.toLowerCase() == "drop in") {
			return true;
		}
		if(perk.Discount_Title.toLowerCase() == "human" || perk.Discount_Title.toLowerCase() == "engineer") {
			return true;
		}
		if(perk.Discount_Title.toLowerCase() == "builder" || perk.Discount_Title.toLowerCase() == "crafter") {
			return true;
		}
		if(perk.Discount_Title.toLowerCase() == "scientist" || perk.Discount_Title.toLowerCase() == "doctor") {
			return true;
		}
		return haveTitle("Discount_Title");
	}
	else {
		return false;
	}
}

function doFree(perk) {
	console.log("doFree");
	if(!qs("#Freebies").checked) {
		return [];
	}
	var isUpperFree = qs("#Upper_Free").checked;
	var freebies = [];
	celestial_forge.forEach(function(d) {
		d.Perks.forEach(function(e) {
			var ct = e.Title+"-"+e.Upper_Source;
			if(e.Source == perk.Source || (e.Upper_Source == perk.Upper_Source && isUpperFree)) {
				if(e.Cost == 0 && havePrereq(e) && haveRestrict(e)) {
					var temp = compairMany(trimPerks,e);
					var tmp = trimPerk(e);
					if(!temp && !trimPerks.includes(tmp) && !currentTitles.includes(ct)) {
						if(perk != e) {
							freebies.push(e);
						}
					}
					else {
						temp = compairMany(trimPerks,e,true);
						var add = false;
						for(var i=0; i<temp.length; i++) {
							if(temp[i].missed.length == 1) {
								add = false;
								break;
							}
							else {
								add = true;
							}
						}
						if(add && !trimPerks.includes(tmp) && !currentTitles.includes(ct)) {
							if(perk != e) {
								freebies.push(e);
							}
						}
					}
				}
				else if(e.Free_Title != "" && haveFree(e) && havePrereq(e) && haveRestrict(e)) {
					var temp = compairMany(trimPerk,e);
					var tmp = trimPerk(e);
					if(!temp && !trimPerk.includes(tmp) && !currentTitles.includes(ct)) {
						if(perk != e) {
							freebies.push(e);
						}
					}
					else {
						temp = compairMany(trimPerks,e,true);
						var add = false;
						for(var i=0; i<temp.length; i++) {
							if(temp[i].missed.length >= 1) {
								add = false;
								break;
							}
							else {
								add = true;
							}
						}
						if(add && !trimPerk.includes(tmp) && !currentTitles.includes(ct)) {
							if(perk != e) {
								freebies.push(e);
							}
						}
					}
				}
			}
			else if(!isNull(perk.Upper_Sources) && isUpperFree) {
				perk.Upper_Sources.forEach(function(z) {
					if(z == e.Upper_Source || z == e.Source) {
						if(e.Cost == 0  && havePrereq(e) && haveRestrict(e)) {
							var temp = compairMany(trimPerks,e);
							var tmp = trimPerk(e);
							if(!temp && !currentTitles.includes(ct)) {
								freebies.push(e);
							}
							else {
								temp = compairMany(trimPerks,e,true);
								var add = false;
								for(var i=0; i<temp.length; i++) {
									if(temp[i].missed.length >= 1) {
										add = false;
										break;
									}
									else {
										add = true;
									}
								}
								if(add && !currentTitles.includes(ct)) {
									freebies.push(e);
								}
							}
						}
						else if(e.Free_Title != "" && haveFree(e) && havePrereq(e) && haveRestrict(e)) {
							var temp = compairMany(freebies,e,true);
							if(temp.length == 0 && !currentTitles.includes(ct)) {
								freebies.push(e);
							}
							else {
								var add = false;
								for(var i=0; i<temp.length; i++) {
									if(temp[i].missed.length == 1) {
										add = false;
										break;
									}
									else {
										add = true;
									}
								}
								if(add && !currentTitles.includes(ct)) {
									freebies.push(e);
								}
							}
						}
					}
				});
			}
		});
	});
	return freebies;
}

function endingReplace(txt) {
	console.log("endingReplace");
	var spacer = "(\\.|\\?|\\!| |\\,|\\\"|'|:|;|”|’)";
	for(var i=0; i<ending.length; i++) {
		var noDash = ending[i].replace(/\-/g,"");
		txt = txt.replace(RegExp(" \\"+ending[i]+spacer),ending[i]+"$1");
		txt = txt.replace(RegExp(" "+noDash+spacer),noDash+"$1");
	}
	return txt;
}

function download(content, fileName, contentType) {
	console.log("download");
	var a = document.createElement("a");
	var file = new Blob([content], {type: contentType});
	a.href = URL.createObjectURL(file);
	a.download = fileName;
	a.click();
}

function saveJson(jsonData, fileName, isVar) {
	console.log("saveJson");
	if(isNull(isVar)) isVar = true;
	var ext = fileName.split(".").pop();
	var varName = fileName.split(".")[0];
	if((ext=="js" || ext=="json") && isVar) {
		download("var "+varName+" = "+JSON.stringify(jsonData, null, 2), fileName, 'text/plain');
	}
	else {
		download(JSON.stringify(jsonData, null, 2), fileName, 'text/plain');
	}
}

function convertToJson(jsonData) {
	console.log("convertToJson");
	var arr = [].constructor;
	var json = {}.constructor;
	var obj = jsonData.constructor;
	var type = typeof jsonData;
	var result = {};
	if(json == obj) {
		return jsonData;
	}
	if(arr == obj) {
		for(var i=0; i<jsonData.length; i++) {
			result[jsonData[i]]="";
		}
		return result;
	}
	if(type == 'object') {
		result = JSON.parse(JSON.stringify(jsonData));
		return result;
	}
	return {"Result":jsonData,"Data_Type":type};
}

$(document).ready(function() {
	console.log("Page loaded...");
	var url = window.location.href;
	var path = url.split("/");
	const last = path[path.length - 1];
	if(last=="forge") {
		checkPerks();
		sortForge();
		resetForge();
		doStarters();
		fillFilterUpperDrop();
		fillFilterDrop();
		var rollNum = document.getElementById('rollNum');
		rollNum.innerHTML = 0;
		//displayData([jsonObj], element, "top");
	}
	if(!isNull(addPerks)) {
		toAdd = addPerks;
		processFile(true);
	}
});

rObserver.observe(document.body);

function resetForge() {
	console.log("resetForge");
	celestial_forge.forEach(function(d) {
		d.Perks.forEach(function(p,idx,theArr) {
			p.Retake_Count = 0;
			p.Taken = false;
		});
	});
}

function saveProgress() {
	console.log("saveProgress");
	currentPerks.forEach(function(p,idx,theArr) {
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
		newP["Taken"] = tTaken;
		theArr[idx] = newP;
	});
	var prog = {
		"Current_CP":currentCP,
		"Gained_Perks":currentPerks,
		"Missed_Perk":missedPerk,
		"Current_Rolls":currentRolls,
		"All_Rolls":allRolls,
		"Roll_Count":allRollCount,
		"All_Misses":allMisses
	};
	saveJson(prog,"progress.js",false);
}