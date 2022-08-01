
function setDisplay(collapsed, item) {
	if(collapsed) {
		item.classList.add("hide");
	}
	else {
		item.classList.remove("hide");
	}
}

function displayData(data, el) {
	var par = document.createElement('ul');
	var idx = el.id;
	
	for (var i = 0; i<data.length; i++) {
		var item = document.createElement('li');
		var li = par.appendChild(item);
		
		item.innerHTML = data[i].name;
		if(data[i].type == "directory") {
			item.classList.add('dir');
		}
		item.id = idx + "_" + i;
		
		//set initial display from data
		setDisplay(data[i].collapsed, item.parentNode);
		
		li.addEventListener('click', function(e){
			console.log("click");
			var target = e.target;
			var child = e.target.children[0];
			if(child!=undefined) {
				if(child && child.classList.value == 'hide') {
					setDisplay(false, child);
				}
				else {
					setDisplay(true, child);
				}
				e.stopPropagation();
			}
		});
		
		li.addEventListener('dblclick', function(e){
			var target = e.target;
			console.log("dblclick",e.target);
			var ndata = getJson(target.id);
			var path = ndata.path;
			var name = ndata.name;
			var fpath = path.replace(name,"");
			
			$("#dir").val(path);
			$("#path").val(path);
			$("#fpath").val(fpath);
			$("#name").val(name);
			$("#type").val(ndata.type);
			$("#children").val(ndata.children);
			
			if(ndata.type == "directory") {
				if(ndata.children.length!=0) {
					$("#submit").click();
				}
			}
			else {
				console.log("item",ndata);
				$("#submit2").click();
			}
		});
		
		el.appendChild(par);
		
		if (data[i].children) {
			displayData(data[i].children, li);
			if(data[i].children.length == 0) {
				item.classList.add('empty');
			}
		}
	}
}

function getJson(idx) {
	var newidx = idx.split("_");
	newidx.shift();
	newidx = newidx.join("_");
	return bottomJson([menu2],newidx);
}

function bottomJson(data,idx) {
	var newidx = idx.split("_");
	var nIdx = parseInt(newidx[0]);
	var result = data[nIdx];
	
	newidx.shift();
	if(newidx.length != 0) {
		newidx = newidx.join("_");
		if(result.children != undefined) {
			result = bottomJson(result.children, newidx);
		}
	}
	
	return result;
}

//var root = document.getElementById('app');
//displayData(data, root);