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
	common.forEach(function(d) {
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
	for(var key in map) {
		dict[key] = true;
	}
}

function termFreqMapToVector(map, dict) {
	var termFreqVector = [];
	for(var term in dict) {
		termFreqVector.push(map[term] || 0);
	}
	return termFreqVector;
}

function vecDotProduct(vecA, vecB) {
	var product = 0;
	for(var i = 0; i < vecA.length; i++) {
		product += vecA[i] * vecB[i];
	}
	return product;
}

function vecMagnitude(vec) {
	var sum = 0;
	for(var i = 0; i < vec.length; i++) {
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
}