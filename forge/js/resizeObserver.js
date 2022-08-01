/*
	const h1Elem = document.querySelector('h1');
	const pElem = document.querySelector('p');
	const divElem = document.querySelector('body > div');
	const slider = document.querySelector('input[type="range"]');
	const checkbox = document.querySelector('input[type="checkbox"]');
//*/

const rObserver = new ResizeObserver(entries => {
	var body = document.body;
	var html = document.documentElement;
	for (let entry of entries) {
		var height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
		var width = Math.max( body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth );
		html.style.setProperty('--sx', height + "px");
		html.style.setProperty('--sy', width + "px");
		if(entry.contentBoxSize) {
			// The standard makes contentBoxSize an array...
			if (entry.contentBoxSize[0]) {
				//h1Elem.style.fontSize = Math.max(1.5, entry.contentBoxSize[0].inlineSize/200) + 'rem';
				//pElem.style.fontSize = Math.max(1, entry.contentBoxSize[0].inlineSize/600) + 'rem';
			} 
			else {
				// ...but old versions of Firefox treat it as a single item
				//h1Elem.style.fontSize = Math.max(1.5, entry.contentBoxSize.inlineSize/200) + 'rem';
				//pElem.style.fontSize = Math.max(1, entry.contentBoxSize.inlineSize/600) + 'rem';
			}
			
		} 
		else {
			//h1Elem.style.fontSize = Math.max(1.5, entry.contentRect.width/200) + 'rem';
			//pElem.style.fontSize = Math.max(1, entry.contentRect.width/600) + 'rem';
		}
	}
});

function getHeight() {
	var body = document.body;
	var html = document.documentElement;
	return Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );;
}

function getWidth() {
	var body = document.body;
	var html = document.documentElement;
	return Math.max( body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth );
}
