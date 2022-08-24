<template>
	<Store />
	<q-page class="flex flex-center blackBack">
		<q-form @submit="onSubmit" class="q-gutter-md" name="myForm" dark>
			<q-file color="teal" name="myFile" v-model="myFile" filled label="Load"  dark accept=".txt, .pdf, .json" >
				<template v-slot:prepend>
					<q-icon name="cloud_upload" />
				</template>
			</q-file>
			<q-select filled bottom-slots clearable v-model="loadType" :options="options" :dense="dense" label="Load Type" dark />
			<q-btn icon="send" label="Submit" type="submit" color="primary"/>
		</q-form>
	</q-page>
</template>

<script>
	import { defineComponent, ref } from 'vue';
	import Store from 'components/Store.vue';
	
	export default defineComponent({
		name: 'LoadPage',
		components: {
			Store
		},
		props: {
			
		},
		setup (props) {
			const loadType = ref(null);
			return {
				model: ref(null),
				dense: ref(true),
				loadType: loadType,
				options: [
					'Forge', 'Document', 'Progress'
				],
				myFile: ref(null),
				loadProgress() {
					Store.loadProgress();
				},
				onSubmit(evt) {
					const formData = new FormData(evt.target);
					const data = [];
					
					for(const [ name, value ] of formData.entries()) {
						if(value.name.length > 0) {
							data.push({
								name: name,
								value: value.name,
								data: readFile(value.name),
								type: loadType.value,
							})
						}
					}
					var pageTo = Store.loadItem(data);
					//nav(pageTo);
				}
			}
		}
	})
	
	var importFile = [];
	var loadedJson = {};
	sleep(300).then(() => {
		var eFile = document.getElementsByName("myFile");
		var input = eFile[0];
		input.addEventListener('change', () => {
			let files = input.files;
			if(files.length == 0) return;
			const iFile = files[0];
			let reader = new FileReader();
			importFile = [];
			loadedJson = {};
			
			reader.onload = (e) => {
				const file = e.target.result;
				const lines = file.split(/\r\n|\n|\r/);
				importFile = lines;
				var fileName = getFileName();
				var ext = fileName.split(".")[1];
				if(ext=="json") {
					if(!file.startsWith("var ") && !lines[0].includes("=")) {
						try {
							var obj = JSON.parse(file);
							if(!isNull(obj)) {
								loadedJson = obj;
							}
						}
						catch(error) {
							console.error(error);
						}
					}
				}
			};
			
			reader.onerror = (e) => console.log(e.target.error.name);
			reader.readAsText(iFile);
		});
	});
	
	function nav(url) {
		var first = window.location.href;
		var last = first.split("/").pop();
		first = first.replace(last,"");
		window.location.href = first + url;
	}
	
	function readFile(fname) {
		var fileName = fname;
		var ext = fileName.split(".")[1];
		
		if(ext=="json") {
			return loadedJson;
		}
		else if(ext=="txt") {
			return importFile;
		}
		else {
			return null;
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
	
	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	function getFileName() {
		var fullPath = document.getElementsByName("myFile")[0].value;
		if(fullPath) {
			var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
			var filename = fullPath.substring(startIndex);
			if(filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
				filename = filename.substring(1);
			}
			return filename;
		}
		return "";
	}
</script>
