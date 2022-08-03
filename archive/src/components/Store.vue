<template>
	<div> </div>
</template>

<script>
	import  { reactive } from 'vue'
	const perkList = require('../../../public/json/celestial_forge.json');
	
	const store = {
		debug: true,
		state: reactive({
			displayValue: {
				"ID": "Unique perk reference, format: domain#(.)perk#",
				"Title": "Selected perk title (currently none)",
				"Source": "Media property from which perk originates",
				"Cost": "Perk value in creation points, abbreviated",
				"Domain": "Clusters of conceptually similar perks",
				"Description": "General, functional perk definition"
			},
			build: [],
			costFilter: [],
			actDomainFilter: [],
			domainFilter: [],
			unfiltered: perkList,
			sourceFilter: [],
			upperFilter: [],
			currentTitles: [],
			trimPerks: [],
			misses: [],
			allRolls: [],
			allMisses: [],
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
			doFree: true,
			doUpper: false,
			doRerolls: false,
			canGet: false,
			rollLimit: 3,
			searchString: ''
		}),
		
		setDisplayValue (newValue) {
			if(this.isNull(this.state.domainFilter)) {
				this.createDefaultFilters();
			}
			if (this.debug) {
				console.log('store.setDisplayValue called with', newValue)
			}
			this.state.displayValue = newValue
		},
		
		fetchMaxValue() {
			if(this.isNull(this.state.domainFilter)) {
				this.createDefaultFilters();
			}
			return this.state.maxValue;
		},
		
		sortPerks() {
			this.state.unfiltered.sort(function(a, b) {
				if (a.Domain.toLowerCase() < b.Domain.toLowerCase()) {
					return -1;
				}
				if (a.Domain.toLowerCase() > b.Domain.toLowerCase()) {
					return 1;
				}
				return 0;
			});
			var domainCount = 0;
			this.state.unfiltered.forEach(function(d) {
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
					return (!this.isNull(p));
				});
				domainCount++;
			});
		},
		
		removeDupes() {
			var titleArray = [];
			var uniqueArray = [];
			var matchArray = [];
			var perks = [];
			$.each(this.state.unfiltered, function(index, item) {
				$.each(item.Perks, function(idx,value) {
					if(!this.isNull(value)) {
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
				var deleteMe = this.getSmallerPerk(uniqueArray[matchArray[i]],perks[i]);
				delete this.state.unfiltered[deleteMe.Domain_Number].Perks[deleteMe.Perk_Number];
			}
			this.state.unfiltered = this.state.unfiltered.filter(function(p) {
				return (!this.isNull(p));
			});
			this.state.unfiltered.forEach(function(d) {
				d.Perks = d.Perks.filter(function(p) {
					return (!this.isNull(p));
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
		
		clearDisplayValue () {
			if (this.debug) {
				console.log('store.clearDisplayValue called with', newValue)
			}
			this.state.displayValue = newValue
		},
		
		fetchAllDomains () {
			if(this.isNull(this.state.domainFilter)) {
				this.createDefaultFilters();
			}
			var domains = [];
			for(var d of this.state.unfiltered) {
				domains.push(d.Domain);
			}
			return domains;
		},
		
		fetchAllOverDomains () {
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
		
		addToBuild (newValue) {
			if (this.debug) {
				console.log('store.addToBuild called with', newValue)
			}
			var trimed = trimPerk(newValue);
			var ct = newValue.Title+"-"+newValue.Upper_Source;
			if(!this.state.trimPerks.includes(trimed) && !this.state.currentTitles.includes(ct)) {
				this.state.trimPerks.push(trimed);
				this.state.currentTitles.push(ct);
			}
			var updateMe = this.state.unfiltered[newValue.Domain_Number].Perks[newValue.Perk_Number];
			updateMe.Taken = true;
			if(this.isNull(updateMe.Retake_Count)) {
				updateMe["Retake_Count"] = 0;
			}
			updateMe.Retake_Count++;
			this.state.build.push(newValue)
		},
		
		checkPerk(jsonObj,overStr) {
			if(this.isNull(jsonObj.Title)) {
				jsonObj["Title"] = "";
			}
			if(this.isNull(jsonObj.Domain)) {
				jsonObj["Domain"] = "Add";
			}
			if(this.isNull(jsonObj.Restrict)) {
				jsonObj["Restrict"] = false;
			}
			if(this.isNull(jsonObj.Restrict_Title)) {
				jsonObj["Restrict_Title"] = "";
			}
			if(this.isNull(jsonObj.Exclude)) {
				jsonObj["Exclude"] = false;
			}
			if(this.isNull(jsonObj.Exclude_Title)) {
				jsonObj["Exclude_Title"] = "";
			}
			if(this.isNull(jsonObj.ID)) {
				jsonObj["ID"] = jsonObj.Domain_Number+"."+jsonObj.Perk_Number;
			}
			if(this.isNull(jsonObj.Over_Domain)) {
				if(this.isNull(overStr)) {
					if(this.isNull(jsonObj.Domain)) {
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
			if(this.isNull(jsonObj.Description)) {
				jsonObj["Description"] = "";
			}
			if(this.isNull(jsonObj.Retake_Multiplier)) {
				jsonObj["Retake_Multiplier"] = 1;
			}
			if(this.isNull(jsonObj.Retake_Times)) {
				jsonObj["Retake_Times"] = 0;
			}
			if(this.isNull(jsonObj.Dice)) {
				jsonObj["Dice"] = "1d1";
			}
			if(this.isNull(jsonObj.Retake)) {
				jsonObj["Retake"] = false;
			}
			if(this.isNull(jsonObj.Taken)) {
				jsonObj["Taken"] = false;
			}
			if(this.isNull(jsonObj.Lewd)) {
				jsonObj["Lewd"] = false;
			}
			if(this.isNull(jsonObj.Discount_Title)) {
				jsonObj["Discount_Title"] = "";
			}
			if(this.isNull(jsonObj.Discount_Multiplier)) {
				jsonObj["Discount_Multiplier"] = 0.5;
			}
			if(this.isNull(jsonObj.Discount)) {
				jsonObj["Discount"] = false;
			}
			if(this.isNull(jsonObj.Free_Title)) {
				jsonObj["Free_Title"] = "";
			}
			if(this.isNull(jsonObj.Free_Req)) {
				jsonObj["Free"] = false;
			}
			if(this.isNull(jsonObj.Prereq_Title)) {
				jsonObj["Prereq_Title"] = "";
			}
			if(this.isNull(jsonObj.Prereq)) {
				jsonObj["Prereq"] = "";
			}
			if(this.isNull(jsonObj.Cost)) {
				jsonObj["Cost"] = 0;
			}
			if(this.isNull(jsonObj.Retake_Cost)) {
				jsonObj["Retake_Cost"] = 0;
			}
			if(this.isNull(jsonObj.Discount_Cost)) {
				jsonObj["Discount_Cost"] = 0;
			}
			if(this.isNull(jsonObj.Source)) {
				jsonObj["Source"] = "";
			}
			if(this.isNull(jsonObj.Upper_Source)) {
				jsonObj["Upper_Source"] = jsonObj.Source;
			}
			if(!this.isNull(jsonObj.Upper_Sources)) {
				if(jsonObj.Upper_Sources.length == 1) {
					if(jsonObj.Upper_Sources[0]=="") {
						delete jsonObj.Upper_Sources;
					}
				}
			}
			return jsonObj;
		},
		
		trimPerk(res) {
			if(this.store.isNull(res)) return null;
			var desc = stripString(res.Description);
			var meh = {
				"Title":stripString(res.Title),
				"Upper_Source":stripString(res.Upper_Source),
				"Domain":res.Domain,
				"Over_Domain":res.Over_Domain,
			}
			return meh;
		},
		
		fetchBuild () {
			return this.state.build
		},
		
		fetchList () {
			return this.state.unfiltered
		},
		
		fetchFilteredList () {
			if(this.isNull(this.state.domainFilter)) {
				this.createDefaultFilters();
			}
			var filterList = [];
			for(var i=0; i<this.state.domainFilter.length; i++) {
				if(this.state.domainFilter[i]) {
					this.state.unfiltered[i].Perks.forEach(function(p) {
						if(this.state.sourceFilter.includes(p.Source)) {
							if(!p.Taken || !p.Retake) {
								filterList.push(p);
							}
						}
					});
				}
			}
			return filterList;
		},
		
		fetchFilteredBuild () {
			if(this.isNull(this.state.domainFilter)) {
				this.createDefaultFilters();
			}
			var filterList = [];
			this.state.build.forEach(function(p) {
				if(this.state.costFilter.includes(p.Cost) && this.state.sourceFilter.includes(p.Source) && this.state.actDomainFilter.includes(p.Domain)) {
					filterList.push(p);
				}
			});
			return filterList;
		},
		
		setSearchString (newString) {
			this.state.searchString = newString
			console.log("Store ", newString)
		},
		
		setCostFilter (newFilter) {
			this.state.costFilter = newFilter
			console.log("Store costFilter ", newFilter)
		},
		
		setDomainFilter (newFilter) {
			this.state.domainFilter = newFilter
			console.log("Store domainFilter ", newFilter)
		},
		
		fetchRandomPerk() {
			var pl = [];
			if(!this.isNull(this.state.domainFilter)) {
				for (i = 0; i < this.state.domainFilter.length; i++) {
					if (this.state.domainFilter[i]) {
						pl = pl.concat(this.state.unfiltered[i].Perks);
					}
				}
			}
			else {
				for(var d of this.state.unfiltered) {
					pl = pl.concat(this.state.unfiltered[i].Perks);
				}
			}
			if (!this.isNull(this.state.costFilter)) {
				pl = pl.filter(function(p) {
					return this.state.costFilter.includes(p.Cost.toString())
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
			
			var dNum = 0;
			var setFirst = false;
			var lastDomain = "";
			var lastDiv = null;
			this.state.unfiltered.forEach(function(d) {
				this.state.minDomains[d.Domain] = dNum;
				if(!this.state.allDomains.hasOwnProperty(d.Over_Domain)) {
					this.state.allDomains[d.Over_Domain] = [];
					this.state.allDomains[d.Over_Domain].push(d.Domain);
				}
				else {
					this.state.allDomains[d.Over_Domain].push(d.Domain);
				}
				
				d.Perks.forEach(function(p) {
					this.state.sourceFilter.push(p.Source);
					this.state.upperFilter.push(p.Upper_Source);
					if(!this.state.allUppers.hasOwnProperty(d.Upper_Source)) {
						this.state.allUppers[d.Upper_Source] = [];
						this.state.allUppers[d.Upper_Source].push(d.Source);
					}
					else {
						this.state.allUppers[d.Upper_Source].push(d.Source);
					}
				});
				
				this.state.domainNumber[d.Domain] = dNum;
				this.state.domainFilter.push(true);
				this.state.actDomainFilter.push(d.Domain);
				this.state.perksNum[d.Domain] = d.Perks.length;
				var id = d.Domain.replace(reg,"_");
				id = id.split(" ").join("_");
				this.state.checkDomain.push(id);
				dNum++;
			});
			
			this.state.sourceFilter = [...new set(this.state.sourceFilter)];
			this.state.upperFilter = [...new set(this.state.upperFilter)];
			this.state.sourceFilter.sort(function(a, b) {
				if (a.toLowerCase() < b.toLowerCase()) {
					return -1;
				}
				if (a.toLowerCase() > b.toLowerCase()) {
					return 1;
				}
				return 0;
			});
			this.state.upperFilter.sort(function(a, b) {
				if (a.toLowerCase() < b.toLowerCase()) {
					return -1;
				}
				if (a.toLowerCase() > b.toLowerCase()) {
					return 1;
				}
				return 0;
			});
			var keys = Object.keys(this.state.allUppers);
			for(var i=0; i<keys.length; i++) {
				this.state.allUppers[keys[i]] = [...new set(this.state.allUppers[keys[i]])];
				this.state.allUppers.sort(function(a, b) {
					if (a.toLowerCase() < b.toLowerCase()) {
						return -1;
					}
					if (a.toLowerCase() > b.toLowerCase()) {
						return 1;
					}
					return 0;
				});
			}
			
			prcs = [];
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
				this.state.costFilter.push(""+d);
			});
			this.maxValue = prcs[prcs.length - 1];
		},
		
		doRoll(rollCount, isReroll) {
			var canDoRoll = true;
			if(this.isNull(isReroll)) isReroll = false;
			if(this.isNull(rollCount)) rollCount = 0;
			if(this.state.doRerolls) {
				if(rollCount > this.state.rollLimit) {
					canDoRoll = false;
				}
			}
			
			if(!isReroll) {
				this.state.currentCP+=100;
			}
			
			var res = fetchRandomPerk();
			
			//Check if need Reroll
			if(res.Taken && !res.Retake) {
				this.doRoll(rollCount,true);
			}
			if(res.Taken && res.Retake && res.Retake_Times!=0) {
				if(res.Retake_Count >= res.Retake_Times) {
					this.doRoll(rollCount,true);
				}
			}
			
			var resCost = res.Cost;
			if(res.Taken && res.Retake) {
				resCost = resCost * this.getMultiplier(res.Retake_Multiplier,res.Retake_Times);
				if(res.Retake_Cost!=0) {
					resCost = res.Retake_Cost;
				}
			}
			if(!this.isNull(res.Discount_Title)) {
				if(haveDiscount(res)) {
					resCost = roundCost(resCost * res.Discount_Multiplier);
					if(res.Discount_Cost!=0) {
						resCost = res.Discount_Cost;
					}
				}
			}
			
			gained = false;
			var prereqList = this.findTitles(res,"Prereq_Title");
			
			if(this.state.currentCP >= resCost && this.haveTitle(res,"Prereq_Title") && canDoRoll && this.haveTitle(res,"Restrict_Title") && !this.haveTitle(res,"Exclude_Title")) {
				temp = trimPerk(res);
				var ct = res.Title+"-"+res.Upper_Source;
				if(!trimPerks.includes(temp) && !currentTitles.includes(ct)) {
					this.state.currentCP -= resCost;
					trimPerks.push(temp);
					if(!res.Taken) {
						this.state.build.push(res);
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
			else if(!this.isNull(prereqList) && canDoRoll) {
				var i = 0;
				while(i<prereqList.length && !gained) {
					prereqPerk = prereqList[i];
					resCost = prereqPerk.Cost;
					if(!prereqPerk.Taken) {
						if(!this.haveTitle(prereqPerk,"Prereq_Title")) {
							this.attemptPrereq(prereqPerk);
						}
						if(!this.isNull(prereqPerk.Discount_Title)) {
							if(this.haveTitle(prereqPerk,"Discount_Title")) {
								resCost = roundCost(resCost * prereqPerk.Discount_Multiplier);
							}
						}
						if(this.state.currentCP >= resCost && this.haveTitle(prereqPerk,"Prereq_Title")) {
							temp = trimPerk(prereqPerk);
							var ct = prereqPerk.Title+"-"+prereqPerk.Upper_Source;
							if(!this.state.trimPerks.includes(temp) && !currentTitles.includes(ct) && !prereqPerk.Taken) {
								this.state.currentCP -= resCost;
								this.state.trimPerks.push(temp);
								this.state.build.push(prereqPerk);
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
							res = prereqPerk;
						}
					}
					i++;
				}
			}
			else if(doRerolls && canDoRoll) {
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
			doRoll();
			fetchFreebies(this.state.currentPerk);
			return {"Add":this.state.canGet,"Perk":this.state.currentPerk,"Free":this.state.currentFreebies};
		},
		
		attemptPrereq(res) {
			var prereqPerk = this.findPerk(res);
			if(!this.isNull(prereqPerk)) {
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
						
						if(!this.haveTitle(prereqPerk,"Prereq_Title") && this.haveTitle(res,"Restrict_Title") && !this.haveTitle(res,"Restrict_Title")) {
							addCurrent = this.attemptPrereq(prereqPerk);
						}
						else if(this.state.currentCP >= resCost && addCurrent && !this.haveTitle(res,"Restrict_Title")) {
							temp = this.trimPerk(prereqPerk);
							var ct = prereqPerk.Title+"-"+prereqPerk.Upper_Source;
							if(!this.state.trimPerks.includes(temp) && !this.state.currentTitles.includes(ct) && !prereqPerk.Taken) {
								this.state.currentCP -= resCost;
								this.state.trimPerks.push(temp);
								this.state.build.push(prereqPerk);
								this.state.currentTitles.push(prereqPerk.Title+"-"+prereqPerk.Upper_Source);
								prereqPerk.Taken = true;
								prereqPerk.Retake_Count++;
								gained = true;
								this.state.allMisses.push(missedPerk);
								this.state.missedPerk = 0;
								if(untilPerk && isRunning) {
									canRun = false;
									isRunning = false;
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
			if(this.isNull(recheck)) recheck == false;
			if(this.isNull(this.state.unfiltered[obj.Domain_Number]) || recheck) {
				if(this.isNull(minDomains[obj.Domain]) || recheck) {
					if(this.isNull(obj.Over_Domain)) {
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
			else if(this.isNull(this.state.unfiltered[obj.Domain_Number].Perks[obj.Perk_Number])) {
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
			this.state.currentFreebies = [];
			this.state.unfiltered.forEach(function(d) {
				d.Perks.forEach(function(e) {
					var ct = e.Title+"-"+e.Upper_Source;
					if(e.Source == perk.Source || (e.Upper_Source == perk.Upper_Source && this.state.doUpper)) {
						if(e.Cost == 0 && this.haveTitle(e,"Prereq_Title") && this.haveTitle(e,"Restrict_Title") && !this.haveTitle(e,"Exclude_Title")) {
							var temp = this.compairMany(this.state.trimPerks,e);
							var tmp = this.trimPerk(e);
							if(!temp && !this.state.trimPerks.includes(tmp) && !this.state.currentTitles.includes(ct)) {
								if(perk != e) {
									this.state.currentFreebies.push(e);
								}
							}
							else {
								temp = this.compairMany(this.state.trimPerks,e,true);
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
								if(add && !this.state.trimPerks.includes(tmp) && !this.state.currentTitles.includes(ct)) {
									if(perk != e) {
										this.state.currentFreebies.push(e);
									}
								}
							}
						}
						else if(e.Free_Title != "" && this.haveTitle(e,"Free_Title") && this.haveTitle(e,"Prereq_Title") && this.haveTitle(e,"Restrict_Title") && !this.haveTitle(e,"Exclude_Title")) {
							var temp = this.compairMany(trimPerk,e);
							var tmp = trimPerk(e);
							if(!temp && !trimPerk.includes(tmp) && !this.state.currentTitles.includes(ct)) {
								if(perk != e) {
									this.state.currentFreebies.push(e);
								}
							}
							else {
								temp = this.compairMany(this.state.trimPerks,e,true);
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
								if(add && !trimPerk.includes(tmp) && !this.state.currentTitles.includes(ct)) {
									if(perk != e) {
										this.state.currentFreebies.push(e);
									}
								}
							}
						}
					}
					else if(!this.isNull(perk.Upper_Sources) && this.state.doUpper) {
						perk.Upper_Sources.forEach(function(z) {
							if(z == e.Upper_Source || z == e.Source) {
								if(e.Cost == 0  && this.haveTitle(e,"Prereq_Title") && this.haveTitle(e,"Restrict_Title") && !this.haveTitle(e,"Exclude_Title")) {
									var temp = this.compairMany(this.state.trimPerks,e);
									var tmp = trimPerk(e);
									if(!temp && !this.state.currentTitles.includes(ct)) {
										this.state.currentFreebies.push(e);
									}
									else {
										temp = this.compairMany(this.state.trimPerks,e,true);
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
										if(add && !this.state.currentTitles.includes(ct)) {
											this.state.currentFreebies.push(e);
										}
									}
								}
								else if(!this.isNull(e.Free_Title) && this.haveTitle(e,"Free_Title") && this.haveTitle(e,"Prereq_Title") && this.haveTitle(e,"Restrict_Title") && !this.haveTitle(e,"Exclude_Title")) {
									var temp = this.compairMany(this.state.currentFreebies,e,true);
									if(temp.length == 0 && !this.state.currentTitles.includes(ct)) {
										this.state.currentFreebies.push(e);
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
										if(add && !this.state.currentTitles.includes(ct)) {
											this.state.currentFreebies.push(e);
										}
									}
								}
							}
						});
					}
				});
			});
			return this.state.currentFreebies;
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
		
		haveTitle(obj,title) {
			var base = title.split("_")[0];
			if(obj[base]) {
				if(!obj[title].includes("&&") && !obj[title].includes("||")) {
					var tmpTitle = obj[title]+"-"+obj.Upper_Source;
					if(this.state.currentTitles.includes(tmpTitle)) {
						return true;
					}
					else {
						return false;
					}
				}
				else {
					var paras = obj[title].match(para);
					if(!this.isNull(paras)) {
						var origPara = obj[title];
						for(var i=0; i<paras.length; i++) {
							var tmp = paras[i];
							paras[i] = paras[i].trim();
							paras[i] = paras[i].replace("(","");
							paras[i] = paras[i].replace(")","");
							origPara.replace(tmp,""+this.evalTitles(obj,paras[i],title));
						}
						
						return this.evalTrues(obj,origPara);
					}
					else {
						return this.evalTitles(obj,obj[title],title);
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
		},
		
		evalTitles(obj,matchStr,titleType) {
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
						var tmp = this.matchAnds(preTitlesAnd);
						if(tmp) return true;
					}
					else {
						var tmp = this.matchOrs([preTitles[i]+"-"+obj.Upper_Source]);
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
				return this.matchAnds(preTitles);
			}
			else if(matchStr.includes("||")) {
				var preTitles = matchStr.split("||");
				for(var i=0; i<preTitles.length; i++) {
					preTitles[i] = preTitles[i].trim();
					preTitles[i] = preTitles[i]+"-"+obj.Upper_Source;
				}
				return this.matchOrs(preTitles);
			}
			else {
				return this.state.currentTitles.includes(matchStr+"-"+obj.Upper_Source);
			}
		},
		
		checkPerks() {
			this.state.unfiltered.forEach(function(d) {
				d.Perks.forEach(function(p,idx,theArr) {
					theArr[idx] = this.checkPerk(p,d.Over_Domain);
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
						"Retake_Times":perk.Retake_Times,
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
		
		evalTrues(obj,evalStr) {
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
						var tmp = this.matchAnds(preTitlesAnd);
						if(tmp) return true;
					}
					else {
						if(preTitles[i]!="true" && preTitles[i]!="false") {
							var tmp = this.matchOrs([preTitles[i]+"-"+obj.Upper_Source]);
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
				return this.matchAnds(preTitles);
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
				return this.matchOrs(preTitles);
			}
		},
		
		matchOrs(arr) {
			for(var i=0; i<arr.length; i++) {
				if(arr[i]!="true" && arr[i]!="false") {
					if(this.state.currentTitles.includes(arr[i])) {
						return true;
					}
				}
				else if(arr[i]=="true") {
					return true;
				}
			}
			return false;
		},
		
		matchAnds(arr) {
			for(var i=0; i<arr.length; i++) {
				if(arr[i]!="true" && arr[i]!="false") {
					if(!this.state.currentTitles.includes(arr[i])) {
						return false;
					}
					else if(arr[i]=="false") {
						return false;
					}
				}
			}
			return true;
		},
		
		compairMany(a1,o1,isList) {
			if(this.isNull(isList)) {
				isList = false;
			}
			if(this.isNull(a1)) a1 = [];
			var tmpArr = [];
			for(var i=0; i<a1.length; i++) {
				tmpArr.push(trimPerk(a1[i]));
			}
			var tmpTrim = trimPerk(o1);
			var returnMe = [];
			var has = false;
			for(var i=0; i<a1.length; i++) {
				var tmpData = this.compairTwo(a1[i],tmpTrim);
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
		},
		
		compairTwo(o1,o2) {
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
		},
		
		isNull(meh) {
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
	}
	
	export default {
		name: 'StateStore',
		state: store.state,
		addDomain: store.addDomain,
		addPerk: store.addToBuild,
		addPerkList: store.addToPerkList,
		clearDisplay: store.clearDisplayValue,
		fetchAllDomains: store.fetchAllDomains,
		fetchAllOverDomains: store.fetchAllOverDomains,
		fetchBuild: store.fetchBuild,
		fetchFilteredList: store.fetchFilteredList,
		fetchFilteredBuild: store.fetchFilteredBuild,
		fetchList: store.fetchList,
		getRoll: store.getRoll,
		removeDupes: store.removeDupes,
		resetPerkList: store.resetPerkList,
		resetFilters: store.createDefaultFilters,
		setDisplay: store.setDisplayValue,
		setCostFilter: store.setCostFilter,
		setDomainFilter: store.setDomainFilter,
		setSearchString: store.setSearchString,
		sortPerks: store.sortPerks,
	}
</script>
