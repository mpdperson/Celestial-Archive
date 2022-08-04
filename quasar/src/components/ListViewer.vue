<template>
	<Store />
	<div class="row fullWidth">
		<div class="col-3">
			<q-scroll-area style="height: 100%;">
				<q-list bordered name="domainList">
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
				<q-list bordered name="domainList">
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
		<div class="col-6 q-pa-md" name="display">
			
			<Gacha />
			
			<div class="row">
				<q-list>
					<q-item>
						<q-item-section>
							<q-item-label header dark>
								{{ storeState.displayValue.Title }}
							</q-item-label>
						</q-item-section>
						<q-item-section side>
							<q-btn dark label="add perk" outline ripple color="blue-grey-12" @click="getDomain(storeState.displayValue)" >
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
				</q-list>
			</div>
		</div>
	</div>
</template>
<script>
	import { defineComponent, ref, onMounted, watch, toRefs, computed} from 'vue'
	import Domain from 'components/Domain.vue'
	import Perk from 'components/Perk.vue'
	import Store from 'components/Store.vue'
	import Gacha from 'components/Gacha.vue'
	
	export default defineComponent({
		name: 'ListViewer',
		components: {
			Domain,
			Store,
			Perk,
			Gacha
		},
		props: {
			
		},
		setup (props) {
			const displayList = ref(null)
			const perkList = ref(null)
			
			const getDisplayList = async () => {
				displayList.value = await Store.fetchFilteredDomains();
			}
			
			onMounted(getDisplayList);
			
			return {
				domainList: displayList,
				perkList: perkList,
				updateDisplay(perk) {
					Store.setDisplay(perk);
				},
				updateList(selected) {
					perkList.value = Store.fetchPerkList(selected);
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
</script>
