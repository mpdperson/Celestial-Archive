<template>
	<div></div>
</template>
<script>
	import { reactive } from 'vue';
	
	const dictionary = require('../../../public/dictionary/english_word_list.js');
	const valid_word_list = capWordList(dictionary.split("|"));
	const sortedList = sortWordList(dictionary.split("|"));
	const lower_thresh = 0.7;
	const isSplit = true;
	const singleLetters = ["a","A","I"];
	const common3 = ["and","for","not","the","too","have","that","with","you"];
	const isSpecial = new RegExp(/^([^a-zA-Z\-'’ ])+$/);
	const isSpecialChar = [
		"\"",".","!","?","(",")","[","]","{","}","<",">",",","/","\\","~","`","“","”","_",":",";","+",
		"●","="
	];
	const common = [
		"a","an","be","in","it","of","on","to","and","for","not","the","too","have","that","with","you"
	];
	
	const parse = {
		debug: true,
		state: reactive({
			strLen: 0,
		}),
		
		find_similar(word, score_thresh) {
			var max_size = 10;
			var top_words = [];
			var top_scores = [];
			
			for(var i = 0; i < valid_word_list.length; i++){
				//compute score
				var element = valid_word_list[i];
				var temp_score = score(word, element);
				
				if(score_thresh < temp_score) {
					//check if it is a top score
					var index = this.getListIndex(top_scores, temp_score);
					if(index < max_size) {
						top_words.splice(index, 0, element);
						top_scores.splice(index, 0, temp_score);
						
						if(top_words.length > max_size){
							top_words.pop();
							top_scores.pop();
						}
					}
				}
			}
			
			return [top_words, top_scores];
		},
		
		getListIndex(scores, x) {
			for(var i = 0; i < scores.length; i++){
				if(x > scores[i]) return i;
			}
			return scores.length;
		},
		
		wordTyped(str, thresh) {
			if(this.inDict(str)) return str;
			if(isNull(thresh)) thresh = lower_thresh;
			var meh = this.find_similar(str, thresh);
			var result = [];
			if(meh[1][0]==1) {
				return meh[0][0];
			}
			for(var i=0; i<meh[0].length; i++) {
				var tmp = {"word":meh[0][i],"percent":meh[1][i]};
				result.push(tmp);
			}
			return result;
		},
		
		inDict(str) {
			str = str.replace(/[^a-zA-Z\-'’ ]/g, '');
			var upper = str.toUpperCase();
			if(str.length==0) return true;
			if(str.length==1) {
				var r = singleLetters.includes(str);
				return r;
			}
			if(str.includes("’")) {
				str = str.replaceAll("’","'");
			}
			var result = (valid_word_list.includes(str));
			if(result) return result;
			var result2 = (valid_word_list.includes(str.toLowerCase()));
			if(!result2) {
				if(str==upper) return true;
			}
			return result2;
		},
		
		spellCheck(text) {
			console.log("spellCheck");
			var words = text.split(" ");
			
			for(var i=0; i<words.length; i++) {
				var word = words[i];
				var nWord = words[i];
				var sChars = "";
				var eChars = "";
				
				nWord = nWord.replace(/[^a-zA-Z\-'’ ]/g, '');
				
				var wArr = word.replace(nWord, ' ');
				if(wArr!=" ") {
					var meh = wArr.split(" ");
					sChars = meh[0];
					eChars = meh[1];
					if(isNull(sChars)) sChars = "";
					if(isNull(eChars)) eChars = "";
				}
				if(nWord.endsWith("’")) {
					nWord = nWord.substring(0, nWord.length - 1);
					eChars = "’"+eChars;
				}
				if(nWord.endsWith("'")) {
					nWord = nWord.substring(0, nWord.length - 1);
					eChars = "'"+eChars;
				}
				
				var isIn = this.inDict(nWord);
				if(!isIn) {
					var replace = "";
					//replace = replaceWord(nWord);
					replace = spellChecker(nWord);
					if(!isNull(replace)) {
						var re = sChars + replace + eChars;
						words[i] = re;
						var leftOver = nWord.replace(re,"");
						if(!isNull(words[i+1]) && leftOver.length>0) {
							words[i+1] = leftOver + words[i+1];
						}
					}
					else {
						words = replaceArr(words,i);
					}
				}
			}
			
			outText = words.join(" ");
			outText = outText.replace(/([ ]+)/gm," ");
			outText = outText.trim();
			
			console.log("Finished");
			return outText;
		},
		
		replaceWord(str) {
			var replace = this.wordTyped(str);
			if(typeof replace=="string" && replace.length>1) {
				return replace;
			}
			return "";
		},
		
		score(x, y) {
			var length_weight = 0.3;
			var match_weight = 0.5;
			var shift_weight = 0.2;
			
			return length_weight * this.length_score(x,y) + match_weight * this.match_score(x,y) + shift_weight * this.shift_score(x,y);
		},
		
		length_score(x, y) {
			var diff = Math.abs(x.length - y.length);
			return Math.max(1.0 - diff / 4, 0);
		},
		
		shift_score(x, y) {
			var l2 = this.match_score(x.substring(2), y);
			var l1 = this.match_score(x.substring(1), y);
			var c1 = this.match_score(x, y);
			var r1 = this.match_score(x, y.substring(1));
			var r2 = this.match_score(x, y.substring(2));
			
			return Math.max(l2, l1, c1, r1, r2);
		},
		
		match_score(x, y) {
			var length = Math.min(x.length, y.length);
			if(length <= 0) return 0.0; 
			
			var total = 0;
			for(var i = 0; i < length; i++) {
				if(x.charAt(i) == y.charAt(i)) total++;
			}
			
			var diff = length - total;
			return Math.max(1.0 - diff / 5, 0);
		},
		
		joinWords(text) {
			console.log("joinWords");
			text = this.cleanSpaces(text);
			text = this.textClean(text);
			
			//str = str.replace(/\&#13;/gm,"\r");
			//str = str.replace(/\&#10;/gm,"\n");
			
			var lines = text.split(/\&#13;\&#10;|\&#10;|\&#13;/);
			for(var i=0; i<lines.length; i++) {
				var spaced = this.isSpaced(lines[i]);
				if(spaced) {
					lines[i] = lines[i].replace(/([ ]+)/g,'');
					lines[i] = this.cleanSplit(lines[i]);
					lines[i] = this.splitLines(lines[i]);
					lines[i] = lines[i].replace(/([A-Z])/gm," $1");
					lines[i] = this.textClean(lines[i]);
				}
				else {
					var sentances = lines[i].match(/[^\.\!\?\:]+|[\.\!\?\:]/g);
					//var sentances = lines[i].match(/(\w+|\s+)|[^\w]+/g);
					var changed = false;
					for(var j=0; j<sentances.length; j++) {
						var spaced = this.isSpaced(sentances[j]);
						if(spaced && sentances[j]!=" ") {
							sentances[j] = sentances[j].replace(/([ ]+)/g,'');
							sentances[j] = this.cleanSplit(sentances[j]);
							sentances[j] = this.splitLines(sentances[j]);
							sentances[j] = sentances[j].replace(/([A-Z])/gm," $1");
							sentances[j] = this.textClean(sentances[j]);
							changed = true;
						}
					}
					lines[i] = sentances.join("");
				}
			}
			
			outText = lines.join("\r\n");
			outText = outText.replace(/([ ]+)/gm," ");
			outText = outText.trim();
			outText = textClean(outText);
			
			console.log("Finished");
			return outText;
		},
		
		splitLines(str) {
			var words = str.split(" ");
			for(var i=0; i<words.length; i++) {
				words[i] = splitLine(words[i]);
			}
			return words.join(" ");
		},
		
		splitLine(str) {
			str = str.replace(/\s/gm," ");
			str = this.textClean(str);
			str = str.replace(/([A-Z])/gm," $1");
			str = str.replace(/\r/gm,"&#13;");
			str = str.replace(/\n/gm,"&#10;");
			str = str.replace(/\s/gm," ");
			str = str.replace(/&#13;/gm,"\r");
			str = str.replace(/&#10;/gm,"\n");
			
			var words = str.split(" ");
			for(var i=0; i<words.length; i++) {
				var word = words[i];
				var nWord = words[i];
				var sChars = "";
				var eChars = "";
				
				nWord = nWord.replace(/[^a-zA-Z\-'’ ]/g, '');
				
				var wArr = word.replace(nWord, ' ');
				if(wArr!=" ") {
					var meh = wArr.split(" ");
					sChars = meh[0];
					eChars = meh[1];
					if(isNull(sChars)) sChars = "";
					if(isNull(eChars)) eChars = "";
				}
				if(nWord.endsWith("’")) {
					nWord = nWord.substring(0, nWord.length - 1);
					eChars = "’" + eChars;
				}
				
				var isIn = this.inDict(nWord);
				if(!isIn) {
					var el = sortedList.find(a => nWord.includes(a));
					if(el) {
						words[i] = sChars + splitMe(nWord) + eChars;
					}
				}
			}
			str = words.join(" ");
			return str;
		},
		
		isSpaced(str) {
			var spaces = str.replace(/([^ ])/gm,"");
			var chars = str.replace(/([ ])/gm,"");
			if(spaces.length>=chars.length) {
				return true;
			}
			else {
				var result = spaces.length / chars.length;
				if(result>.6) {
					return true;
				}
				else {
					return false;
				}
			}
		},
		
		cleanSpaces(str) {
			str = str.replace(/([^\r\n])\r([^\r\n])/gm,"$1\r\n$2");
			str = str.replace(/([^\r\n])\n([^\r\n])/gm,"$1\r\n$2");
			str = str.replace(/\r/gm,"&#13;");
			str = str.replace(/\n/gm,"&#10;");
			str = str.replace(/\s/gm," ");
			return str;
		},
		
		textClean(text) {
			text = text.replace(/: ([\r\n]+)([^\-\+●\r\n]+)/g,":\r\n$2");
			text = text.replace(/\r\n\r\n(\r\n)+/gm,"\r\n\r\n");
			text = text.replace(/\s○\s?([A-Z])/gm,"\r\n●$1");
			text = text.replace(/\s●\s?([A-Z])/gm,"\r\n●$1");
			text = text.replace(/([^\.\!\?\r\n]+)\r\n([^\.\!\?\r\n]+)([\.\!\?]+)/gm,"$1 $2$3");
			text = text.replace(/”\r\n([^\r\n])/gm,"” $1");
			text = text.replace(/([^\r\n])\r\n“/gm,"$1 “");
			text = text.replace(/([A-Za-z0-9])'([A-Z])/gm,"$1 '$2");
			text = text.replace(/([A-Za-z0-9])‘([A-Z])/gm,"$1 ‘$2");
			text = text.replace(/\/\r\n([A-Za-z0-9])/gm,"/$1");
			text = text.replace(/\(\r\n([A-Za-z0-9])/gm,"($1");
			text = text.replace(/,([\r\n]+)([^\r\n])/gm,", $2");
			text = text.replace(/\)\r\n\:/gm,"):");
			text = text.replace(/([A-Z])\r\n([a-z])/gm,"$1 $2");
			text = text.replace(/([a-z])\r\n([a-z])/gm,"$1 $2");
			text = text.replace(/([a-z])\r\n([A-Z])/gm,"$1 $2");
			text = text.replace(/([a-z])(\r\n)+([A-Za-z0-9])/gm,"$1 $3");
			text = text.replace(/([a-z])\r\n\./gm,"$1.");
			text = text.replace(/([a-z])\r\n\,/gm,"$1,");
			text = text.replace(/([a-z])\r\n\?/gm,"$1?");
			text = text.replace(/([a-z])\r\n\!/gm,"$1!");
			text = text.replace(/\-(\r\n)+([A-Z0-9])/gm,"- $2");
			text = text.replace(/([a-z])\r\n\-\r\n([a-z])/gm,"$1-$2");
			text = text.replace(/([a-z])\r\n\-\r\n([A-Z])/gm,"$1-$2");
			text = text.replace(/([0-9])([\r\n]+)([0-9])/gm,"$1$3");
			text = text.replace(/\.\r\n([A-Za-z0-9])/gm,". $1");
			text = text.replace(/([0-9]+)\-/gm,"$1 -");
			text = text.replace(/:([\r\n]+)(\+|\-|●)/gm,":\r\n$2");
			text = text.replace(/([A-Za-z0-9])\r\n\(/gm,"$1 (");
			text = text.replace(/’s([A-Za-z0-9])/gm,"’s $1");
			text = text.replace(/'s([A-Za-z0-9])/gm,"'s $1");
			text = text.replace(/\t/gm," ");
			text = text.replace(/%([^% ])/gm,"% $1");
			text = text.replace(/([ ]+)/gm," ");
			text = text.replace(/ l and /g," land ");
			text = text.replace(/ w and /g," wand ");
			text = text.replace(/ h and /g," hand ");
			text = text.replace(/ r and /g," rand ");
			text = text.replace(/ b and /g," band ");
			text = text.replace(/\t/gm,"    ");
			text = text.replace(/([ ]+)/gm," ");
			text = text.replace(/([ ]+)\./gm,".");
			text = text.replace(/([ ]+)\,/gm,",");
			text = text.replace(/([ ]+)\?/gm,"?");
			text = text.replace(/([ ]+)\!/gm,"!");
			text = text.replace(/\-([ ]+)/gm,"-");
			text = text.replace(/([a-z]+)([ ]+)\-/gm,"$1-");
			text = text.replace(/([ ]+)'([a-z])/gm,"'$2");
			text = text.replace(/([ ]+)’([a-z])/gm,"’$2");
			text = text.replace(/\(([ ]+)/gm,"(");
			text = text.replace(/([ ]+)\)/gm,")");
			text = text.replace(/([0-9]+)([ ]+)([0-9]+)([A-Z])P/gm,"$1$3$4P");
			text = text.replace(/\/([ ]+)/gm,"/");
			text = text.replace(/P \+\)/gm,"P+)");
			text = text.replace(/([ ]+)\/([ ]+)/gm,"/");
			text = text.replace(/([ ]+)\//gm,"/");
			text = text.replace(/([ ]+)”/gm,"”");
			text = text.replace(/“([ ]+)/gm,"“");
			text = text.replace(/([ ]+)’/gm,"’");
			text = text.replace(/‘([ ]+)/gm,"‘");
			text = text.replace(/([a-z]+)([ ]+)\-([a-z]+)/gm,"$1-$3");
			text = text.replace(/\s\-([A-Z])/gm,"\r\n-$1");
			text = text.replace(/\s\+([A-Z])/gm,"\r\n+$1");
			text = text.replace(/\s\-"([A-Z])/gm,"\r\n-\"$1");
			text = text.replace(/\s\+"([A-Z])/gm,"\r\n+\"$1");
			text = text.replace(/\s\-‘([A-Z])/gm,"\r\n-‘$1");
			text = text.replace(/\s\+‘([A-Z])/gm,"\r\n+‘$1");
			text = text.replace(/\s\-“([A-Z])/gm,"\r\n-“$1");
			text = text.replace(/\s\+“([A-Z])/gm,"\r\n+“$1");
			text = text.replace(/\s\-\[([A-Z])/gm,"\r\n-[$1");
			text = text.replace(/\s\+\[([A-Z])/gm,"\r\n+[$1");
			text = text.replace(/\s\-\(([A-Z])/gm,"\r\n-($1");
			text = text.replace(/\s\+\(([A-Z])/gm,"\r\n+($1");
			text = text.replace(/\s\-\<([A-Z])/gm,"\r\n-<$1");
			text = text.replace(/\s\+\<([A-Z])/gm,"\r\n+<$1");
			text = text.replace(/\s\-\{([A-Z])/gm,"\r\n-{$1");
			text = text.replace(/([ ]+)s /gm,"s ");
			text = text.replace(/([ ]+):/gm,":");
			text = text.replace(/\(Free\)/gm,"(0CP)");
			text = text.replace(/\):/gm,"):\r\n");
			text = text.replace(/\):\r\n\r\n/gm,"):\r\n");
			text = text.replace(/\r\n([ ]+)/gm,"\r\n");
			text = text.replace(/\,([^\.\!\?\:\;\"\'“”‘’,]+)/g,", $1");
			text = text.replace(/\.([^\.\!\?\:\;\"\'“”‘’,]+)/g,". $1");
			text = text.replace(/\!([^\.\!\?\:\;\"\'“”‘’,]+)/g,"! $1");
			text = text.replace(/\?([^\.\!\?\:\;\"\'“”‘’,]+)/g,"? $1");
			text = text.replace(/\:([^\.\!\?\:\;\"\'“”‘’,]+)/g,": $1");
			text = text.replace(/\;([^\.\!\?\:\;\"\'“”‘’,]+)/g,"; $1");
			text = text.replace(/\"([^\.\!\?\:\;\"\'“”‘’,]+)/g,"\" $1");
			text = text.replace(/\"([^\.\!\?\:\;\"\'“”‘’,]+)/g,"\" $1");
			text = text.replace(/\"([^\.\!\?\:\;\"\'“”‘’,]+)/g,"\" $1");
			text = text.replace(/\”([^\.\!\?\:\;\"\'“”‘’,]+)/g,"” $1");
			text = text.replace(/\)([^\.\!\?\:\;\"\'“”‘’,]+)/g,") $1");
			text = text.replace(/\]([^\.\!\?\:\;\"\'“”‘’,]+)/g,"] $1");
			text = text.replace(/\}([^\.\!\?\:\;\"\'“”‘’,]+)/g,"} $1");
			text = text.replace(/\>([^\.\!\?\:\;\"\'“”‘’,]+)/g,"> $1");
			text = text.replace(/([^\.\!\?\:\;\"\'“”‘’,]+)\‘/g,"$1 ‘");
			text = text.replace(/([^\.\!\?\:\;\"\'“”‘’,]+)\“/g,"$1 “");
			text = text.replace(/([^\.\!\?\:\;\"\'“”‘’,]+)\(/g,"$1 (");
			text = text.replace(/([^\.\!\?\:\;\"\'“”‘’,]+)\</g,"$1 <");
			text = text.replace(/([^\.\!\?\:\;\"\'“”‘’,]+)\{/g,"$1 {");
			text = text.replace(/([^\.\!\?\:\;\"\'“”‘’,]+)\[/g,"$1 [");
			text = text.replace(/([ ]+)/gm," ");
			text = text.replace(/\r\n\r\n(\r\n)+/gm,"\r\n\r\n");
			text = text.replace(/\r\n([ ]+)/gm,"\r\n");
			text = text.replace(/([a-z])([A-Z0-9])/gm,"$1 $2");
			text = text.replace(/([0-9]+)([ ]?)d([ ]?)([0-9]+)/gm,"$1d$4");
			text = text.replace(/([0-9]+)d([0-9]+)([ ]?)([\-\+])([ ]?)([0-9]+)/gm,"$1d$2$4$6");
			text = text.replace(/\.\.\.([\.]+)/gm,"...");
			text = text.replace(/\r\n([ ]+)/gm,"\r\n");
			text = text.trim();
			text = this.checkLines(text);
			return text;
		},
		
		splitMe(str, m2, count) {
			if(this.checkSentance(str)) return str;
			var matches = [];
			var mLen = 0;
			if(isNull(count)) {
				strLen = str.length;
				count = -1;
			}
			if(!isNull(m2)) {
				matches = m2;
				mLen = m2.join(" ").length;
			}
			else {
				matches = str.match(sortReg);
				//matches = sortReg.exec(str);
				matches = [...new Set(matches)];
				matches.sort(function(a, b) {
					//*//
					if(a.toLowerCase().startsWith("s") && !b.toLowerCase().startsWith("s")) return -1;
					else if(!a.toLowerCase().startsWith("s") && b.toLowerCase().startsWith("s")) return 1;
					else if(a.length < b.length) return 1;
					//*/
					//if(a.length < b.length) return 1;
					else if(a.length > b.length) return -1;
					else if(a.toLowerCase() < b.toLowerCase()) return 1;
					else if(a.toLowerCase() > b.toLowerCase()) return -1;
					else if(a < b) return 1;
					else if(a > b) return -1;
					else return 0;
				});
				matches = matches.filter(function(a) {
					return (a.length>1);
				});
				
				mLen = matches.join(" ").length;
				var sCommons = [];
				for(var i=0; i<matches.length; i++) {
					if(common.includes(matches[i])) {
						sCommons.push(matches[i]);
					}
				}
				if(!isNull(sCommons)) {
					for(var i=0; i<sCommons.length; i++) {
						str = str.replace(sCommons[i]," "+sCommons[i]+" ");
					}
				}
			}
			if(isNull(matches)) return this.textClean(str);
			count++;
			if(count>matches.length) return this.textClean(str);
			var splitArr = this.findLargestMatches(str,matches);
			//*//
			if(!isNull(splitArr)) {
				//&& strLen!=(matches.join).length
				var sLimit = (avgWord(matches));
				var abs = (mLen - strLen);
				
				if(abs>sLimit || (splitArr[0].length>sLimit && abs>0)) {
					if(str.includes(splitArr[0])) {
						if(splitArr[0].length>matches[count].length) {
							str = str.replace(splitArr[0]," "+splitArr[0]+" ");
							str = str.replace(matches[count]," "+matches[count]+" ");
						}
						else {
							str = str.replace(matches[count]," "+matches[count]+" ");
							if(str.includes(splitArr[0])) {
								str = str.replace(splitArr[0]," "+splitArr[0]+" ");
							}
						}
						return this.splitMe(str);
					}
				}
			}
			//*/
			str = str.replace(matches[count]," "+matches[count]+" ");
			return this.splitMe(str, matches, count);
		},
		
		checkSentance(str) {
			var words = str.split(" ");
			var allGood = true;
			for(var i=0; i<words.length; i++) {
				if(!this.inDict(words[i])) allGood = false;
			}
			return allGood;
		},
		
		findLargestMatches(str, arr, limit) {
			if(isNull(arr)) arr = [];
			if(isNull(limit)) {
				if(isNull(arr)) {
					limit = charLimit;
				}
				else {
					limit = avgWord(arr);
				}
			}
			var results = [];
			var line = "";
			for(var i=0; i<smallerSort.length; i++) {
				if(!arr.includes(smallerSort[i])) {
					if(str.includes(smallerSort[i]) && smallerSort[i].length>limit) {
						if(!line.includes(smallerSort[i])) {
							line = line + " " + smallerSort[i];
							results.push(smallerSort[i]);
						}
					}
				}
			}
			//var nResults = [];
			var nResults = JSON.parse(JSON.stringify(results));
			nResults = isSubArr(nResults,arr);
			return nResults;
		},
		
		similarity(a, b) {
			a = this.stripString(a);
			b = this.stripString(b);
			var ld = this.ldPercent(a,b);
			var cs = this.textCosineSimilarity(a, b);
			var jw = this.JaroWrinker(a, b);
			var as = this.arraySimilar(a, b);
			return {"ld":ld, "cs":cs, "jw":jw, "as":as};
		},
		
		avgSim(a, b) {
			var result = this.similarity(a, b);
			//console.log("result",result);
			var total = result["ld"] + result["jw"];
			return (total/2);
		},
		
		isSim(a, b, limit) {
			if(a.includes(b)) return true;
			if(b.includes(a)) return true;
			if(isNull(limit)) limit = .8;
			var result = this.avgSim(a, b);
			var res = (result>=limit);
			return res;
		},
		
		ldPercent(a, b) {
			var difference = this.LevenshteinDistance(a, b);
			var max = (a.length > b.length) ? a.length : b.length;
			var ld = ((max - difference) / max);
			return ld;
		},
		
		LevenshteinDistance(a, b){
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
							matrix[i-1][j-1] + 1, //substitution
							Math.min(matrix[i][j-1] + 1, //insertion
							matrix[i-1][j] + 1) //deletion
						);
					}
				}
			}
			return matrix[b.length][a.length];
		},
		
		textCosineSimilarity(strA, strB) {
			var termFreqA = this.termFreqMap(strA);
			var termFreqB = this.termFreqMap(strB);
			var dict = {};
			
			this.addKeysToDict(termFreqA, dict);
			this.addKeysToDict(termFreqB, dict);
			
			var termFreqVecA = this.termFreqMapToVector(termFreqA, dict);
			var termFreqVecB = this.termFreqMapToVector(termFreqB, dict);
			return this.cosineSimilarity(termFreqVecA, termFreqVecB);
		},
		
		addKeysToDict(map, dict) {
			for(var key in map) {
				dict[key] = true;
			}
		},
		
		termFreqMap(str) {
			var words = str.split(' ');
			var termFreq = {};
			words.forEach(function(w) {
				termFreq[w] = (termFreq[w] || 0) + 1;
			});
			return termFreq;
		},
		
		termFreqMapToVector(map, dict) {
			var termFreqVector = [];
			for(var term in dict) {
				termFreqVector.push(map[term] || 0);
			}
			return termFreqVector;
		},
		
		cosineSimilarity(vecA, vecB) {
			return this.vecDotProduct(vecA, vecB) / (this.vecMagnitude(vecA) * this.vecMagnitude(vecB));
		},
		
		vecDotProduct(vecA, vecB) {
			var product = 0;
			for(var i = 0; i < vecA.length; i++) {
				product += vecA[i] * vecB[i];
			}
			return product;
		},
		
		vecMagnitude(vec) {
			var sum = 0;
			for(var i = 0; i < vec.length; i++) {
				sum += vec[i] * vec[i];
			}
			return Math.sqrt(sum);
		},
		
		JaroWrinker(s1, s2) {
			var m = 0;
			// Exit early if either are empty.
			if(s1.length === 0 || s2.length === 0) {
				return 0;
			}
			// Exit early if they're an exact match.
			if(s1 === s2) {
				return 1;
			}
			var range = (Math.floor(Math.max(s1.length, s2.length) / 2)) - 1;
			var s1Matches = new Array(s1.length);
			var s2Matches = new Array(s2.length);
			for(i = 0; i < s1.length; i++) {
				var low	= (i >= range) ? i - range : 0;
				var high = (i + range <= s2.length) ? (i + range) : (s2.length - 1);
				for(j = low; j <= high; j++) {
					if(s1Matches[i] !== true && s2Matches[j] !== true && s1[i] === s2[j]) {
						++m;
						s1Matches[i] = s2Matches[j] = true;
						break;
					}
				}
			}
			// Exit early if no matches were found.
			if(m === 0) {
				return 0;
			}
			// Count the transpositions.
			var k = n_trans = 0;
			for(i = 0; i < s1.length; i++) {
				if(s1Matches[i] === true) {
					for(j = k; j < s2.length; j++) {
						if(s2Matches[j] === true) {
							k = j + 1;
							break;
						}
					}
					if(s1[i] !== s2[j]) {
						++n_trans;
					}
				}
			}
			var weight = (m / s1.length + m / s2.length + (m - (n_trans / 2)) / m) / 3;
			var l = 0;
			var p = 0.1;
			if(weight > 0.7) {
				while (s1[l] === s2[l] && l < 4) {
					++l;
				}
				weight = weight + l * p * (1 - weight);
			}
			return weight;
		},
		
		arraySimilar(a,b) {
			a = this.stripCommon(a);
			b = this.stripCommon(b);
			var m = a.split(" ");
			var n = b.split(" ");
			m = [...new Set(m)];
			n = [...new Set(n)];
			var c = m.concat(n);
			c = [...new Set(c)];
			var o = (c.length / (m.length + n.length));
			o = 1 - o;
			return o;
		},
		
		stripCommon(str) {
			common.forEach(function(d) {
				str = str.replaceAll(d, "");
				str = str.replaceAll("  ", " ");
				str = str.trim();
			});
			return str;
		},
		
		stripString(a) {
			a = a.toLowerCase();
			a = a.replace(/[^a-z\- ]/g, '');
			a = a.replace(/\s+/g, ' ');
			a = a.trim();
			return a;
		},
	}
	
	export default {
		name: 'SpellChecker',
	}
	
	function capWordList(arr) {
		var nArr = [];
		var aArr = [];
		for(var i=0; i<arr.length; i++) {
			if(!isAllCap2(arr[i])) nArr.push(capital(arr[i]));
			if(arr[i].includes("'")) aArr.push(arr[i].replace("'","’"));
		}
		arr = arr.concat(nArr);
		arr = arr.concat(aArr);
		arr = arr.filter(function(n) {
			return (n.length>1);
		});
		arr = arr.concat(singleLetters);
		arr = [...new Set(arr)];
		arr.sort(function(a, b) {
			if(a.toLowerCase() < b.toLowerCase()) return -1;
			else if(a.toLowerCase() > b.toLowerCase()) return 1;
			else if(a < b) return 1;
			else if(a > b) return -1;
			else return 0;
		});
		return arr;
	}
	
	function sortWordList(arr) {
		arr = capWordList(arr);
		arr.sort(function(a, b) {
			/*//
				if(a.toLowerCase().startsWith("s") && !b.toLowerCase().startsWith("s")) return -1;
				else if(!a.toLowerCase().startsWith("s") && b.toLowerCase().startsWith("s")) return 1;
				else if(a.length < b.length) return 1;
			//*/
			if(a.length < b.length) return 1;
			else if(a.length > b.length) return -1;
			else if(a.toLowerCase() < b.toLowerCase()) return 1;
			else if(a.toLowerCase() > b.toLowerCase()) return -1;
			else if(a < b) return 1;
			else if(a > b) return -1;
			else return 0;
		});
		return arr;
	}
	
	function isNull(meh) {
		if(meh == null || meh == undefined) {
			return true;
		}
		if(typeof meh == "number") {
			if(isNaN(meh)) return true;
		}
		if(typeof meh == "string") {
			if(meh == "") return true;
			if(meh.trim() == "") return true;
		}
		if(meh.constructor == [].constructor) {
			if(meh.length == 0) return true;
		}
		if(meh.constructor == {}.constructor) {
			var keys = Object.keys(meh);
			if(keys.length == 0) return true;
		}
		return false;
	}
	
	function capital(txt) {
		if(txt.length == 1) {
			return txt.toUpperCase();
		}
		return txt.charAt(0).toUpperCase() + txt.substr(1);
	}

	function isAllCap2(str) {
		var allCap = str.toUpperCase();
		return (str==allCap);
	}
	
	function sortSizeList(arr) {
		arr = capWordList(arr);
		arr.sort(function(a, b) {
			if(a.length < b.length) return 1;
			else if(a.length > b.length) return -1;
			else return 0;
		});
		return arr;
	}

	function capWordList(arr) {
		var nArr = [];
		var aArr = [];
		for(var i=0; i<arr.length; i++) {
			if(!isAllCap2(arr[i])) nArr.push(capital(arr[i]));
			if(arr[i].includes("'")) aArr.push(arr[i].replace("'","’"));
		}
		arr = arr.concat(nArr);
		arr = arr.concat(aArr);
		arr = arr.filter(function(n) {
			return (n.length>1);
		});
		arr = arr.concat(singleLetters);
		arr = [...new Set(arr)];
		arr.sort(function(a, b) {
			if(a.toLowerCase() < b.toLowerCase()) return -1;
			else if(a.toLowerCase() > b.toLowerCase()) return 1;
			else if(a < b) return 1;
			else if(a > b) return -1;
			else return 0;
		});
		return arr;
	}
	
	function isSubArr(aArr, bArr) {
		var result = [];
		for(var i=0; i<aArr.length; i++) {
			var canAdd = true;
			var a = aArr[i];
			for(var j=0; j<bArr.length; j++) {
				var b = bArr[j];
				if(b.includes(a)) {
					canAdd = false;
				}
			}
			if(canAdd) result.push(a);
		}
		return result;
	}
</script>
