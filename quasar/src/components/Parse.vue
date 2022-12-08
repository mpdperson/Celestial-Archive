<template>
	<div></div>
</template>
<script>
	import { reactive } from 'vue';
	
	const parse = {
		debug: true,
		state: reactive({
			BASE64_MARKER: ';base64,',
		}),
		
		ExtractText(fileID) {
			var input = document.getElementById(fileID);
			var fReader = new FileReader();
			fReader.readAsDataURL(input.files[0]);
			
			fReader.onloadend = function (event) {
				this.convertDataURIToBinary(event.target.result);
			}
		},
		
		ExtractFile(files) {
			var fReader = new FileReader();
			fReader.readAsDataURL(files);
			
			fReader.onloadend = function (event) {
				this.convertDataURIToBinary(event.target.result);
			}
		},
		
		convertDataURIToBinary(dataURI) {
			var base64Index = dataURI.indexOf(this.state.BASE64_MARKER) + BASE64_MARKER.length;
			var base64 = dataURI.substring(base64Index);
			var raw = window.atob(base64);
			var rawLength = raw.length;
			var array = new Uint8Array(new ArrayBuffer(rawLength));
			
			for (var i = 0; i < rawLength; i++) {
				array[i] = raw.charCodeAt(i);
			}
			this.pdfAsArray(array);
		},
		
		pdfAsArray(pdfAsArray) {
			PDFJS.getDocument(pdfAsArray).then(function (pdf) {
				var pdfDocument = pdf;
				//Create an array that will contain our promises
				var pagesPromises = [];
				
				for (var i = 0; i < pdf.pdfInfo.numPages; i++) {
					//Required to prevent that i is always the total of pages
					(function (pageNumber) {
						//Store the promise of getPageText that returns the text of a page
						pagesPromises.push(this.getPageText(pageNumber, pdfDocument));
					})(i + 1);
				}
				
				//Execute all the promises
				Promise.all(pagesPromises).then(function (pagesText) {
					//Display text of all the pages in the console
					//e.g ["Text content page 1", "Text content page 2", "Text content page 3" ... ]
					//representing every single page of PDF Document by array indexing
					var outputStr = "";
					for (var pageNum = 0; pageNum < pagesText.length; pageNum++) {
						finalText += pagesText[pageNum];
						outputStr = "";
						outputStr = "<br/><br/>Page " + (pageNum + 1) + ":<br/><br/>";
						
						var div = document.getElementById('output');
						var tbox = document.getElementById('myTextArea');
						var elementType = tbox.nodeName;
						tbox.value += "\r\n\r\nPage " + (pageNum + 1) + ":\r\n\r\n";
						//tbox.value+="\r\n\r\n";
						
						var actText = pagesText[pageNum];
						actText = this.textClean(actText);
						importFile = [];
						importFile = actText.split(/(\r\n?|\n\r?)/);
						
						outputStr += actText.replace(/\r\n/gm,"<br/>");
						if(elementType=="DIV") {
							tbox.innerHTML += outputStr;
						}
						else if(elementType=="TEXTAREA") {
							tbox.value += actText;
						}
					}
				});
			}, 
			function (reason) {
				//PDF loading error
				console.error(reason);
			});
		},
		
		getPageText(pageNum, PDFDocumentInstance) {
			//Return a Promise that is solved once the text of the page is retrieven
			return new Promise(function (resolve, reject) {
				PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
					//The main trick to obtain the text of the PDF page, use the getTextContent method
					pdfPage.getTextContent().then(function (textContent) {
						var textItems = textContent.items;
						var finalString = "";
						
						//Concatenate the string of the item to the final string
						for (var i = 0; i < textItems.length; i++) {
							var addStr = textItems[i].str;
							
							if(isNull(addStr)) {
								addStr = addStr + "\r\n";
							}
							
							finalString += addStr;
						}
						
						//Solve promise with the text retrieven from the page
						resolve(finalString);
					});
				});
			});
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
		
		checkLines(str) {
			str = str.replace(/\)\:([\r\n ]+)([^\r\n]+)/gm,"):\r\n$2");
			str = str.replace(/\:([\r\n ]+)([^\r\n]+)\)/gm,": $2)");
			str = str.replace(/([\r\n]+) ([\+\-●])/gm,"$1$2");
			str = str.replace(/([\+\-●])([^\+\-●\r\n]+)([\r\n]+)([\+\-●])/gm,"$1$2\r\n$4");
			str = str.replace(/([\+\-●])([^\+\-●\r\n]+)([\r\n]+)([\+\-●])/gm,"$1$2\r\n$4");
			str = str.replace(/([a-z])\- ([A-Za-z])/gm,"$1-$2");
			str = str.replace(/([0-9]+)([ ]?)d([ ]?)([0-9]+)/gm,"$1d$4");
			str = str.replace(/([0-9]+)d([0-9]+)([ ]?)([\-\+])([ ]?)([0-9]+)/gm,"$1d$2$4$6");
			str = str.replace(/([^\r\n]+)\r\n([\+\-●])([^\+\-●\r\n\(]+)\(/gm,"$1\r\n\r\n$2$3 (");
			str = str.replace(/\r\n\r\n\r\n(\r\n)+/gm,"\r\n\r\n\r\n");
			str = str.replace(/([ ]+)/gm," ");
			
			return str;
		},
	}
	
	export default {
		name: 'ProcessFiles',
	}
	
</script>
