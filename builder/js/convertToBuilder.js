var currentTitles = [];
var trimPerks = [];
var para = new RegExp(/\s*\(.*?\)\s*/g);
var totalForge = 0;
var celestial_forge = [];
$.getJSON('public/json/celestial_forge.json', function(data) {
    celestial_forge = data;
});

function convertPerk(res) {
	var desc = res.Description;
	if(isNull(desc)) desc = res.description;
	var dNum = res.Domain_Number;
	if(isNull(dNum)) dNum = res.domain_number;
	var pNum = res.Perk_Number;
	if(isNull(pNum)) dNum = res.perk_number;
	var keys = Object.keys(res);
	var tmpPerk = {};
	for(var i=0;i<keys.length;i++) {
		tmpPerk[keys[i].toLowerCase()] = res[keys[i]];
	}
	tmpPerk["description"] = formatDesc(desc);
	return tmpPerk;
}

function convertForge()	{
	checkPerks();
	resetForge();
	sortForge();
	
	console.log("convertForge");
	var forgeJson = [];
	celestial_forge.forEach(function(d) {
		d.Perks.forEach(function(p) {
			forgeJson.push(convertPerk(p));
		});
	});
	return forgeJson;
}

function checkPerks() {
	celestial_forge.forEach(function(d) {
		d.Perks.forEach(function(p,idx,theArr) {
			theArr[idx] = checkPerk(p,d.Over_Domain);
		});
	});
}

function checkPerk(jsonObj,overStr) {
	if(isNull(jsonObj.Title)) {
		jsonObj["Title"] = "";
	}
	if(isNull(jsonObj.Domain)) {
		jsonObj["Domain"] = "Add";
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
	if(isNull(jsonObj.Discount_Req)) {
		jsonObj["Discount_Req"] = false;
	}
	if(isNull(jsonObj.Free_Title)) {
		jsonObj["Free_Title"] = "";
	}
	if(isNull(jsonObj.Free_Req)) {
		jsonObj["Free_Req"] = false;
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

function formatDesc(str) {
	//console.log("formatDesc",str);
	//if(isNull(str)) return str;
	//<br/>&emsp;
	str = str.replaceAll("<br/>","\n");
	str = str.replaceAll("&emsp;","\t");
	return str;
}

function sortForge() {
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
			newP["ID"] = domainCount+"."+perkCount;
			theArr[idx] = newP;
			perkCount++;
		});
		d.Perks = d.Perks.filter(function(p) {
			return (!isNull(p));
		});
		domainCount++;
	});
	sameTitleDomain();
}

