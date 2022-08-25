<template>
	<Store />
	<div class="row fullWidth fullHeight">
		<div class="placeHold" name="display">
			<div class="row fullHeight">
			</div>
		</div>
		<div class="col-3" name="display">
			<q-scroll-area class="fullHeight">
				<q-list bordered name="SearchList">
					<q-item>
						<q-item-section>
							<q-item-label header dark>
								<q-input debounce="500" clearable dark v-model="searchTxt" type="text" label="Search" >
									<template v-slot:append>
										<q-icon name="search" @click='search()' />
									</template>
								</q-input>
							</q-item-label>
						</q-item-section>
					</q-item>
					<q-item>
						<q-item-section>
							<q-item-label header dark>
								<q-input debounce="500" clearable dark v-model="fanFilter" type="text" label="Fandom" >
								</q-input>
							</q-item-label>
						</q-item-section>
					</q-item>
					<q-item>
						<q-item-section>
							<q-item-label header dark>
								<q-input debounce="500" clearable dark v-model="sourceFilter" type="text" label="Document" >
								</q-input>
							</q-item-label>
						</q-item-section>
					</q-item>
					<q-item dark>
						<q-checkbox v-model="titleSearch" label="Title" />
					</q-item>
					<q-item dark>
						<q-checkbox v-model="descSearch" label="Description" />
					</q-item>
				</q-list>
				<q-scroll-observer />
			</q-scroll-area>
		</div>
		<div class="col-3" name="display">
			<q-scroll-area style="height: 100%;">
				<q-list bordered name="DomainList">
					<q-item>
						<q-item-section>
							<q-item-label header dark>
								Domains
							</q-item-label>
						</q-item-section>
					</q-item>
					<Domain v-for="d in domainList" :key="d.ID" v-bind="d" @click='updateList(d)' />
				</q-list>
				<q-scroll-observer />
			</q-scroll-area>
		</div>
		<div class="col-3" name="display">
			<q-scroll-area style="height: 100%;">
				<q-list bordered name="PerkList">
					<q-item>
						<q-item-section>
							<q-item-label header dark>
								Perks
							</q-item-label>
						</q-item-section>
					</q-item>
					<Perk v-for="p in perkList" :key="p.Title" v-bind="p" @click='updateDisplay(p)' />
				</q-list>
				<q-scroll-observer />
			</q-scroll-area>
		</div>
		<div class="col-3" name="display">
			<q-scroll-area style="height: 100%;">
				<q-list bordered name="Perk">
					<q-item>
						<q-item-section>
							<q-item-label header dark>
								<h5>{{ storeState.displayValue.Title }}</h5>
							</q-item-label>
						</q-item-section>
						<q-item-section side>
							<q-btn dark label="buy" v-show="buyVis" outline ripple color="blue-grey-12" @click="buy(storeState.displayValue)" >
							</q-btn>
							<q-btn dark label="bookmark" v-show="bookVis" outline ripple color="blue-grey-12" @click="book(storeState.displayValue)" >
							</q-btn>
						</q-item-section>
					</q-item>
					<q-item dark>
						<p>Domain: {{ storeState.displayValue.Domain }}</p>
					</q-item>
					<q-item dark>
						<p>Source Material: {{ storeState.displayValue.Source }}</p>
					</q-item>
					<q-item dark>
						<p>Cost: {{ storeState.displayValue.Cost }} CP</p>
					</q-item>
					<q-item dark>
						<p>Description: {{ storeState.displayValue.Description }}</p>
					</q-item>
					<q-item dark>
						<p>ID: {{ storeState.displayValue.ID }}</p>
					</q-item>
					<q-item dark>
						<p>Order: {{ storeState.displayValue.Order }}</p>
					</q-item>
				</q-list>
				<q-scroll-observer />
			</q-scroll-area>
		</div>
	</div>
</template>

<script>
	import { defineComponent, ref, onMounted } from 'vue';
	import { useQuasar } from 'quasar';
	import Domain from 'components/Domain.vue';
	import Perk from 'components/Perk.vue';
	import Store from 'components/Store.vue';
	
	export default defineComponent({
		name: 'BuildViewer',
		components: {
			Domain,
			Store,
			Perk
		},
		props: {
			
		},
		setup (props) {//["Title","Description","Source","Upper_Source"];
			const $q = useQuasar();
			const triggerFreeNote = (perks) => {
				var count = perks.length;
				if(count>0) {
					$q.notify({
						icon: 'card_giftcard',
						progress: true,
						color: 'green',
						textColor: 'white',
						classes: 'glossy',
						message: 'You have '+count+' free Perks.'
					});
				}
			}
			const triggerConjoinNote = (perks) => {
				var count = perks.length;
				count--;
				if(count>0) {
					Notify.create({
						icon: 'link',
						progress: true,
						color: 'green',
						textColor: 'white',
						classes: 'glossy',
						message: 'You have '+count+' Conjoined Perks.'
					});
				}
			}
			const displayList = ref(null);
			const perkList = ref(null);
			const titleSearch = ref(true);
			const sourceSearch = ref(true);
			const descSearch = ref(true);
			const upSearch = ref(true);
			const margin = ref(0.6);
			const searchTxt = ref(Store.state.searchString);
			const sourceFilter = ref(Store.state.sourceString);
			const fanFilter = ref(Store.state.fanString);
			const bookVis = ref(false);
			const buyVis = ref(false);
			
			const getDisplayList = async () => {
				displayList.value = await Store.fetchSearchResults();
				setHeight();
			}
			
			onMounted(getDisplayList);
			
			return {
				domainList: displayList,
				titleSearch: titleSearch,
				sourceSearch: sourceSearch,
				sourceFilter: sourceFilter,
				descSearch: descSearch,
				fanFilter: fanFilter,
				searchTxt: searchTxt,
				upSearch: upSearch,
				perkList: perkList,
				bookVis: bookVis,
				buyVis: buyVis,
				margin: margin,
				updateDisplay(perk) {
					Store.setDisplay(perk);
					
					var canBuy = Store.canBuy(perk);
					var isItNull = Store.isThisNull(perk);
					buyVis.value = (canBuy && !isItNull);
					bookVis.value = (!canBuy && !isItNull);
				},
				updateList(selected) {
					perkList.value = Store.fetchPerkList(selected);
				},
				reject(selected) {
					Store.rejectPerk(selected);
				},
				search() {
					var att = [];
					if(titleSearch.value) {
						att.push("Title");
					}
					if(sourceSearch.value) {
						att.push("Source");
					}
					if(upSearch.value) {
						att.push("Upper_Source");
					}
					if(descSearch.value) {
						att.push("Description");
					}
					if(!isNull(sourceFilter.value)) {
						att.push("Source");
					}
					if(!isNull(fanFilter.value)) {
						att.push("Upper_Source");
					}
					att = [...new Set(att)];
					var search = {};
					var filter = {};
					search["att"] = att;
					search["margin"] = margin.value;
					search["filters"] = {
						"Source": sourceFilter.value,
						"Upper_Source": fanFilter.value,
					};
					search["search"] = searchTxt.value;
					displayList.value = Store.doSearch(search);
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
