<template>
	<Store />
	<div class="row fullWidth fullHeight">
		<div class="placeHold" name="display">
			<div class="row fullHeight">
			</div>
		</div>
		<div class="col-3" name="display">
			<q-scroll-area class="fullHeight">
				<q-list bordered name="CostList">
					<q-item>
						<q-item-section>
							<q-item-label header dark>
								<q-input debounce="500" clearable dark v-model="costFilt" type="number" min="0" step="50" max="maxVal" label="Cost" >
									<template v-slot:append>
										<q-icon name="search" @click='filterCostFilter(costFilt)' />
									</template>
								</q-input>
							</q-item-label>
						</q-item-section>
					</q-item>
					<Cost v-for="d in costList" :key="d.Cost" v-bind="d" @click='updateCostFilter(d)' />
				</q-list>
				<q-scroll-observer />
			</q-scroll-area>
		</div>
		<div class="col-3" name="display">
			<q-scroll-area class="fullHeight">
				<q-list bordered name="FandomList">
					<q-item>
						<q-item-section>
							<q-item-label header dark>
								<q-input debounce="500" clearable dark bottom-slots v-model="fanFilt" label="Fandom">
									<template v-slot:append>
										<q-icon name="search" @click='filterFandomFilter(fanFilt)' />
									</template>
								</q-input>
							</q-item-label>
						</q-item-section>
					</q-item>
					<Fandom v-for="p in fandomList" :key="p.Fandom" v-bind="p" @click='updateFandomFilter(p)' />
				</q-list>
				<q-scroll-observer />
			</q-scroll-area>
		</div>
		<div class="col-3" name="display">
			<q-scroll-area class="fullHeight">
				<q-list bordered name="DocumentList">
					<q-item>
						<q-item-section>
							<q-item-label header dark>
								<q-input debounce="500" clearable dark v-model="docFilt" label="Document" >
									<template v-slot:append>
										<q-icon name="search" @click='filterDocsFilter(docFilt)' />
									</template>
								</q-input>
							</q-item-label>
						</q-item-section>
					</q-item>
					<Docs v-for="p in docList" :key="p.Document" v-bind="p" @click='updateDocsFilter(p)' />
				</q-list>
				<q-scroll-observer />
			</q-scroll-area>
		</div>
		<div class="col-3" name="display">
			<q-scroll-area class="fullHeight">
				<q-list bordered name="domainList">
					<q-item>
						<q-item-section>
							<q-item-label header dark>
								<q-input debounce="500" clearable dark v-model="domFilt" label="Domain" >
									<template v-slot:append>
										<q-icon name="search" @click='filterDomainFilter(domFilt)' />
									</template>
								</q-input>
							</q-item-label>
						</q-item-section>
					</q-item>
					<DomainFilter v-for="p in domainList" :key="p.Title" v-bind="p" @click='updateDomainFilter(p)' />
				</q-list>
				<q-scroll-observer />
			</q-scroll-area>
		</div>
	</div>
</template>

