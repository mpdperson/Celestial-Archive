<template>
	<Store />
	<div class="row fullWidth">
		<div class="col-3">
			<q-scroll-area style="height: 100%;">
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
			</q-scroll-area>
		</div>
		<div class="col-3">
			<q-scroll-area style="height: 100%;">
				<q-list bordered name="FandomList">
					<q-item>
						<q-item-section>
							<q-item-label header dark>
								Fandom
							</q-item-label>
						</q-item-section>
					</q-item>
					<Fandom v-for="d in fandomList" :key="d.Fandom" v-bind="d" @click='updateFandomFilter(d)' />
				</q-list>
				<q-scroll-observer />
			</q-scroll-area>
		</div>
		<div class="col-3">
			<q-scroll-area style="height: 100%;">
				<q-list bordered name="DocumentsList">
					<q-item>
						<q-item-section>
							<q-item-label header dark>
								Documents
							</q-item-label>
						</q-item-section>
					</q-item>
					<Docs v-for="d in docList" :key="d.Document" v-bind="d" @click='updateDocsFilter(d)' />
				</q-list>
				<q-scroll-observer />
			</q-scroll-area>
		</div>
		<div class="col-3">
			<q-scroll-area style="height: 100%;">
				<q-list bordered name="DomainsList">
					<q-item>
						<q-item-section>
							<q-item-label header dark>
								Domains
							</q-item-label>
						</q-item-section>
					</q-item>
					<DomainFilter v-for="d in domainList" :key="d.Domain" v-bind="d" @click='updateDomainFilter(d)' />
				</q-list>
				<q-scroll-observer />
			</q-scroll-area>
		</div>
	</div>
</template>

<script>
	import { defineComponent, ref, onMounted, watch, toRefs, computed} from 'vue';
	import Store from 'components/Store.vue';
	import Cost from 'components/Cost.vue';
	import Fandom from 'components/Fandom.vue';
	import Docs from 'components/Docs.vue';
	import DomainFilter from 'components/DomainFilter.vue';
	
	export default defineComponent({
		name: 'BuildViewer',
		components: {
			Store,
			Cost,
			Fandom,
			Docs,
			DomainFilter,
		},
		props: {
			
		},
		setup (props) {
			const costList = ref(null)
			const fandomList = ref(null)
			const docList = ref(null)
			const domainList = ref()
			
			const getDisplayList = async () => {
				var filters = await Store.fetchFilters();
				costList.value = filters.costToggle;//Store.state.costToggle
				fandomList.value = filters.fandomToggle;//Store.state.fandomToggle
				docList.value = filters.docsToggle;//Store.state.docsToggle
				domainList.value = filters.domainToggle;//Store.state.domainToggle
			}
			
			onMounted(getDisplayList);
			
			return {
				domainList: domainList,
				costList: costList,
				docList: docList,
				updateCostFilter(selected) {
					costList.value = Store.updateCostFilter(selected);
				},
				updateFandomFilter(selected) {
					fandomList.value = Store.updateFandomFilter(selected);
				},
				updateDocsFilter(selected) {
					docList.value = Store.updateDocsFilter(selected);
				},
				updateDomainFilter(selected) {
					domainList.value = Store.updateDomainFilter(selected);
				},
				getDisplayList,
			}
		},
		data() {
			return {
				storeState: Store.state
			}
		}
	})
</script>
