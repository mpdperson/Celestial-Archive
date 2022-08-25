<template>
	<Store />
	<q-page class="flex flex-center blackBack" dark>
		<div class="row fullWidth blackBack fullHeight">
			<q-carousel v-model="slide" transition-prev="scale" transition-next="scale" swipeable animated
			control-color="white" navigation padding arrows 
			class="blackBack text-white fullWidth ">
				<q-carousel-slide name="Version" class="no-wrap text-center">
					<div>
						<q-icon name="language" size="56px">
							<q-tooltip class="bg-indigo" :offset="[10, 10]">
								Version of Perk List
							</q-tooltip>
						</q-icon>
						Version
					</div>
					<br>
					<div class="q-pa-md text-white column items-center">
						<div class="q-gutter-sm">
							<q-radio dark v-model="vtype" val="v1" label="Celestial Forge v1.2" color="blue" @click="fileNotVis">
							</q-radio>
							<q-radio dark v-model="vtype" val="v2" label="Celestial Forge v2.1" color="blue" @click="fileNotVis">
							</q-radio>
							<q-radio dark v-model="vtype" val="v3" label="Celestial Forge v3.1" color="blue" @click="fileNotVis">
							</q-radio>
							<q-radio dark v-model="vtype" val="a1" label="Celestial Archive v1.3" color="blue" @click="fileNotVis">
							</q-radio>
							<q-radio dark v-model="vtype" val="File" label="Load File" color="blue" @click="fileVis">
							</q-radio>
						</div>
						<div v-show="visible">
							<q-form name="myForm" dark>
								<q-file style="width:200px;" color="teal" name="myFile" v-model="myFile" filled label="Load"  dark accept=".json" >
									<template v-slot:prepend>
										<q-icon name="cloud_upload" />
									</template>
								</q-file>
							</q-form>
						</div>
					</div>
				</q-carousel-slide>
				<q-carousel-slide name="Mode" class="no-wrap text-center">
					<div>
						<q-icon name="style" size="56px">
							<q-tooltip class="bg-indigo" :offset="[10, 10]">
								Type of Celestial Archive
							</q-tooltip>
						</q-icon>
						Mode
					</div>
				</q-carousel-slide>
				<q-carousel-slide name="Starters" class="no-wrap text-center">
					<div>
						<q-icon name="checklist" size="56px">
							<q-tooltip class="bg-indigo" :offset="[10, 10]">
								Starter Perk Packages to modify play
							</q-tooltip>
						</q-icon>
						Starters
					</div>
				</q-carousel-slide>
				<q-carousel-slide name="Options" class="no-wrap text-center">
					<div>
						<q-icon name="build" size="56px">
							<q-tooltip class="bg-indigo" :offset="[10, 10]">
								Tweaks to how the Roller works
							</q-tooltip>
						</q-icon>
						Options
					</div>
				</q-carousel-slide>
				<q-carousel-slide name="Go" class="no-wrap text-center column items-center">
					<div class="col">
						<q-icon name="rocket_launch" size="56px">
							<q-tooltip class="bg-indigo" :offset="[10, 10]">
								Start your Gacha
							</q-tooltip>
						</q-icon>
						Launch
					</div>
					<div class="col self-center" >
						<q-btn class="self-center" @click="resetNgo" label="Start" color="primary"/>
					</div>
				</q-carousel-slide>
			</q-carousel>
		</div>
	</q-page>
</template>

<script>
	import { defineComponent, ref, onMounted } from 'vue';
	import { useQuasar } from 'quasar';
	import Domain from 'components/Domain.vue';
	import Perk from 'components/Perk.vue';
	import Store from 'components/Store.vue';
	
	export default defineComponent({
		name: 'IndexPage',
		components: {
			Store
		},
		setup () {
			const vtype = ref('v1');
			const vmode = ref('Forge');
			const optArr = ref([]);
			const startArr = ref([]);
			const $q = useQuasar();
			const visible = ref(false);
			const confirm = async () => {
				$q.dialog({ 
					title: 'Confirm', 
					message: 'This will reset your current Build, continue?', 
				cancel: true, persistent: true })
				.onOk(() => {
					var obj = {
						"Forge":vtype.value,
						"Mode":"Forge",
						"Starters":[],
						"Options":[],
					}
					if(vtype.value=="File") {
						obj["File"] = readFile();
					}
					console.log("launchForge",obj);
					//Store.launchForge(obj);
					//nav("Gacha"); 
				})
			}
			
			const getDisplayList = async () => {
				setHeight();
				listenFile();
			}
			onMounted(getDisplayList);
			return {
				vtype: vtype,
				vmode: vmode,
				optArr: optArr,
				startArr: startArr,
				slide: ref('Version'),
				visible: visible,
				myFile: ref(null),
				resetNgo() {
					confirm();
				},
				fileVis() {
					visible.value = true;
				},
				fileNotVis() {
					visible.value = false;
				}
			}
		}
	})
	
	function setHeight() {
		var qp = document.getElementsByClassName("q-page")[0];
		document.documentElement.style.setProperty('--vHeight', (qp.offsetHeight - 50) + "px");
	}
	
	function nav(url) {
		var first = window.location.href;
		var last = first.split("/").pop();
		first = first.replace(last,"");
		window.location.href = first + url;
	}
	
	var saveFileName = "";
	var importFile = [];
	var loadedJson = {};
	function listenFile() {
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
								console.log("loadedJson",loadedJson);
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
	}
	
	function readFile() {
		return loadedJson;
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
