<template>
	<Store />
	<div class="row fullWidth fullHeight">
		<div class="placeHold" name="display">
			<div class="row fullHeight">
			</div>
		</div>
		<div class="col-3" name="display">
			<q-scroll-area class="fullHeight">
				<div class="row fullHeight">
					<q-list bordered name="CostList">
						<q-item>
							<q-item-section>
								<q-item-label header dark>
									Cost
								</q-item-label>
							</q-item-section>
						</q-item>
						<Cost v-for="d in costList" :key="d.Cost" v-bind="d" @click='updateCostFilter(d)' />
					</q-list>
					<q-scroll-observer />
				</div>
				<q-scroll-observer />
			</q-scroll-area>
		</div>
		<div class="col-3" name="display">
			<q-scroll-area class="fullHeight">
				<q-list bordered name="FandomList">
					<q-item>
						<q-item-section>
							<q-item-label header dark>
								Fandom
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
								Documents
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
								Domain
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
	import { defineComponent, ref, onMounted, watch, toRefs, computed} from 'vue'
	import { Cookies } from 'quasar'
	import DomainFilter from 'components/DomainFilter.vue'
	import Cost from 'components/Cost.vue'
	import Fandom from 'components/Fandom.vue'
	import Docs from 'components/Docs.vue'
	import Perk from 'components/Perk.vue'
	import Store from 'components/Store.vue'
	
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
			const displayList = ref(null)
			const perkList = ref(null)
			const costList = ref([])
			const fandomList = ref([])
			const docList = ref([])
			const domainList = ref([])
			
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
				setHeight();
			}
			
			onMounted(getDisplayList);
			
			return {
				domainList: domainList,
				perkList: perkList,
				costList: costList,
				fandomList: fandomList,
				docList: docList,
				updateCostFilter(selected) {
					var newFilter = Store.updateCostFilter(selected);
					costList.value = newFilter;
					Cookies.set('costCookie', newFilter);
				},
				updateDisplay(perk) {
					Store.setDisplay(perk);
				},
				updateFandomFilter(selected) {
					docList.value = selected.Documents;
				},
				updateDocsFilter(selected) {
					var saveSelect = selected;
					var newFan = Store.updateDocsFilter(selected);
					fandomList.value = newFan;
					Cookies.set('fandCookie', newFan);
				},
				updateDomainFilter(selected) {
					var newFilter = Store.updateDomainFilter(selected);
					domainList.value = newFilter;
					Cookies.set('domaCookie', newFilter);
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
		document.documentElement.style.setProperty('--vHeight', qp.offsetHeight + "px");
	}
</script>
