<template>
	<Store />
	<div class="row">
		<div class="col-4 q-pa-md">
			<q-scroll-area style="height: 900px;">
				<q-list bordered name="perkList">
					<q-item>
						<q-item-section>
							<q-item-label header dark>
								Perks
							</q-item-label>
						</q-item-section>
						
						<q-item-section side>
							<q-btn dark label="add all" outline ripple color="blue-grey-12">
							</q-btn>
						</q-item-section>
					</q-item>
					<Perk v-for="perk in perks" :key="perk.ID" v-bind="perk" @click='updateDisplay(perk)' />
				</q-list>
				<q-scroll-observer />
			</q-scroll-area>
		</div> <!-- class = col-4 -->
		<div class="col-8 q-pa-md" name="display">
			<Gacha />
			
			<div class="row">
				<q-list>
					<q-item>
						<q-item-section>
							<q-item-label header dark>
								{{ storeState.displayValue.title }}
							</q-item-label>
						</q-item-section>
						<q-item-section side>
							<q-btn dark label="add perk" outline ripple color="blue-grey-12" @click="addPerk(storeState.displayValue)" >
							</q-btn>
						</q-item-section>
					</q-item>
					<q-item>
						<p> Domain: {{ storeState.displayValue.Domain }} </p>
					</q-item>
					<q-item>
						<p>Source Material: {{ storeState.displayValue.Source }} </p>
					</q-item>
					<q-item>
						<p> Cost: {{ storeState.displayValue.Cost }} CP </p>
					</q-item>
					<q-item>
						<p> Description: {{ storeState.displayValue.Description }} </p>
					</q-item>
					<q-item>
						<p> ID: {{ storeState.displayValue.ID }} </p>
					</q-item>
				</q-list>
			</div> <!-- class = row -->
		</div> <!-- class = col-8 etc -->
	</div> <!-- class = row -->
</template>

<script>
	import { defineComponent, ref, onMounted, watch, toRefs, computed} from 'vue'
	import Perk from 'components/Perk.vue'
	import Store from 'components/Store.vue'
	import Gacha from 'components/Gacha.vue'
	
	export default defineComponent({
		name: 'PerkViewer',
		components: {
			Perk,
			Store,
			Gacha
		},
		props: {
			onSlide: {
				type: Number,
				required: true
			}
		},
		setup (props) {
			const { onSlide } = toRefs(props)
			
			const displayList = ref(null)
			
			const getDisplayList = async () => {
				displayList.value = await Store.fetchFilteredList()
			}
			
			onMounted(getDisplayList)
			watch(onSlide, getDisplayList)
			
			const query = ref('')
			const queryMatches = computed( () => {
				return displayList.value.filter(perk => {
					return perk.title.includes("Tool")
				})
			})
			
			return {
				perks: displayList,
				updateDisplay (perk) {
					Store.setDisplay(perk)
				},
				addPerk (selected) {
					Store.addPerk(selected)
				},
				displayList,
				getDisplayList,
				query: Store.searchString,
				queryMatches
			}
		},
		data() {
			return {
				storeState: Store.state
			}
		}
	})
</script>
