<template>
	<div></div>
</template>
<script>
	import  { reactive } from 'vue'
	const perkList = require('../../../public/json/celestial_forge.json');
	const sourceList = require('../../../public/json/source_origins.json');
	const commons = require('../../../public/dictionaries/common_phrases.json');
	var cTitles = [];
	var tPerks = [];
	
	const store = {
		debug: true,
		state: reactive({
			displayValue: {
				"ID": "Unique perk reference, format: domain#(.)perk#",
				"Title": "Selected perk title (currently none)",
				"Source": "Media property from which perk originates",
				"Cost": "Perk value in creation points, abbreviated",
				"Domain": "Clusters of conceptually similar perks",
				"Description": "General, functional perk definition",
				"Order":"N/A"
			},
			filteredBuild: [],
			currentBuild: [],
			costFilter: [],
			actDomainFilter: [],
			domainFilter: [],
			unfiltered: perkList,
			filtered: [],
			filteredDomain: [],
			sourceFilter: [],
			upperFilter: [],
			misses: [],
			allRolls: [],
			allMisses: [],
			sourceOrigins: sourceList,
			currentFreebies: [],
			bookmarkedPerks: [],
			checkDomain: [],
			domainNumber: {},
			perksNum: {},
			allDomains: {},
			minDomains: {},
			currentPerk: null,
			currentCP: 0,
			currentRolls: 0,
			allRollCount: 0,
			missedPerk: 0,
			maxValue: 0,
			buildCount: 0,
			doFree: true,
			doUpper: false,
			doRerolls: false,
			canGet: false,
			untilPerk: false,
			isRunning: false,
			canRun: false,
			rollLimit: 3,
			searchString: ''
		}),
		
		setDisplayValue(newValue) {
			if(isNull(newValue)) return;
			if(isNull(this.state.domainFilter)) {
				this.resetPerkList();
			}
			if(this.debug) {
				console.log('store.setDisplayValue called with', newValue)
			}
			this.state.displayValue = newValue
		},
		
		fetchMaxValue() {
			if(isNull(this.state.domainFilter)) {
				this.resetPerkList();
			}
			return this.state.maxValue;
		},
		
		sortPerks() {
			this.state.unfiltered.sort(function(a, b) {
				if(a.Domain.toLowerCase() < b.Domain.toLowerCase()) {
					return -1;
				}
				if(a.Domain.toLowerCase() > b.Domain.toLowerCase()) {
					return 1;
				}
				return 0;
			});
			
			var domainCount = 0;
			var functOrigin = this.addOrigin;
			var functCall = this.isOrigins;
			var sourceTemp = this.state.sourceOrigins;
			
			this.state.unfiltered.forEach(function(d) {
				var perkCount = 0;
				d["ID"] = domainCount;
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
					}, {});
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
						sourceTemp = functOrigin(newP,sourceTemp,functCall);
					}
				});
				d.Perks = d.Perks.filter(function(p) {
					return (!isNull(p));
				});
				domainCount++;
			});
			
			this.state.sourceOrigins = sourceTemp;
		},
		
		addOrigin(obj,sourceTemp,callBack) {
			var isAdded = false;
			sourceTemp.forEach(function(d) {
				if(d.Source.toLowerCase()==obj.Source.toLowerCase()) {
					isAdded = true;
					if(obj.Domain.toLowerCase().includes("background")) {
						if(!callBack(obj,sourceTemp)) d.Origins.Background.push(obj);
					}
					if(obj.Domain.toLowerCase().includes("species")) {
						if(!callBack(obj,sourceTemp)) d.Origins.Species.push(obj);
					}
				}
			});
			
			if(!isAdded) {
				var tmpD = {"Source":obj.Source,"Upper_Source":obj.Upper_Source,"Origins":{"Background":[],"Species":[]}};
				if(obj.Domain.toLowerCase().includes("background")) {
					if(!callBack(obj,sourceTemp)) tmpD.Origins.Background.push(obj);
				}
				if(obj.Domain.toLowerCase().includes("species")) {
					if(!callBack(obj,sourceTemp)) tmpD.Origins.Species.push(obj);
				}
				sourceTemp.push(tmpD);
			}
			return sourceTemp;
		},
		
		isOrigins(obj,source_origins) {
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
		},
		
		removeDupes() {
			var titleArray = [];
			var uniqueArray = [];
			var matchArray = [];
			var perks = [];
			$.each(this.state.unfiltered, function(index, item) {
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
				var deleteMe = this.getSmallerPerk(uniqueArray[matchArray[i]],perks[i]);
				delete this.state.unfiltered[deleteMe.Domain_Number].Perks[deleteMe.Perk_Number];
			}
			this.state.unfiltered = this.state.unfiltered.filter(function(p) {
				return (!isNull(p));
			});
			this.state.unfiltered.forEach(function(d) {
				d.Perks = d.Perks.filter(function(p) {
					return (!isNull(p));
				});
			});
		},
		
		getSmallerPerk(a,b) {
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
		},
		
		clearDisplayValue() {
			if(this.debug) {
				console.log('store.clearDisplayValue called with', newValue)
			}
			this.state.displayValue = {
				"ID": "N/A",
				"Title": "None",
				"Source": "None",
				"Cost": 0,
				"Domain": "None",
				"Description": "None",
				"Order":"N/A"
			};
		},
		
		fetchAllDomains() {
			if(isNull(this.state.domainFilter)) {
				this.resetPerkList();
			}
			var domains = [];
			for(var d of this.state.unfiltered) {
				domains.push(d.Domain);
			}
			return domains;
		},
		
		fetchAllOverDomains() {
			var overDomains = {};
			for(var d of this.state.unfiltered) {
				if(overDomains.hasOwnProperty(d.Over_Domain)) {
					overDomains[d.Over_Domain].push(d.Domain);
				}
				else {
					overDomains[d.Over_Domain] = [d.Domain];
				}
			}
			return overDomains;
		},
		
		addToBuild(newValue) {
			this.state.buildCount++;
			var addPerk = newValue.Perk;
			if(isNull(addPerk)) addPerk = newValue;
			addPerk["Order"] = getOrd(this.state.buildCount);
			var trimed = trimPerk(addPerk);
			var ct = addPerk.Title+"-"+addPerk.Upper_Source;
			if(!hasTP(trimed) && !hasCT(ct)) {
				addToTP(trimed);
				addToCT(ct);
			}
			var updateMe = this.state.unfiltered[addPerk.Domain_Number].Perks[addPerk.Perk_Number];
			updateMe.Taken = true;
			if(isNull(updateMe.Retake_Count)) {
				updateMe["Retake_Count"] = 0;
			}
			updateMe.Retake_Count++;
			var tmp = {"Domain":addPerk.Domain,"Over_Domain":addPerk.Over_Domain,"Perks":[addPerk]};
			var curBuild = this.state.currentBuild;
			console.log("curBuild.length",curBuild.length);
			console.log("curBuild",curBuild);
			if(isNull(this.state.currentBuild) || this.state.currentBuild.length==0) {
				curBuild.push(tmp);
			}
			else {
				var added = false;
				for(var i=0; i<curBuild.length; i++) {
					console.log("curBuild["+i+"]",curBuild[i]);
					console.log(curBuild[i].Domain+"=="+addPerk.Domain,curBuild[i].Domain==addPerk.Domain);
					if(curBuild[i].Domain==addPerk.Domain && !added) {
						curBuild[i].Perks.push(addPerk);
						added = true;
					}
				}
				if(!added) {
					curBuild.push(tmp);
				}
			}
			console.log("curBuild",curBuild);
			this.state.currentBuild = curBuild;
		},
		
		checkPerk(jsonObj,overStr) {
			if(isNull(jsonObj.Title)) {
				jsonObj["Title"] = "";
			}
			else {
				jsonObj["Title"] = capitalSentance(jsonObj["Title"]);
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
			if(isNull(jsonObj.ID)) {
				jsonObj["ID"] = jsonObj.Domain_Number+"."+jsonObj.Perk_Number;
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
		},
		
		fetchBuild() {
			return this.state.currentBuild;
		},
		
		fetchList() {
			return this.state.unfiltered;
		},
		
		fetchFilteredList() {
			if(isNull(this.state.filtered)) {
				if(isNull(this.state.domainFilter)) {
					this.resetPerkList();
				}
				var doSourceFilter = this.state.sourceFilter;
				var filterList = [];
				for(var i=0; i<this.state.domainFilter.length; i++) {
					if(this.state.domainFilter[i]) {
						this.state.unfiltered[i].Perks.forEach(function(p) {
							if(doSourceFilter.includes(p.Source)) {
								if(!p.Taken || !p.Retake) {
									filterList.push(p);
								}
							}
						});
					}
				}
				this.state.filtered = filterList;
				return filterList;
			}
			else {
				return this.state.filtered;
			}
		},
		
		fetchFilteredBuild() {
			if(isNull(this.state.filteredBuild)) {
				if(isNull(this.state.domainFilter)) {
					this.resetPerkList();
				}
				var filterList = [];
				var doSourceFilter = this.state.sourceFilter;
				//var keys = Object.keys(this.state.minDomains);
				var curBuild = this.state.currentBuild;
				for(var d of curBuild) {
					if(doSourceFilter[this.state.minDomains[d.Domain]]) {
						filterList.push(d);
					}
				}
				this.state.filteredBuild = filterList;
				return filterList;
			}
			else {
				return this.state.filteredBuild;
			}
		},
		
		fetchFilteredDomains() {
			if(isNull(this.state.filteredDomain)) {
				if(isNull(this.state.domainFilter)) {
					this.resetPerkList();
				}
				var doSourceFilter = this.state.sourceFilter;
				var filterList = [];
				for(var i=0; i<this.state.domainFilter.length; i++) {
					if(this.state.domainFilter[i] && this.state.unfiltered[i].Perks.length>0) {
						filterList.push(this.state.unfiltered[i]);
					}
				}
				this.state.filteredDomain = filterList;
				return filterList;
			}
			else {
				return this.state.filteredDomain;
			}
		},
		
		fetchPerkList(selected) {
			var filterList = [];
			var doSourceFilter = this.state.sourceFilter;
			selected.Perks.forEach(function(p) {
				if(!isNull(doSourceFilter)) {
					if(doSourceFilter.includes(p.Source)) {
						if(!p.Taken || !p.Retake) {
							filterList.push(p);
						}
					}
				}
				else {
					filterList.push(p);
				}
			});
			return filterList;
		},
		
		createFilteredList() {
			if(isNull(this.state.domainFilter)) {
				this.resetPerkList();
			}
			var doSourceFilter = this.state.sourceFilter;
			var filterList = [];
			for(var i=0; i<this.state.domainFilter.length; i++) {
				if(this.state.domainFilter[i]) {
					this.state.unfiltered[i].Perks.forEach(function(p) {
						if(doSourceFilter.includes(p.Source)) {
							if(!p.Taken || !p.Retake) {
								filterList.push(p);
							}
						}
					});
				}
			}
			this.state.filtered = filterList;
			return filterList;
		},
		
		createFilteredBuild() {
			if(isNull(this.state.domainFilter)) {
				this.resetPerkList();
			}
			var filterList = [];
			var curBuild = this.state.currentBuild;
			curBuild.forEach(function(p) {
				if(this.state.costFilter.includes(p.Cost) && this.state.sourceFilter.includes(p.Source) && this.state.actDomainFilter.includes(p.Domain)) {
					filterList.push(p);
				}
			});
			this.state.filteredBuild = filterList;
			return filterList;
		},
		
		setSearchString(newString) {
			this.state.searchString = newString;
			console.log("Store ", newString);
		},
		
		setCostFilter(newFilter) {
			this.state.costFilter = newFilter;
			console.log("Store costFilter ", newFilter);
		},
		
		setDomainFilter(newFilter) {
			this.state.domainFilter = newFilter;
			console.log("Store domainFilter ", newFilter);
		},
		
		fetchRandomPerk() {
			var pl = [];
			if(!isNull(this.state.domainFilter)) {
				for(var i = 0; i < this.state.domainFilter.length; i++) {
					if(this.state.domainFilter[i]) {
						pl = pl.concat(this.state.unfiltered[i].Perks);
					}
				}
			}
			else {
				for(var d of this.state.unfiltered) {
					pl = pl.concat(this.state.unfiltered[i].Perks);
				}
			}
			if(!isNull(this.state.costFilter)) {
				var cF = this.state.costFilter;
				pl = pl.filter(function(p) {
					return cF.includes(p.Cost.toString());
				});
			}
			return pl[Math.floor(Math.random() * pl.length)];
		},
		
		createDefaultFilters() {
			this.state.checkDomain = [];
			this.state.domainFilter = [];
			this.state.domainNumber = {};
			this.state.minDomains = {};
			this.state.perksNum = {};
			this.state.allDomains = {};
			this.state.sourceFilter = [];
			this.state.upperFilter = [];
			this.state.allUppers = {};
			this.state.actDomainFilter = [];
			
			var newDomains = {};
			var newAllDomains = {};
			var newSourceFilter = [];
			var newUpperFilter = [];
			var newAllUppers = {};
			var newDomainNumber = {};
			var newDomainFilter = [];
			var newActDomainFilter = [];
			var newPerksNum = {};
			var newCheckDomain = [];
			var newCostFilter = [];
			
			var dNum = 0;
			var setFirst = false;
			var lastDomain = "";
			var lastDiv = null;
			var reg = new RegExp(/:? /g);
			this.state.unfiltered.forEach(function(d) {
				newDomains[d.Domain] = dNum;
				if(!newAllDomains.hasOwnProperty(d.Over_Domain)) {
					newAllDomains[d.Over_Domain] = [];
					newAllDomains[d.Over_Domain].push(d.Domain);
				}
				else {
					newAllDomains[d.Over_Domain].push(d.Domain);
				}
				
				d.Perks.forEach(function(p) {
					newSourceFilter.push(p.Source);
					newUpperFilter.push(p.Upper_Source);
					if(!newAllUppers.hasOwnProperty(d.Upper_Source)) {
						newAllUppers[d.Upper_Source] = [];
						newAllUppers[d.Upper_Source].push(d.Source);
					}
					else {
						newAllUppers[d.Upper_Source].push(d.Source);
					}
				});
				
				newDomainNumber[d.Domain] = dNum;
				newDomainFilter.push(true);
				newActDomainFilter.push(d.Domain);
				newPerksNum[d.Domain] = d.Perks.length;
				var id = d.Domain.replace(reg,"_");
				id = id.split(" ").join("_");
				newCheckDomain.push(id);
				dNum++;
			});
			
			newSourceFilter = [...new Set(newSourceFilter)];
			newSourceFilter.sort(function(a, b) {
				if(a.toLowerCase() < b.toLowerCase()) {
					return -1;
				}
				if(a.toLowerCase() > b.toLowerCase()) {
					return 1;
				}
				return 0;
			});
			this.state.sourceFilter = newSourceFilter;
			
			newUpperFilter = [...new Set(newUpperFilter)];
			newUpperFilter.sort(function(a, b) {
				if(a.toLowerCase() < b.toLowerCase()) {
					return -1;
				}
				if(a.toLowerCase() > b.toLowerCase()) {
					return 1;
				}
				return 0;
			});
			this.state.upperFilter = newUpperFilter;
			
			this.state.minDomains = newDomains;
			this.state.allDomains = newAllDomains;
			this.state.domainNumber = newDomainNumber;
			this.state.domainFilter = newDomainFilter;
			this.state.actDomainFilter = newActDomainFilter;
			this.state.perksNum = newPerksNum;
			this.state.checkDomain = newCheckDomain;
			
			var keys = Object.keys(this.state.allUppers);
			for(var i=0; i<keys.length; i++) {
				newAllUppers[keys[i]] = [...new Set(newAllUppers[keys[i]])];
				newAllUppers[keys[i]].sort(function(a, b) {
					if(a.toLowerCase() < b.toLowerCase()) {
						return -1;
					}
					if(a.toLowerCase() > b.toLowerCase()) {
						return 1;
					}
					return 0;
				});
			}
			this.state.allUppers = newAllUppers;
			
			var prcs = [];
			this.state.unfiltered.forEach(function(d) {
				d.Perks.forEach(function(f) {
					prcs.push(f.Cost);
				});
			});
			
			prcs = [...new Set(prcs)];
			prcs.sort(function(a, b) {
				return a - b;
			});
			prcs.forEach(function(d) {
				newCostFilter.push(""+d);
			});
			this.state.costFilter = newCostFilter;
			this.state.maxValue = prcs[prcs.length - 1];
		},
		
		doRoll(rollCount, isReroll) {
			var canDoRoll = true;
			if(isNull(isReroll)) isReroll = false;
			if(isNull(rollCount)) rollCount = 0;
			if(this.state.doRerolls) {
				if(rollCount > this.state.rollLimit) {
					canDoRoll = false;
				}
			}
			
			if(!isReroll) {
				this.state.currentCP+=100;
			}
			
			var res = this.fetchRandomPerk();
			
			//Check if need Reroll
			if(res.Taken && !res.Retake) {
				this.doRoll(rollCount,true);
			}
			if(res.Taken && res.Retake && res.Retake_Limit!=0) {
				if(res.Retake_Count >= res.Retake_Limit) {
					this.doRoll(rollCount,true);
				}
			}
			
			var resCost = res.Cost;
			if(res.Taken && res.Retake) {
				resCost = resCost * this.getMultiplier(res.Retake_Multiplier,res.Retake_Limit);
				if(res.Retake_Cost!=0) {
					resCost = res.Retake_Cost;
				}
			}
			if(!isNull(res.Discount_Title)) {
				if(haveTitle(res,"Discount_Title")) {
					resCost = roundCost(resCost * res.Discount_Multiplier);
					if(res.Discount_Cost!=0) {
						resCost = res.Discount_Cost;
					}
				}
			}
			
			var gained = false;
			var prereqList = this.findTitles(res,"Prereq_Title");
			
			if(this.state.currentCP >= resCost && haveTitle(res,"Prereq_Title") && canDoRoll && haveTitle(res,"Restrict_Title") && !haveTitle(res,"Exclude_Title")) {
				var temp = trimPerk(res);
				var ct = res.Title+"-"+res.Upper_Source;
				if(!hasTP(temp) && !hasCT(ct)) {
					this.state.currentCP -= resCost;
					addToTP(temp);
					if(!res.Taken) {
						addToCT(res.Title+"-"+res.Upper_Source);
					}
					res.Taken = true;
					res.Retake_Count++;
					gained = true;
					this.state.allMisses.push(this.state.missedPerk);
					this.state.missedPerk = 0;
					if(this.state.untilPerk && this.state.isRunning) {
						canRun = false;
						isRunning = false;
					}
				}
			}
			else if(!isNull(prereqList) && canDoRoll) {
				var i = 0;
				while(i<prereqList.length && !gained) {
					var prereqPerk = prereqList[i];
					resCost = prereqPerk.Cost;
					if(!prereqPerk.Taken) {
						if(!haveTitle(prereqPerk,"Prereq_Title")) {
							this.attemptPrereq(prereqPerk);
						}
						if(!isNull(prereqPerk.Discount_Title)) {
							if(haveTitle(prereqPerk,"Discount_Title")) {
								resCost = roundCost(resCost * prereqPerk.Discount_Multiplier);
							}
						}
						if(this.state.currentCP >= resCost && haveTitle(prereqPerk,"Prereq_Title")) {
							temp = trimPerk(prereqPerk);
							var ct = prereqPerk.Title+"-"+prereqPerk.Upper_Source;
							if(!hasTP(temp) && !hasCT(ct) && !prereqPerk.Taken) {
								this.state.currentCP -= resCost;
								addToTP(temp);
								addToCT(prereqPerk.Title+"-"+prereqPerk.Upper_Source);
								prereqPerk.Taken = true;
								prereqPerk.Retake_Count++;
								gained = true;
								this.state.allMisses.push(this.state.missedPerk);
								this.state.missedPerk = 0;
								if(this.state.untilPerk && this.state.isRunning) {
									this.state.canRun = false;
									this.state.isRunning = false;
								}
							}
							res = prereqPerk;
						}
					}
					i++;
				}
			}
			else if(this.state.doRerolls && canDoRoll) {
				this.doRoll(rollCount++,true);
			}
			else {
				this.state.missedPerk++;
			}
			
			this.state.currentRolls++;
			this.state.allRollCount++;
			
			this.state.canGet = gained;
			/*/
				if(gained) {
				this.state.allRolls.push(currentRolls);
				this.state.currentRolls = 0;
				this.addToBuild(res);
				}
			//*/
			this.state.currentPerk = res;
		},
		
		getRoll() {
			this.doRoll();
			this.fetchFreebies(this.state.currentPerk);
			return {"Add":this.state.canGet,"Perk":this.state.currentPerk,"Free":this.state.currentFreebies};
		},
		
		attemptPrereq(res) {
			var prereqPerk = this.findPerk(res);
			if(!isNull(prereqPerk)) {
				var result = true;
				var prereqList = prereqPerk;
				var i = 0;
				
				while(i<prereqList.length && result) {
					var addCurrent = true;
					var prereqPerk = prereqList[i];
					resCost = prereqPerk.Cost;
					
					if(!prereqPerk.Taken) {
						var resCost = prereqPerk.Cost;
						if(prereqPerk.Discount) {
							if(haveDiscount(prereqPerk)) {
								resCost = roundCost(resCost * prereqPerk.Discount_Multiplier);
							}
						}
						qs("#cur_cost").innerText = "" + resCost;
						
						if(!haveTitle(prereqPerk,"Prereq_Title") && haveTitle(res,"Restrict_Title") && !haveTitle(res,"Restrict_Title")) {
							addCurrent = this.attemptPrereq(prereqPerk);
						}
						else if(this.state.currentCP >= resCost && addCurrent && !haveTitle(res,"Restrict_Title")) {
							temp = trimPerk(prereqPerk);
							var ct = prereqPerk.Title+"-"+prereqPerk.Upper_Source;
							if(!hasTP(temp) && !hasCT(ct) && !prereqPerk.Taken) {
								this.state.currentCP -= resCost;
								addToTP(temp);
								addToCT(prereqPerk.Title+"-"+prereqPerk.Upper_Source);
								prereqPerk.Taken = true;
								prereqPerk.Retake_Count++;
								gained = true;
								this.state.allMisses.push(missedPerk);
								this.state.missedPerk = 0;
								if(this.state.untilPerk && this.state.isRunning) {
									this.state.canRun = false;
									this.state.isRunning = false;
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
		},
		
		findPerk(obj,recheck) {
			if(isNull(recheck)) recheck == false;
			if(isNull(this.state.unfiltered[obj.Domain_Number]) || recheck) {
				if(isNull(minDomains[obj.Domain]) || recheck) {
					if(isNull(obj.Over_Domain)) {
						for(var d of this.state.unfiltered) {
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
						for(var d of this.state.unfiltered) {
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
					for(var p of this.state.unfiltered[minDomains[obj.Domain]].Perks) {
						if(p.Title.toLowerCase()==obj.Title.toLowerCase() && p.Upper_Source.toLowerCase()==obj.Upper_Source.toLowerCase()) {
							return p;
						}
					}
					return findPerk(obj,true);
				}
			}
			else if(isNull(this.state.unfiltered[obj.Domain_Number].Perks[obj.Perk_Number])) {
				return findPerk(obj,true);
			}
			else {
				var p = this.state.unfiltered[obj.Domain_Number].Perks[obj.Perk_Number];
				if(p.Title.toLowerCase()==obj.Title.toLowerCase() && p.Upper_Source.toLowerCase()==obj.Upper_Source.toLowerCase()) {
					return p;
				}
				else {
					return findPerk(obj,true);
				}
			}
		},
		
		getMultiplier(multiplier,times) {
			if(multiplier==1) {
				return 1;
			}
			else {
				var multi = (times - 1);
				if(multi < 1) multi = 1;
				return multiplier * multi;
			}
		},
		
		fetchFreebies(perk) {
			if(!this.state.canGet) {
				this.state.currentFreebies = [];
				return [];
			}
			if(!this.state.doFree) {
				this.state.currentFreebies = [];
				return [];
			}
			var freeList = [];
			var isDoUp = this.state.doUpper;
			this.state.unfiltered.forEach(function(d) {
				d.Perks.forEach(function(e) {
					var ct = e.Title+"-"+e.Upper_Source;
					if(e.Source == perk.Source || (e.Upper_Source == perk.Upper_Source && isDoUp)) {
						if(e.Cost == 0 && haveTitle(e,"Prereq_Title") && haveTitle(e,"Restrict_Title") && !haveTitle(e,"Exclude_Title")) {
							var temp = compairMany(null,e);
							var tmp = trimPerk(e);
							if(!temp && !hasTP(tmp) && !hasCT(ct)) {
								if(perk != e) {
									freeList.push(e);
								}
							}
							else {
								temp = compairMany(null,e,true);
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
								if(add && !hasTP(tmp) && !hasCT(ct)) {
									if(perk != e) {
										freeList.push(e);
									}
								}
							}
						}
						else if(e.Free_Title != "" && haveTitle(e,"Free_Title") && haveTitle(e,"Prereq_Title") && haveTitle(e,"Restrict_Title") && !haveTitle(e,"Exclude_Title")) {
							var temp = compairMany(null,e);
							var tmp = trimPerk(e);
							if(!temp && !hasTP(tmp) && !hasCT(ct)) {
								if(perk != e) {
									freeList.push(e);
								}
							}
							else {
								temp = compairMany(null,e,true);
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
								if(add && !hasTP(tmp) && !hasCT(ct)) {
									if(perk != e) {
										freeList.push(e);
									}
								}
							}
						}
					}
					else if(!isNull(perk.Upper_Sources) && isDoUp) {
						perk.Upper_Sources.forEach(function(z) {
							if(z == e.Upper_Source || z == e.Source) {
								if(e.Cost == 0  && haveTitle(e,"Prereq_Title") && haveTitle(e,"Restrict_Title") && !haveTitle(e,"Exclude_Title")) {
									var temp = compairMany(null,e);
									var tmp = trimPerk(e);
									if(!temp && !hasCT(ct)) {
										freeList.push(e);
									}
									else {
										temp = compairMany(null,e,true);
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
										if(add && !hasCT(ct)) {
											freeList.push(e);
										}
									}
								}
								else if(!isNull(e.Free_Title) && haveTitle(e,"Free_Title") && haveTitle(e,"Prereq_Title") && haveTitle(e,"Restrict_Title") && !haveTitle(e,"Exclude_Title")) {
									var temp = compairMany(null,e,true);
									if(temp.length == 0 && !hasCT(ct)) {
										freeList.push(e);
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
										if(add && !hasCT(ct)) {
											freeList.push(e);
										}
									}
								}
							}
						});
					}
				});
			});
			this.state.currentFreebies = freeList;
			return freeList;
		},
		
		findTitles(obj,titleType) {
			var found = false;
			var tmp = [];
			var titleMatch = [];
			if(obj[titleType].includes("&&") || obj[titleType].includes("||")) {
				var tmpTitles = obj[titleType].replaceAll("(","");
				tmpTitles = tmpTitles.replaceAll(")","");
				var tmpTitleMatch = tmpTitles.split(/(\&\&|\|\|)/);
				for(var i=0; i<tmpTitleMatch.length; i++) {
					tmpTitleMatch[i] = tmpTitleMatch[i].trim();
					if(tmpTitleMatch[i]!="&&" && tmpTitleMatch[i]!="||") {
						titleMatch.push(tmpTitleMatch[i]+"-"+obj.Upper_Source.toLowerCase());
					}
				}
			}
			else {
				titleMatch.push(obj[titleType].toLowerCase()+"-"+obj.Upper_Source.toLowerCase());
			}
			this.state.unfiltered.forEach(function(d) {
				d.Perks.forEach(function(p) {
					var pTitle = p.Title.toLowerCase()+"-"+p.Upper_Source.toLowerCase();
					if(titleMatch.includes(pTitle)) {
						tmp.push(p);
					}
				});
			});
			return tmp;
		},
		
		checkPerks() {
			var callBack = this.checkPerk;
			var callNull = isNull;
			this.state.unfiltered.forEach(function(d) {
				d.Perks.forEach(function(p,idx,theArr) {
					theArr[idx] = callBack(p,d.Over_Domain);
				});
			});
		},
		
		resetPerkList() {
			this.state.unfiltered = perkList;
			this.sortPerks();
			this.checkPerks();
			this.createDefaultFilters();
		},
		
		addDomain(arr) {
			this.state.unfiltered.push(arr);
			for(var d of arr) {
				for(var p of d) {
					this.addToPerkList(p);
				}
			}
		},
		
		addToPerkList(toAdd) {
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
					addThis = this.checkPerk(addThis,perk.Over_Domain);
					if(isNull(perk.Domain)) {
						var optionsUnder = allDomains[perk.Over_Domain];
						addThis.Domain = optionsUnder[0];
					}
					if(isNull(this.state.unfiltered[minDomains[addThis.Domain]])) {
						this.state.unfiltered[minDomains[perk.Domain]] = {
							"Domain": addThis.Domain, "Over_Domain": addThis.Over_Domain, "Perks":[]
						};
					}
					this.state.unfiltered[minDomains[perk.Domain]].Perks.push(addThis);
				}
			}
			this.state.unfiltered.forEach(function(d) {
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
			this.sortPerks();
			this.createDefaultFilters();
		},
		
		fetchDisplayList(side) {
			if(side==1) {
				return this.fetchFilteredList();
			}
			if(side==2) {
				return this.fetchFilteredBuild();
			}
		}
	}
	
	export default {
		name: 'StateStore',
		state: store.state,
		addDomain: store.addDomain,
		addPerk: store.addToBuild,
		addPerkList: store.addToPerkList,
		clearDisplay: store.clearDisplayValue,
		createFilteredList: store.createFilteredList,
		fetchAllDomains: store.fetchAllDomains,
		fetchAllOverDomains: store.fetchAllOverDomains,
		fetchBuild: store.fetchBuild,
		fetchDisplayList: store.fetchDisplayList,
		fetchFilteredList: store.fetchFilteredList,
		fetchFilteredBuild: store.fetchFilteredBuild,
		fetchFilteredDomains: store.fetchFilteredDomains,
		fetchList: store.fetchList,
		fetchPerkList: store.fetchPerkList,
		getRoll: store.getRoll,
		removeDupes: store.removeDupes,
		resetPerkList: store.resetPerkList,
		resetFilters: store.createDefaultFilters,
		setDisplay: store.setDisplayValue,
		setCostFilter: store.setCostFilter,
		setDomainFilter: store.setDomainFilter,
		setSearchString: store.setSearchString,
		sortPerks: store.sortPerks,
		trimPerk: store.trimPerk,
		
		addOrigin: store.addOrigin,
		attemptPrereq: store.attemptPrereq,
		checkPerk: store.checkPerk,
		checkPerks: store.checkPerks,
		createFilteredBuild: store.createFilteredBuild,
		createDefaultFilters: store.createDefaultFilters,
		doRoll: store.doRoll,
		fetchFreebies: store.fetchFreebies,
		fetchRandomPerk: store.fetchRandomPerk,
		findTitles: store.findTitles,
		isItNull: store.isItNull,
		isOrigins: store.isOrigins,
	}
	
	function addToTP(obj) {
		tPerks.push(obj);
	}
	
	function hasTP(obj) {
		return tPerks.includes(obj);
	}
	
	function addToCT(obj) {
		cTitles.push(obj);
	}
	
	function hasCT(obj) {
		return cTitles.includes(obj);
	}
	
	function compairMany(a1,o1,isList) {
		if(isNull(isList)) {
			isList = false;
		}
		if(isNull(a1)) a1 = tPerks;
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
	
	function compairTwo(o1,o2) {
		var k1 = Object.keys(o1).sort();
		var k2 = Object.keys(o2).sort();
		var missed = [];
		var count = 0;
		var min_size = (k1.length > k2.length) ? k2.length : k1.length;
		if(o1==o2) return {"match":1,"missed":missed};
		if(o1.Source == o2.Source && o1.Title == o2.Title) {
			return {"match":1,"missed":missed};
		}
		for(var i=0; i<min_size; i++) {
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
	
	function evalTitles(obj,matchStr,titleType) {
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
			return cTitles.includes(matchStr+"-"+obj.Upper_Source);
		}
	}
	
	function haveTitle(obj,title) {
		var base = title.split("_")[0];
		if(obj[base]) {
			if(!obj[title].includes("&&") && !obj[title].includes("||")) {
				var tmpTitle = obj[title]+"-"+obj.Upper_Source;
				if(cTitles.includes(tmpTitle)) {
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
			if(title=="Exclude_Title") {
				return false;
			}
			else {
				return true;
			}
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
	
	function capitalSentance(txt) {
		var tmpTxt = stripCapital(txt);
		var regOne = new RegExp(/^([A-Z ]+)$/g);
		var regTwo = new RegExp(/^([A-Z\.]+)$/g);
		if(regOne.test(tmpTxt) && !regTwo.test(txt)) {
			txt = txt.toLowerCase();
		}
		var words = txt.split(" ");
		for(var i=0; i<words.length; i++) {
			if(!words[i].includes("-")) {
				if(!commons.includes(words[i].toLowerCase()) || i==0 || i==(words.length - 1)) {
					words[i] = capital(words[i]);
				}
				else {
					words[i] = words[i].toLowerCase();
				}
			}
			else {
				var tWords = words[i].split("-");
				for(var j=0; j<tWords.length; j++) {
					tWords[j] = capital(tWords[j]);
				}
			}
		}
		return words.join(" ");
	}
	
	function matchAnds(arr) {
		for(var i=0; i<arr.length; i++) {
			if(arr[i]!="true" && arr[i]!="false") {
				if(!cTitles.includes(arr[i])) {
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
				if(cTitles.includes(arr[i])) {
					return true;
				}
			}
			else if(arr[i]=="true") {
				return true;
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
	
	function stripString(str) {
		str = ""+str;
		str = str.toLowerCase();
		str = str.replaceAll(/[^a-z0-9 \-]/ig,"");
		return str;
	}
	
	function stripCapital(str) {
		str = ""+str;
		str = str.replaceAll(/[^A-Za-z0-9 \-]/ig,"");
		return str;
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
	
	function trimPerk(res) {
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
	
	function roundCost(obj) {
		var value = Math.round(obj);
		var remainder = obj % 50;
		remainder = Math.floor(remainder);
		value = value - remainder;
		return value;
	}
	
	function getOrd(i) {
		if(typeof i == "string" && i=="N/A") {
			return i;
		}
		if(typeof i == "string") {
			return ordinal_suffix_of(parseInt(i)) + " Perk";
		}
		if(typeof i == "number") {
			return ordinal_suffix_of(i) + " Perk";
		}
	}
	
	function ordinal_suffix_of(i) {
		var j = i % 10,
		k = i % 100;
		if (j == 1 && k != 11) {
			return i + "st";
		}
		if (j == 2 && k != 12) {
			return i + "nd";
		}
		if (j == 3 && k != 13) {
			return i + "rd";
		}
		return i + "th";
	}
</script>
