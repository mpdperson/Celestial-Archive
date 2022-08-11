<template>
	<div></div>
</template>
<script>
	import  { reactive } from 'vue'
	const perkListv1 = require('../../../public/json/cfv1_final.json');
	const perkListv2 = require('../../../public/json/celestial_forge.json');
	const perkListv3 = require('../../../public/json/celestial_forge.json');
	const perkList = require('../../../public/json/celestial_forge.json');
	const sourceDict = require('../../../public/json/source_origins.json');
	const upperDict = require('../../../public/json/all_upper.json');
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
			costToggle: [],
			upperToggle: [],
			docsToggle: [],
			domainToggle: [],
			actDomainFilter: [],
			domainFilter: [],
			unfiltered: perkListv1,
			filtered: [],
			filteredDomain: [],
			costDomain: [],
			sourceFilter: [],
			misses: [],
			allRolls: [],
			allMisses: [],
			sourceOrigins: sourceList,
			currentFreebies: [],
			bookmarkedPerks: [],
			searchResults: [],
			bookmarkLimit: 3,
			checkDomain: [],
			rejectedPerks: [],
			domainNumber: {},
			perksNum: {},
			allDomains: {},
			minDomains: {},
			currentPerk: null,
			currentPerks: [],
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
		
		setVersion(str) {
			if(str=="v1") {
				this.state.unfiltered = perkListv1;
			}
			if(str=="v2") {
				this.state.unfiltered = perkListv2;
			}
			if(str=="v3") {
				this.state.unfiltered = perkListv3;
			}
			if(str=="a1") {
				this.state.unfiltered = perkList;
			}
			this.resetForge();
			this.createDefaultFilters();
		},
		
		hasCurrent() {
			if(isNull(this.state.currentBuild)) return false;
			return this.state.currentBuild.includes(this.state.currentPerk);
		},
		
		isNullPerk() {
			var meh = {
				"ID": "Unique perk reference, format: domain#(.)perk#",
				"Title": "Selected perk title (currently none)",
				"Source": "Media property from which perk originates",
				"Cost": "Perk value in creation points, abbreviated",
				"Domain": "Clusters of conceptually similar perks",
				"Description": "General, functional perk definition",
				"Order":"N/A"
			};
			var com = this.state.displayValue;
			return (com.Title==meh.Title);
		},
		
		resetForge() {
			this.state.filteredBuild = [];
			this.state.currentBuild = [];
			this.state.costFilter = [];
			this.state.costToggle = [];
			this.state.upperToggle = [];
			this.state.docsToggle = [];
			this.state.domainToggle = [];
			this.state.actDomainFilter = [];
			this.state.domainFilter = [];
			this.state.filtered = [];
			this.state.filteredDomain = [];
			this.state.costDomain = [];
			this.state.sourceFilter = [];
			this.state.misses = [];
			this.state.allRolls = [];
			this.state.allMisses = [];
			this.state.currentFreebies = [];
			this.state.bookmarkedPerks = [];
			this.state.bookmarkLimit = 3;
			this.state.checkDomain = [];
			this.state.domainNumber = {};
			this.state.perksNum = {};
			this.state.allDomains = {};
			this.state.minDomains = {};
			this.state.currentPerk = null;
			this.state.currentPerks = [];
			this.state.currentCP = 0;
			this.state.currentRolls = 0;
			this.state.allRollCount = 0;
			this.state.missedPerk = 0;
			this.state.maxValue = 0;
			this.state.buildCount = 0;
		},
		
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
					newP["ID"] = domainCount+"."+perkCount;
					theArr[idx] = newP;
					perkCount++;
					if(d.Over_Domain=="Origins") {
						sourceTemp = addOrigin(newP,sourceTemp);
					}
				});
				d.Perks = d.Perks.filter(function(p) {
					return (!isNull(p));
				});
				domainCount++;
			});
			
			this.state.sourceOrigins = sourceTemp;
		},
		
		rejectPerk(selPerk) {
			this.state.rejectedPerks.push(selPerk);
			doRoll(0,true);
			this.fetchFreebies(this.state.currentPerk);
			return {"Add":this.state.canGet,"Perk":this.state.currentPerk,"Free":this.state.currentFreebies};
		},
		
		doSearch(search) {
			this.searchPerk(search.search,search.filters,search.att,search.margin);
			var results = this.state.searchResults;
			var newList = {};
			var returnList = [];
			results.forEach(function(n) {
				if(newList.hasOwnProperty(n.Domain)) {
					newList[n.Domain].Perks.push(n);
				}
				else {
					newList[n.Domain] = {"Domain":n.Domain,"Over_Domain":n.Over_Domain,"Perks":[n]};
				}
			});
			var keys = Object.keys(newList);
			for(var i=0; i<keys.length; i++) {
				var tmp = {"Domain":keys[i],"Over_Domain":newList[keys[i]].Over_Domain,"Perks":newList[keys[i]].Perks};
				returnList.push(tmp);
			}
			return returnList;
		},
		
		fetchSearchResults() {
			var results = this.state.searchResults;
			var newList = {};
			var returnList = [];
			results.forEach(function(n) {
				if(newList.hasOwnProperty(n.Domain)) {
					newList[n.Domain].Perks.push(n);
				}
				else {
					newList[n.Domain] = {"Domain":n.Domain,"Over_Domain":n.Over_Domain,"Perks":[n]};
				}
			});
			var keys = Object.keys(newList);
			for(var i=0; i<keys.length; i++) {
				var tmp = {"Domain":keys[i],"Over_Domain":newList[keys[i]].Over_Domain,"Perks":newList[keys[i]].Perks};
				returnList.push(tmp);
			}
			return returnList;
		},
		
		searchPerk(search,filters,att,margin) {
			if(isNull(margin)) {
				//60% seems a decent threshold
				margin = .6;
			}
			if(isNull(att)) {
				att = ["Title","Description","Source","Upper_Source"];
			}
			var filterSource = filters.Source;
			var filterUSource = filters.Upper_Source;
			var searchPerkList = this.state.filteredDomain;
			
			var results = [];
			searchPerkList.forEach(function(d) {
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
			
			this.state.searchResults = results;
			
			return results;
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
			
			this.state.allRolls.push(currentRolls);
			this.state.currentRolls = 0;
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
				return this.createFilteredList();
			}
			else {
				return this.state.filtered;
			}
		},
		
		fetchFilteredBuild() {
			if(isNull(this.state.filteredBuild)) {
				return this.createFilteredBuild();
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
			var doCostFilter = this.state.costFilter;
			var filtPerks = this.state.rejectedPerks;
			var filterList = [];
			for(var i=0; i<this.state.domainFilter.length; i++) {
				if(this.state.domainFilter[i]) {
					this.state.unfiltered[i].Perks.forEach(function(p) {
						if(doSourceFilter.includes(p.Source) && doCostFilter.includes(p.Cost)) {
							if(!filtPerks.includes(p)) {
								if(!p.Taken || p.Retake) {
									filterList.push(p);
								}
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
		
		attemptConjoin(res) {
			if(isNull(res.Conjoin_Title)) {
				this.state.currentPerks = [res];
				return res;
			}
			else {
				this.state.currentPerks = [];
				var cPerks = [];
				var findP = res.Conjoin_Title.split("&&");
				var source = res.Source;
				for(var i=0; i<findP.length; i++) {
					cPerks.push(findOnePerk(findP[i].trim(),source));
				}
				cPerks = cPerks.filter(function(n) {
					return (!isNull(n));
				});
				cPerks.sort(function(a, b) {
					if(a.Cost < b.Cost) {
						return -1;
					}
					if(a.Cost > b.Cost) {
						return 1;
					}
					return 0;
				});
				var cpnum = this.state.currentCP;
				var availPerk = [];
				var notBreak = true;
				var i = 0;
				while(cpnum>0 && notBreak && i<cPerks.length) {
					if(cPerks[i].Cost<=cpnum) {
						availPerk.push(cPerks[i]);
						cpnum -= cPerks[i].Cost;
					}
					else {
						notBreak = false;
					}
				}
				this.state.currentPerks = availPerk;
				if(!isNull(availPerk)) {
					if(availPerk.length > 0) return availPerk[0];
				}
				else {
					return res;
				}
			}
		},
		
		findOnePerk(title,source) {
			var pList = this.state.filteredDomain;
			for(var d of pList) {
				for(var p of d.Perks) {
					if(p.Title==title && p.Source==source) {
						return p;
					}
				}
			}
			return null;
		},
		
		updateCostFilter(selected) {
			var newFilter = this.state.costFilter;
			var newToggle = this.state.costToggle;
			if(selected.Cost=="All") {
				var newBool = !selected.Enabled;
				console.log("updateCostFilter",newBool);
				newToggle.forEach(function(n) {
					n.Enabled = newBool;
					if(newBool) {
						newFilter.push(n.Cost);
					}
				});
				if(!newBool) {
					console.log("Reset Cost Filter");
					newFilter = [];
				}
			}
			else {
				if(selected.Enabled) {
					newFilter = newFilter.filter(function(n) {
						return (n!=selected.Cost);
					});
				}
				else {
					newFilter.push(selected.Cost);
				}
				for(var i=0; i<newToggle.length; i++) {
					if(newToggle[i].Cost==selected.Cost) {
						newToggle[i].Enabled = !newToggle[i].Enabled;
					}
				}
			}
			newFilter = [...new Set(newFilter)];
			newFilter.sort();
			
			this.state.costFilter = newFilter;
			this.state.costToggle = newToggle;
			
			this.updateBuildList();
			this.updatePerkList();
			
			return newToggle;
		},
		
		updateFandomFilter(filterStr) {
			if(!isNull(filterStr)) {
				if(filterStr.length>=3) {
					var newToggle = JSON.parse(JSON.stringify(this.state.upperToggle));
					newToggle = newToggle.filter(function(n) {
						return (n.Fandom.toLowerCase().includes(filterStr.toLowerCase()) || n.Fandom=="All");
					});
					return newToggle;
				}
			}
			if(isNull(filterStr)) {
				return this.state.upperToggle;
			}
		},
		
		updateDocsFilter(selected) {
			var newFilter = this.state.sourceFilter;
			var newUpToggle = this.state.upperToggle;
			var newToggle = [];
			
			var idx = -1;
			for(var i=0; i<newUpToggle.length; i++) {
				if(newUpToggle[i].Fandom==selected.Fandom) {
					newToggle = newUpToggle[i];
					idx = i;
					break;
				}
			}
			var newBool = !selected.Enabled;
			if(selected.Document=="All") {
				if(newBool) {
					for(var i=0; i<newToggle.Documents.length; i++) {
						newToggle.Documents[i].Enabled = newBool;
						newFilter.push(newToggle.Documents[i].Document);
					}
				}
				else {
					for(var i=0; i<newToggle.Documents.length; i++) {
						newToggle.Documents[i].Enabled = newBool;
					}
					var removeThese = [];
					newToggle.Documents.forEach(function(n) {
						if(n.Document!="All") removeThese.push(n.Document);
					});
					newFilter = newFilter.filter(function(n) {
						return !(removeThese.includes(n));
					});
				}
			}
			else {
				for(var i=0; i<newToggle.Documents.length; i++) {
					if(selected.Document==newToggle.Documents[i].Document) {
						newToggle.Documents[i].Enabled = newBool;
						if(newBool) {
							newFilter.push(newToggle.Documents[i].Document);
						}
						else {
							newFilter = newFilter.filter(function(n) {
								return (newToggle.Documents[i].Document!=n);
							});
						}
						break;
					}
				}
			}
			newUpToggle[idx] = newToggle;
			
			newFilter = [...new Set(newFilter)];
			newFilter.sort(function(a, b) {
				if(a.toLowerCase() < b.toLowerCase()) {
					return -1;
				}
				if(a.toLowerCase() > b.toLowerCase()) {
					return 1;
				}
				return 0;
			});
			this.state.sourceFilter = newFilter;
			this.state.upperToggle = newUpToggle;
			
			this.updateBuildList();
			this.updatePerkList();
			
			return newUpToggle;
		},
		
		updateDocsFilterAll(selected) {
			var newFilter = this.state.sourceFilter;
			var newUpToggle = this.state.upperToggle;
			
			var newBool = !selected.Enabled;
			if(selected.Document=="All") {
				if(newBool) {
					for(var j=0; j<newUpToggle.length; j++) {
						var newToggle = newUpToggle[j];
						for(var i=0; i<newToggle.Documents.length; i++) {
							newToggle.Documents[i].Enabled = newBool;
							newFilter.push(newToggle.Documents[i].Document);
						}
					}
				}
				else {
					for(var j=0; j<newUpToggle.length; j++) {
						var newToggle = newUpToggle[j];
						for(var i=0; i<newToggle.Documents.length; i++) {
							newToggle.Documents[i].Enabled = newBool;
						}
						var removeThese = [];
						newToggle.Documents.forEach(function(n) {
							if(n.Document!="All") removeThese.push(n.Document);
						});
						newFilter = newFilter.filter(function(n) {
							return !(removeThese.includes(n));
						});
					}
				}
			}
			
			newFilter = [...new Set(newFilter)];
			newFilter.sort(function(a, b) {
				if(a.toLowerCase() < b.toLowerCase()) {
					return -1;
				}
				if(a.toLowerCase() > b.toLowerCase()) {
					return 1;
				}
				return 0;
			});
			
			this.state.sourceFilter = newFilter;
			this.state.upperToggle = newUpToggle;
			
			this.updateBuildList();
			this.updatePerkList();
			
			return newUpToggle;
		},
		
		updateDomainFilter(selected) {
			var newFilter = this.state.domainFilter;
			var newToggle = this.state.domainToggle;
			
			if(selected.Domain=="All") {
				var newBool = !selected.Enabled;
				for(var i=0; i<newToggle.length; i++) {
					newToggle[i].Enabled = newBool;
				}
				for(var i=0; i<newFilter.length; i++) {
					newFilter[i] = newBool;
				}
			}
			else {
				var idx = this.state.minDomains[selected.Domain];
				newFilter[idx] = !newFilter[idx];
				
				for(var i=0; i<newToggle.length; i++) {
					if(newToggle[i].Domain==selected.Domain) {
						newToggle[i].Enabled = newFilter[idx];
						break;
					}
				}
			}
			
			this.state.domainFilter = newFilter;
			this.state.docsToggle = newToggle;
			
			this.updateBuildList();
			this.updatePerkList();
			
			return newToggle;
		},
		
		updateDomainFilterAll(selected,domArr) {
			var newFilter = this.state.domainFilter;
			var newToggle = this.state.domainToggle;
			
			if(selected.Domain=="All") {
				var newBool = !selected.Enabled;
				for(var i=0; i<newToggle.length; i++) {
					if(domArr.includes(newToggle[i].Domain)) newToggle[i].Enabled = newBool;
				}
				for(var i=0; i<newFilter.length; i++) {
					if(domArr.includes(newToggle[i].Domain)) newFilter[i] = newBool;
				}
			}
			
			this.state.domainFilter = newFilter;
			this.state.docsToggle = newToggle;
			
			this.updateBuildList();
			this.updatePerkList();
			
			return newToggle;
		},
		
		updateBuildList() {
			var filterList = [];
			var doSourceFilter = this.state.sourceFilter;
			var doDomainFilter = this.state.domainFilter;
			var doCostFilter = this.state.costFilter;
			var mDomain = this.state.minDomains;
			var curBuild = this.state.currentBuild;
			for(var d of curBuild) {
				if(doDomainFilter[mDomain[d.Domain]]) {
					var tmpD = {"Domain":d.Domain,"Over_Domain":d.Over_Domain,"Perks":[]};
					for(var p of d.Perks) {
						if(doSourceFilter.includes(p.Source) && doCostFilter.includes(""+p.Cost)) {
							tmpD.Perks.push(p);
						}
					}
					if(tmpD.Perks.length > 0) {
						filterList.push(tmpD);
					}
				}
			}
			this.state.filteredBuild = filterList;
		},
		
		updatePerkList() {
			var doSourceFilter = this.state.sourceFilter;
			var doDomainFilter = this.state.domainFilter;
			var doCostFilter = this.state.costFilter;
			var mDomain = this.state.minDomains;
			var curList = this.state.unfiltered;
			var filterList = [];
			for(var d of curList) {
				if(doDomainFilter[mDomain[d.Domain]]) {
					var tmpD = {"Domain":d.Domain,"Over_Domain":d.Over_Domain,"Perks":[]};
					for(var p of d.Perks) {
						if(doSourceFilter.includes(p.Source) && doCostFilter.includes(""+p.Cost)) {
							tmpD.Perks.push(p);
						}
					}
					if(tmpD.Perks.length > 0) {
						filterList.push(tmpD);
					}
				}
			}
			this.state.filteredDomain = filterList;
			return filterList;
		},
		
		costPerkList() {
			if(isNull(this.state.domainFilter)) {
				this.createDefaultFilters();
			}
			var doSourceFilter = this.state.sourceFilter;
			var doDomainFilter = this.state.domainFilter;
			var doCostFilter = this.state.costFilter;
			var mDomain = this.state.minDomains;
			var curList = this.state.unfiltered;
			var curCP =  this.state.currentCP;
			var filterList = [];
			for(var d of curList) {
				if(doDomainFilter[mDomain[d.Domain]]) {
					var tmpD = {"Domain":d.Domain,"Over_Domain":d.Over_Domain,"Perks":[]};
					for(var p of d.Perks) {
						if(doSourceFilter.includes(p.Source) && (p.Cost<=curCP) && doCostFilter.includes(""+p.Cost)) {
							tmpD.Perks.push(p);
						}
					}
					if(tmpD.Perks.length > 0) {
						filterList.push(tmpD);
					}
				}
			}
			this.state.costDomain = filterList;
			return filterList;
		},
		
		fetchFilters() {
			if(isNull(this.state.domainFilter)) {
				this.createDefaultFilters();
			}
			var tmp = {"costToggle":this.state.costToggle,"fandomToggle":this.state.upperToggle,"docsToggle":this.state.docsToggle,"domainToggle":this.state.domainToggle};
			return tmp;
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
		
		fetchRandomPerk(isCost) {
			if(isNull(isCost)) isCost = false;
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
			if(isCost) {
				var cF = this.state.currentCP;
				pl = pl.filter(function(p) {
					return (p.Cost<=cF);
				});
			}
			else if(!isNull(this.state.costFilter)) {
				var cF = this.state.costFilter;
				pl = pl.filter(function(p) {
					return cF.includes(p.Cost.toString());
				});
			}
			if(!isNull(this.state.sourceFilter)) {
				var sF = this.state.sourceFilter;
				pl = pl.filter(function(p) {
					return sF.includes(p.Source);
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
			this.state.allUppers = {};
			this.state.actDomainFilter = [];
			this.state.docsToggle = [];
			this.state.costToggle = [];
			this.state.upperToggle = [];
			
			var newDomains = {};
			var newAllDomains = {};
			var newSourceFilter = [];
			var newUpperFilter = [];
			var newAllUppers = {};
			var newDomainNumber = {};
			var newDomainFilter = [];
			var newDomainToggle = [];
			var newActDomainFilter = [];
			var newPerksNum = {};
			var newCheckDomain = [];
			var newCostFilter = [];
			var newDocsToggle = [];
			
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
					if(!newAllUppers.hasOwnProperty(p.Upper_Source)) {
						newAllUppers[p.Upper_Source] = [];
						newAllUppers[p.Upper_Source].push(p.Source);
					}
					else {
						newAllUppers[p.Upper_Source].push(p.Source);
					}
				});
				
				newDomainNumber[d.Domain] = dNum;
				newDomainFilter.push(true);
				var tmpD = {"Domain":d.Domain,"Over_Domain":d.Over_Domain,"Enabled":true};
				newDomainToggle.push(tmpD);
				newActDomainFilter.push(d.Domain);
				newPerksNum[d.Domain] = d.Perks.length;
				var id = d.Domain.replace(reg,"_");
				id = id.split(" ").join("_");
				newCheckDomain.push(id);
				dNum++;
			});
			newDomainToggle.unshift({"Domain":"All","Over_Domain":"All","Enabled":true});
			
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
			
			this.state.docsToggle = newDocsToggle;
			this.state.minDomains = newDomains;
			this.state.allDomains = newAllDomains;
			this.state.domainNumber = newDomainNumber;
			this.state.domainFilter = newDomainFilter;
			this.state.domainToggle = newDomainToggle;
			this.state.actDomainFilter = newActDomainFilter;
			this.state.perksNum = newPerksNum;
			this.state.checkDomain = newCheckDomain;
			
			var keys = Object.keys(newAllUppers);
			keys.sort(function(a, b) {
				if(a.toLowerCase() < b.toLowerCase()) {
					return -1;
				}
				if(a.toLowerCase() > b.toLowerCase()) {
					return 1;
				}
				return 0;
			});
			var sortedAllUppers = {};
			var newUpperToggle = [];
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
				sortedAllUppers[keys[i]] = newAllUppers[keys[i]];
				var tmp = {"Fandom":keys[i],"Enabled":true,"Documents":[]};
				var newArr = [];
				sortedAllUppers[keys[i]].forEach(function(n) {
					newArr.push({"Fandom":keys[i],"Document":n,"Enabled":true});
				});
				newArr.unshift({"Fandom":keys[i],"Document":"All","Enabled":true});
				tmp["Documents"] = newArr;
				newUpperToggle.push(tmp);
			}
			this.state.allUppers = sortedAllUppers;
			this.state.upperToggle = newUpperToggle;
			newSourceFilter.forEach(function(n) {
				var tmp = {"Document":n,"Enabled":true};
				newDocsToggle.push(tmp);
			});
			
			var prcs = [];
			this.state.unfiltered.forEach(function(d) {
				d.Perks.forEach(function(f) {
					prcs.push(f.Cost);
				});
			});
			
			var newCostToggle = [];
			prcs = [...new Set(prcs)];
			prcs.sort(function(a, b) {
				return a - b;
			});
			prcs.forEach(function(d) {
				newCostFilter.push(""+d);
				var tmp = {"Cost":""+d,"Enabled":true};
				newCostToggle.push(tmp);
			});
			newCostToggle.unshift({"Cost":"All","Enabled":true});
			this.state.costFilter = newCostFilter;
			this.state.costToggle = newCostToggle;
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
			res = this.attemptConjoin(res);
			
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
			this.state.currentPerk = res;
		},
		
		setCurrentCP(newCP) {
			this.state.currentCP = newCP;
		},
		
		doBuy(rollCount, isReroll) {
			var canDoRoll = true;
			if(isNull(isReroll)) isReroll = false;
			if(isNull(rollCount)) rollCount = 0;
			if(this.state.doRerolls) {
				if(rollCount > this.state.rollLimit) {
					canDoRoll = false;
				}
			}
			
			var res = this.fetchRandomPerk(true);
			res = this.attemptConjoin(res);
			
			//Check if need Reroll
			if(res.Taken && !res.Retake) {
				this.doBuy(rollCount,true);
			}
			if(res.Taken && res.Retake && res.Retake_Limit!=0) {
				if(res.Retake_Count >= res.Retake_Limit) {
					this.doBuy(rollCount,true);
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
				this.doBuy(rollCount++,true);
			}
			else {
				this.state.missedPerk++;
			}
			
			this.state.currentRolls++;
			this.state.allRollCount++;
			
			this.state.canGet = gained;
			this.state.currentPerk = res;
		},
		
		getRoll() {
			this.doRoll();
			this.fetchFreebies(this.state.currentPerk);
			return {"Add":this.state.canGet,"Perk":this.state.currentPerk,"Free":this.state.currentFreebies};
		},
		
		fetchCurrent() {
			this.fetchFreebies(this.state.currentPerk);
			return {"Add":this.state.canGet,"Perk":this.state.currentPerk,"Free":this.state.currentFreebies};
		},
		
		getBuy() {
			this.doBuy();
			this.fetchFreebies(this.state.currentPerk);
			return {"Add":this.state.canGet,"Perk":this.state.currentPerk,"Free":this.state.currentFreebies};
		},
		
		increment() {
			this.state.currentCP+=100;
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
		
		fetchFreePerks() {
			var curFree = this.state.currentFreebies;
			var newList = {};
			var returnList = [];
			curFree.forEach(function(n) {
				if(newList.hasOwnProperty(n.Domain)) {
					newList[n.Domain].Perks.push(n);
				}
				else {
					newList[n.Domain] = {"Domain":n.Domain,"Over_Domain":n.Over_Domain,"Perks":[n]};
				}
			});
			var keys = Object.keys(newList);
			for(var i=0; i<keys.length; i++) {
				var tmp = {"Domain":keys[i],"Over_Domain":newList[keys[i]].Over_Domain,"Perks":newList[keys[i]].Perks};
				returnList.push(tmp);
			}
			return returnList;
		},
		
		fetchConjoinPerks() {
			var curPerks = this.state.currentPerks;
			var newList = {};
			var returnList = [];
			curPerks.forEach(function(n) {
				if(newList.hasOwnProperty(n.Domain)) {
					newList[n.Domain].Perks.push(n);
				}
				else {
					newList[n.Domain] = {"Domain":n.Domain,"Over_Domain":n.Over_Domain,"Perks":[n]};
				}
			});
			var keys = Object.keys(newList);
			for(var i=0; i<keys.length; i++) {
				var tmp = {"Domain":keys[i],"Over_Domain":newList[keys[i]].Over_Domain,"Perks":newList[keys[i]].Perks};
				returnList.push(tmp);
			}
			return returnList;
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
		},
		
		setBookmark(selected) {
			var newBookmarks = this.state.bookmarkedPerks;
			if(!newBookmarks.includes(selected)) {
				newBookmarks.unshift(selected);
				newBookmarks.length = this.state.bookmarkLimit;
			}
			this.state.bookmarkedPerks = newBookmarks;
		},
		
		fetchBookmarks() {
			var newList = {};
			var returnList = [];
			var books = this.state.bookmarkedPerks;
			books.forEach(function(n) {
				if(newList.hasOwnProperty(n.Domain)) {
					newList[n.Domain].Perks.push(n);
				}
				else {
					newList[n.Domain] = {"Domain":n.Domain,"Over_Domain":n.Over_Domain,"Perks":[n]};
				}
			});
			var keys = Object.keys(newList);
			for(var i=0; i<keys.length; i++) {
				var tmp = {"Domain":keys[i],"Over_Domain":newList[keys[i]].Over_Domain,"Perks":newList[keys[i]].Perks};
				returnList.push(tmp);
			}
			return returnList;
		},
		
		saveProgress() {
			var prog = {
				"Current_CP":this.state.currentCP,
				"Gained_Perks":this.state.currentBuild,
				"Missed_Perk":this.state.missedPerk,
				"Current_Rolls":this.state.currentRolls,
				"All_Rolls":this.state.allRolls,
				"Roll_Count":this.state.allRollCount,
				"All_Misses":this.state.allMisses
			};
			saveJson(prog,"progress.js",false);
		},
		
		loadProgress(jsonObj) {
			if(isNull(jsonObj)) return;
			this.state.currentCP = jsonObj.Current_CP;
			this.state.missedPerk = jsonObj.Missed_Perk;
			this.state.currentRolls = jsonObj.Current_Rolls;
			this.state.allRolls = jsonObj.All_Rolls;
			this.state.allRollCount = jsonObj.Roll_Count;
			this.state.allMisses = jsonObj.All_Misses;
			var cPerks = jsonObj.Gained_Perks;
			var flatPerks = []
			cPerks.forEach(function(n) {
				n.Perks.forEach(function(p) {
					flatPerks.push(p);
				});
			});
			flatPerks.sort(function(a,b) {
				if(a.Order.toLowerCase() < b.Order.toLowerCase()) {
					return -1;
				}
				if(a.Order.toLowerCase() > b.Order.toLowerCase()) {
					return 1;
				}
				return 0;
			});
			flatPerks.forEach(function(n) {
				this.state.currentFreebies = fetchFreebies(n);
				this.addToBuild(n);
			});
		},
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
		costFilteredDomains: store.costFilteredDomains,
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
		setBookmark: store.setBookmark,
		sortPerks: store.sortPerks,
		trimPerk: store.trimPerk,
		fetchFilters: store.fetchFilters,
		updateCostFilter: store.updateCostFilter,
		updateFandomFilter: store.updateFandomFilter,
		updateDocsFilter: store.updateDocsFilter,
		updateDocsFilterAll: store.updateDocsFilterAll,
		updateDomainFilter: store.updateDomainFilter,
		updateDomainFilterAll: store.updateDomainFilterAll,
		costPerkList: store.costPerkList,
		setVersion: store.setVersion,
		resetForge: store.resetForge,
		rejectPerk: store.rejectPerk,
		searchPerk: store.searchPerk,
		doSearch: store.doSearch,
		fetchSearchResults: store.fetchSearchResults,
		setCurrentCP: store.setCurrentCP,
		hasCurrent: store.hasCurrent,
		isNullPerk: store.isNullPerk,
		
		attemptPrereq: store.attemptPrereq,
		checkPerk: store.checkPerk,
		checkPerks: store.checkPerks,
		createFilteredBuild: store.createFilteredBuild,
		createDefaultFilters: store.createDefaultFilters,
		doRoll: store.doRoll,
		getBuy: store.getBuy,
		fetchFreebies: store.fetchFreebies,
		fetchConjoinPerks: store.fetchConjoinPerks,
		fetchFreePerks: store.fetchFreePerks,
		fetchRandomPerk: store.fetchRandomPerk,
		findTitles: store.findTitles,
		updateBuildList: store.updateBuildList,
		updatePerkList: store.updatePerkList,
		saveProgress: store.saveProgress,
		loadProgress: store.loadProgress,
		fetchMaxValue: store.fetchMaxValue,
		doBuy: store.doBuy,
		increment: store.increment,
		fetchBookmarks: store.fetchBookmarks,
		attemptConjoin: store.attemptConjoin,
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
	
	function isOrigins(obj,source_origins) {
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
	
	function addOrigin(obj,sourceTemp) {
		var isAdded = false;
		sourceTemp.forEach(function(d) {
			if(d.Source.toLowerCase()==obj.Source.toLowerCase()) {
				isAdded = true;
				if(obj.Domain.toLowerCase().includes("background")) {
					if(!isOrigins(obj,sourceTemp)) d.Origins.Background.push(obj);
				}
				if(obj.Domain.toLowerCase().includes("species")) {
					if(!isOrigins(obj,sourceTemp)) d.Origins.Species.push(obj);
				}
			}
		});
		
		if(!isAdded) {
			var tmpD = {
				"Source":obj.Source,
				"Upper_Source":obj.Upper_Source,
				"Origins":{"Background":[],"Species":[]}
			};
			if(obj.Domain.toLowerCase().includes("background")) {
				if(!isOrigins(obj,sourceTemp)) tmpD.Origins.Background.push(obj);
			}
			if(obj.Domain.toLowerCase().includes("species")) {
				if(!isOrigins(obj,sourceTemp)) tmpD.Origins.Species.push(obj);
			}
			sourceTemp.push(tmpD);
		}
		return sourceTemp;
	}
	
	function download(content, fileName, contentType) {
		var a = document.createElement("a");
		var file = new Blob([content], {type: contentType});
		a.href = URL.createObjectURL(file);
		a.download = fileName;
		a.click();
	}
	
	function saveJson(jsonData, fileName, isVar) {
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
	
	function compairThis(a,b,margin) {
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
	
	function similarity(a, b) {
		a = stripString(a);
		b = stripString(b);
		var ld = ldPercent(a,b);
		var cs = textCosineSimilarity(a, b);
		var jw = JaroWrinker(a, b);
		var as = arraySimilar(a, b);
		return {"ld":ld, "cs":cs, "jw":jw, "as":as};
	}
	
	function ldPercent(a, b) {
		var difference = LevenshteinDistance(a, b);
		var max = (a.length > b.length) ? a.length : b.length;
		var ld = ((max - difference) / max);
		return ld;
	}
	
	function arraySimilar(a,b) {
		a = stripCommon(a);
		b = stripCommon(b);
		var m = a.split(" ");
		var n = b.split(" ");
		m = [...new Set(m)];
		n = [...new Set(n)];
		var c = m.concat(n);
		c = [...new Set(c)];
		var o = (c.length / (m.length + n.length));
		o = 1 - o;
		return o;
	}
	
	function stripCommon(str) {
		commons.forEach(function(d) {
			str = str.replaceAll(d, "");
			str = str.replaceAll("  ", " ");
			str = str.trim();
		});
		return str;
	}
	
	function stripString(a) {
		a = a.toLowerCase();
		a = a.replace(/[^a-z\- ]/g, '');
		a = a.replace(/\s+/g, ' ');
		a = a.trim();
		return a;
	}
	
	function LevenshteinDistance(a, b){
		if(a.length == 0) return b.length;
		if(b.length == 0) return a.length;
		var matrix = [];
		// increment along the first column of each row
		var i;
		for(i = 0; i <= b.length; i++){
			matrix[i] = [i];
		}
		// increment each column in the first row
		var j;
		for(j = 0; j <= a.length; j++){
			matrix[0][j] = j;
		}
		// Fill in the rest of the matrix
		for(i = 1; i <= b.length; i++){
			for(j = 1; j <= a.length; j++){
				if(b.charAt(i-1) == a.charAt(j-1)){
					matrix[i][j] = matrix[i-1][j-1];
				}
				else {
					matrix[i][j] = Math.min(
					matrix[i-1][j-1] + 1, // substitution
					Math.min(matrix[i][j-1] + 1, // insertion
					matrix[i-1][j] + 1) // deletion
					);
				}
			}
		}
		return matrix[b.length][a.length];
	};
	
	function termFreqMap(str) {
		var words = str.split(' ');
		var termFreq = {};
		words.forEach(function(w) {
			termFreq[w] = (termFreq[w] || 0) + 1;
		});
		return termFreq;
	}
	
	function addKeysToDict(map, dict) {
		for (var key in map) {
			dict[key] = true;
		}
	}
	
	function termFreqMapToVector(map, dict) {
		var termFreqVector = [];
		for (var term in dict) {
			termFreqVector.push(map[term] || 0);
		}
		return termFreqVector;
	}
	
	function vecDotProduct(vecA, vecB) {
		var product = 0;
		for (var i = 0; i < vecA.length; i++) {
			product += vecA[i] * vecB[i];
		}
		return product;
	}
	
	function vecMagnitude(vec) {
		var sum = 0;
		for (var i = 0; i < vec.length; i++) {
			sum += vec[i] * vec[i];
		}
		return Math.sqrt(sum);
	}
	
	function cosineSimilarity(vecA, vecB) {
		return vecDotProduct(vecA, vecB) / (vecMagnitude(vecA) * vecMagnitude(vecB));
	}
	
	function textCosineSimilarity(strA, strB) {
		var termFreqA = termFreqMap(strA);
		var termFreqB = termFreqMap(strB);
		var dict = {};
		
		addKeysToDict(termFreqA, dict);
		addKeysToDict(termFreqB, dict);
		
		var termFreqVecA = termFreqMapToVector(termFreqA, dict);
		var termFreqVecB = termFreqMapToVector(termFreqB, dict);
		return cosineSimilarity(termFreqVecA, termFreqVecB);
	}
	
	function JaroWrinker(s1, s2) {
		var m = 0;
		// Exit early if either are empty.
		if (s1.length === 0 || s2.length === 0) {
			return 0;
		}
		// Exit early if they're an exact match.
		if (s1 === s2) {
			return 1;
		}
		var range = (Math.floor(Math.max(s1.length, s2.length) / 2)) - 1;
		var s1Matches = new Array(s1.length);
		var s2Matches = new Array(s2.length);
		for (i = 0; i < s1.length; i++) {
			var low	= (i >= range) ? i - range : 0;
			var high = (i + range <= s2.length) ? (i + range) : (s2.length - 1);
			for (j = low; j <= high; j++) {
				if (s1Matches[i] !== true && s2Matches[j] !== true && s1[i] === s2[j]) {
					++m;
					s1Matches[i] = s2Matches[j] = true;
					break;
				}
			}
		}
		// Exit early if no matches were found.
		if (m === 0) {
			return 0;
		}
		// Count the transpositions.
		var k = n_trans = 0;
		for (i = 0; i < s1.length; i++) {
			if (s1Matches[i] === true) {
				for (j = k; j < s2.length; j++) {
					if (s2Matches[j] === true) {
						k = j + 1;
						break;
					}
				}
				if (s1[i] !== s2[j]) {
					++n_trans;
				}
			}
		}
		var weight = (m / s1.length + m / s2.length + (m - (n_trans / 2)) / m) / 3;
		var l = 0;
		var p = 0.1;
		if (weight > 0.7) {
			while (s1[l] === s2[l] && l < 4) {
				++l;
			}
			weight = weight + l * p * (1 - weight);
		}
		return weight;
	}
</script>