<script>
	import { defineComponent, ref, onMounted, watch, toRefs, computed} from 'vue';
	import { Cookies } from 'quasar';
	import DomainFilter from 'components/DomainFilter.vue';
	import Cost from 'components/Cost.vue';
	import Fandom from 'components/Fandom.vue';
	import Docs from 'components/Docs.vue';
	import Perk from 'components/Perk.vue';
	import Store from 'components/Store.vue';
	
	export default defineComponent({
		name: 'BuildViewer',
		components: {
			DomainFilter,
			Cost,
			Fandom,
			Store,
			Docs,
		},
		props: {
			
		},
		setup (props) {
			const costFilt = ref("");
			const sCostFilt = ref("");
			const fanFilt = ref("");
			const sFanFilt = ref("");
			const docFilt = ref("");
			const sDocFilt = ref("");
			const domFilt = ref("");
			const sDomFilt = ref("");
			const displayList = ref(null);
			const perkList = ref(null);
			const costList = ref([]);
			const fandomList = ref([]);
			const docList = ref([]);
			const domainList = ref([]);
			const saveDocFilt = ref([]);
			const saveDomainFilt = ref([]);
			const maxVal = ref(0);
			
			const costCookie = Cookies.get('costList')
			const fandCookie = Cookies.get('fandList')
			const domaCookie = Cookies.get('domaList')
			
			const getDisplayList = async () => {
				var filters = await Store.fetchFilters();
				if(isNull(costCookie)) {
					costList.value = filters.costToggle;
				}
				else {
					costList.value = costCookie;
				}
				if(isNull(fandCookie)) {
					fandomList.value = filters.fandomToggle;
				}
				else {
					fandomList.value = fandCookie;
				}
				if(isNull(domaCookie)) {
					domainList.value = filters.domainToggle;
				}
				else {
					domainList.value = domaCookie;
				}
				saveDomainFilt.value = JSON.parse(JSON.stringify(domainList.value));
				setHeight();
				maxVal.value = await Store.fetchMaxValue();
			}
			
			onMounted(getDisplayList);
			
			return {
				domainList: domainList,
				perkList: perkList,
				costList: costList,
				fandomList: fandomList,
				docList: docList,
				costFilt: costFilt,
				fanFilt: fanFilt,
				docFilt: docFilt,
				domFilt: domFilt,
				saveDocFilt: saveDocFilt,
				saveDomainFilt: saveDomainFilt,
				maxVal: maxVal,
				updateCostFilter(selected) {
					var newFilter = Store.updateCostFilter(selected);
					costList.value = newFilter;
					Cookies.set('costCookie', newFilter);
				},
				updateDisplay(perk) {
					Store.setDisplay(perk);
				},
				updateFandomFilter(selected) {
					var newFilter = Store.updateFandomFilter(fanFilt.value);
					fandomList.value = newFilter;
					docList.value = selected.Documents;
					saveDocFilt.value = JSON.parse(JSON.stringify(docList.value));
				},
				filterFandomFilter(selected) {
					console.log("filterFandomFilter",selected);
					var newFilter = Store.updateFandomFilter(fanFilt.value);
					fandomList.value = newFilter;
				},
				filterCostFilter(selected) {
					console.log("filterCostFilter",selected);
					
				},
				filterDomainFilter(selected) {
					if(!isNull(domFilt.value)) {
						if(domFilt.value.length>=3) {
							var newDomList = saveDomainFilt.value;
							newDomList = newDomList.filter(function(n) {
								return (n.Domain.toLowerCase().includes(domFilt.value.toLowerCase()) || n.Domain=="All");
							});
							domainList.value = newDomList;
						}
					}
					if(isNull(domFilt.value)) {
						domainList.value = saveDomainFilt.value;
					}
				},
				filterDocsFilter(selected) {
					var nDocList = saveDocFilt.value;
					if(!isNull(docFilt.value)) {
						if(docFilt.value.length>=3) {
							nDocList = nDocList.filter(function(n) {
								return (n.Document.toLowerCase().includes(docFilt.value.toLowerCase()) || n.Document=="All");
							});
							docList.value = nDocList;
						}
					}
					if(isNull(docFilt.value)) {
						docList.value = saveDocFilt.value;
					}
				},
				updateDocsFilter(selected) {
					var saveFandom = selected.Fandom;
					if(selected.Fandom=="All") {
						var newFan = Store.updateDocsFilterAll(selected);
						fandomList.value = newFan;
						Cookies.set('fandCookie', newFan);
						var newFilter = Store.updateFandomFilter(fanFilt.value);
						fandomList.value = newFilter;
						//docList.value = selected.Documents;
					}
					else {
						var newFan = Store.updateDocsFilter(selected);
						fandomList.value = newFan;
						Cookies.set('fandCookie', newFan);
						var newFilter = Store.updateFandomFilter(fanFilt.value);
						fandomList.value = newFilter;
					}
					var fanList = fandomList.value;
					for(var i=0; i<fanList.length; i++) {
						if(fanList[i].Fandom==saveFandom) {
							docList.value = fanList[i].Documents;
							break;
						}
					}
				},
				updateDomainFilter(selected) {
					if(selected.Domain=="All" && !isNull(domFilt.value)) {
						if(domFilt.value.length>=3) {
							var newFlat = [];
							domainList.value.forEach(function(n) {
							newFlat.push(n.Domain);
							});
						var newFilter = Store.updateDomainFilterAll(selected,newFlat);
						saveDomainFilt.value = JSON.parse(JSON.stringify(newFilter));
						if(!isNull(domFilt.value)) {
							if(domFilt.value.length>=3) {
								newFilter = newFilter.filter(function(n) {
									return (n.Domain.toLowerCase().includes(domFilt.value.toLowerCase()) || n.Domain=="All");
								});
							}
						}
						domainList.value = newFilter;
						Cookies.set('domaCookie', newFilter);
						}
					}
					if(selected.Domain!="All") {
						var newFilter = Store.updateDomainFilter(selected);
						saveDomainFilt.value = JSON.parse(JSON.stringify(newFilter));
						if(!isNull(domFilt.value)) {
							if(domFilt.value.length>=3) {
								newFilter = newFilter.filter(function(n) {
									return (n.Domain.toLowerCase().includes(domFilt.value.toLowerCase()) || n.Domain=="All");
								});
							}
						}
						domainList.value = newFilter;
						Cookies.set('domaCookie', newFilter);
					}
				},
				displayList,
				getDisplayList,
				query: Store.searchString,
			}
		},
		data() {
			return {
				storeState: Store.state
			}
		}
	})
	
	function setHeight() {
		var qp = document.getElementsByClassName("q-page")[0];
		document.documentElement.style.setProperty('--vHeight', (qp.offsetHeight - 50) + "px");
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
</script>