function sameTitleDomain() {
	var titleArray = [];
	var perks = [];
	$.each(celestial_forge, function(index, item) {
		$.each(item.Perks, function(idx,value) {
			if(!isNull(value)) {
				if ($.inArray(value.Title.toLowerCase()+"_"+value.Source.toLowerCase(), titleArray) === -1) {
					titleArray.push(value.Title.toLowerCase()+"_"+value.Source.toLowerCase());
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
	for(var i=0; i<perks.length; i++) {
		delete celestial_forge[perks[i].Domain_Number].Perks[perks[i].Perk_Number];
		//delete celestial_forge[minDomains[perks[i].Domain]].Perks[perks[i].Perk_Number];
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

function doFree(perk,isUpperFree) {
	if(isNull(isUpperFree)) isUpperFree = false;
	var freebies = [];
	celestial_forge.forEach(function(d) {
		d.Perks.forEach(function(e) {
			var ct = e.title+"-"+e.upper_source;
			if(e.source == perk.source || (e.upper_source == perk.upper_source && isUpperFree)) {
				if(e.cost == 0 && havePrereq(e)) {
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
				else if(e.free_title != "" && haveFree(e) && havePrereq(e)) {
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
			else if(!isNull(perk.upper_sources) && isUpperFree) {
				perk.upper_sources.forEach(function(z) {
					if(z == e.upper_source || z == e.source) {
						if(e.cost == 0  && havePrereq(e)) {
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
						else if(e.free_title != "" && haveFree(e) && havePrereq(e)) {
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

function compairMany(a1,o1,isList) {
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

function trimPerk(res) {
	if(isNull(res)) return null;
	var desc = stripString(res.description);
	var meh = {
		"title":stripString(res.title),
		"upper_source":stripString(res.upper_source),
		"domain":res.domain,
		"over_domain":res.over_domain,
	}
	return meh;
}

function havePrereq(obj) {
	if(obj.prereq) {
		if(!obj.prereq_title.includes("&&") && !obj.prereq_title.includes("||")) {
			var tmpTitle = obj.prereq_title+"-"+obj.upper_source;
			if(currentTitles.includes(tmpTitle)) {
				return true;
			}
			else {
				return false;
			}
		}
		else {
			var paras = obj.prereq_title.match(para);
			if(!isNull(paras)) {
				var origPara = obj.prereq_title;
				for(var i=0; i<paras.length; i++) {
					var tmp = paras[i];
					paras[i] = paras[i].trim();
					paras[i] = paras[i].replace("(","");
					paras[i] = paras[i].replace(")","");
					origPara.replace(tmp,""+evalTitles(obj,paras[i],"prereq_title"));
				}
				
				return evalTrues(obj,origPara);
			}
			else {
				return evalTitles(obj,obj.prereq_title,"prereq_title");
			}
		}
	}
	else {
		return true;
	}
}

function haveFree(perk) {
	if(perk.free_req) {
		if(perk.discount_title.toLowerCase() == "drop-in" || perk.discount_title.toLowerCase() == "drop in") {
			return true;
		}
		if(perk.discount_title.toLowerCase() == "human" || perk.discount_title.toLowerCase() == "engineer") {
			return true;
		}
		if(perk.discount_title.toLowerCase() == "builder" || perk.discount_title.toLowerCase() == "crafter") {
			return true;
		}
		if(perk.discount_title.toLowerCase() == "building" || perk.discount_title.toLowerCase() == "crafting") {
			return true;
		}
		if(!perk.free_title.includes("&&") && !perk.free_title.includes("||")) {
			return currentTitles.includes(perk.free_title+"-"+perk.upper_source);
		}
		else {
			var paras = obj.free_title.match(para);
			if(!isNull(paras)) {
				var origPara = obj.free_title;
				for(var i=0; i<paras.length; i++) {
					var tmp = paras[i];
					paras[i] = paras[i].trim();
					paras[i] = paras[i].replace("(","");
					paras[i] = paras[i].replace(")","");
					origPara.replace(tmp,""+evalTitles(obj,paras[i],"free_title"));
				}
				
				return evalTrues(obj,origPara);
			}
			else {
				return evalTitles(obj,obj.free_title,"free_title");
			}
		}
	}
	else {
		return false;
	}
}

function haveDiscount(perk) {
	if(perk.discount_req) {
		if(perk.discount_title.toLowerCase() == "drop-in" || perk.discount_title.toLowerCase() == "drop in") {
			return true;
		}
		if(perk.discount_title.toLowerCase() == "human" || perk.discount_title.toLowerCase() == "engineer") {
			return true;
		}
		if(perk.discount_title.toLowerCase() == "builder" || perk.discount_title.toLowerCase() == "crafter") {
			return true;
		}
		if(perk.discount_title.toLowerCase() == "building" || perk.discount_title.toLowerCase() == "crafting") {
			return true;
		}
		if(!perk.discount_title.includes("&&") && !perk.discount_title.includes("||")) {
			return currentTitles.includes(perk.discount_title+"-"+perk.upper_source);
		}
		else {
			var paras = obj.discount_title.match(para);
			if(!isNull(paras)) {
				var origPara = obj.discount_title;
				for(var i=0; i<paras.length; i++) {
					var tmp = paras[i];
					paras[i] = paras[i].trim();
					paras[i] = paras[i].replace("(","");
					paras[i] = paras[i].replace(")","");
					origPara.replace(tmp,""+evalTitles(obj,paras[i],"discount_title"));
				}
				
				return evalTrues(obj,origPara);
			}
			else {
				return evalTitles(obj,obj.discount_title,"discount_title");
			}
		}
	}
	else {
		return false;
	}
}

function evalTitles(obj,matchStr,titleType) {
	console.log("obj",obj);
	console.log("titleType",titleType);
	if(matchStr.includes("&&") && matchStr.includes("||")) {
		var preTitles = matchStr.split("||");
		for(var i=0; i<preTitles.length; i++) {
			preTitles[i] = preTitles[i].trim();
			if(preTitles[i].includes("&&")) {
				var preTitlesAnd = preTitles[i].split("&&");
				for(var j=0; j<preTitlesAnd.length; j++) {
					preTitlesAnd[j] = preTitlesAnd[j].trim();
					preTitlesAnd[j] = preTitlesAnd[j]+"-"+obj.upper_source;
				}
				var tmp = matchAnds(preTitlesAnd);
				if(tmp) return true;
			}
			else {
				var tmp = matchOrs([preTitles[i]+"-"+obj.upper_source]);
				if(tmp) return true;
			}
		}
		return false;
	}
	else if(matchStr.includes("&&")) {
		var preTitles = matchStr.split("&&");
		for(var i=0; i<preTitles.length; i++) {
			preTitles[i] = preTitles[i].trim();
			preTitles[i] = preTitles[i]+"-"+obj.upper_source;
		}
		return matchAnds(preTitles);
	}
	else if(matchStr.includes("||")) {
		var preTitles = matchStr.split("||");
		for(var i=0; i<preTitles.length; i++) {
			preTitles[i] = preTitles[i].trim();
			preTitles[i] = preTitles[i]+"-"+obj.upper_source;
		}
		return matchOrs(preTitles);
	}
	else {
		return currentTitles.includes(matchStr+"-"+obj.Upper_Source);
	}
}

function evalTrues(obj,evalStr) {
	if(evalStr.includes("&&") && evalStr.includes("||")) {
		var preTitles = evalStr.split("||");
		for(var i=0; i<preTitles.length; i++) {
			preTitles[i] = preTitles[i].trim();
			if(preTitles[i].includes("&&")) {
				var preTitlesAnd = preTitles[i].split("&&");
				for(var j=0; j<preTitlesAnd.length; j++) {
					preTitlesAnd[j] = preTitlesAnd[j].trim();
					if(preTitlesAnd[j]!="true" && preTitlesAnd[j]!="false") {
						preTitlesAnd[j] = preTitlesAnd[j]+"-"+obj.upper_source;
					}
				}
				var tmp = matchAnds(preTitlesAnd);
				if(tmp) return true;
			}
			else {
				if(preTitles[i]!="true" && preTitles[i]!="false") {
					var tmp = matchOrs([preTitles[i]+"-"+obj.upper_source]);
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
				preTitles[i] = preTitles[i]+"-"+obj.upper_source;
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
				preTitles[i] = preTitles[i]+"-"+obj.upper_source;
			}
			else if(preTitles[i]=="true") {
				return true;
			}
		}
		return matchOrs(preTitles);
	}
}

function canGet(res) {
	var isGet = true;
	if(res.taken && !res.retake) {
		isGet = false;
	}
	if(!havePrereq(res)) {
		isGet = false;
	}
	return isGet;
}

function addPerk(res) {
	var tPerk = trimPerk(res);
	var ct = res.title.toLowerCase()+"-"+res.upper_source;
	trimPerks.push(tPerk);
	currentTitles.push(ct);
}

function getActCost(res) {
	var resCost = res.cost;
	
	return resCost;
}

function matchAnds(arr) {
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

function doStarters() {
	var meh = [];
	for(var i=0; i<celestial_forge.length; i++) {
		if(celestial_forge[i].Domain == "Starters") {
			meh = celestial_forge[i].Perks;
		}
	}
	meh.forEach(function(p,idx,theArr) {
		//console.log("p",p);
		theArr[idx] = convertPerk(p);
	});
	return meh;
}

function resetForge() {
	celestial_forge.forEach(function(d) {
		d.Perks.forEach(function(p,idx,theArr) {
			p.Retake_Count = 0;
			p.Taken = false;
		});
	});
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function saveForge() {
	sortForge();
	resetForge();
	saveJson(celestial_forge,"celestial_forge.json");
}

function saveJson(jsonData, fileName, isVar) {
	if(isNull(isVar)) isVar = false;
	var ext = fileName.split(".").pop();
	var varName = fileName.split(".")[0];
	if(ext=="js" || isVar) {
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

$(document).ready(function() {
	console.log("Page loaded...");
	var url = window.location.href;
	url = url.replace("http://127.0.0.1:3000","");
	url = url.replace("http://195.88.25.143","");
	if(url=="/builder#/Builder") {
		if(isNull(celestial_forge)) {
			window.location.href = "/builder";
		}
	}
});