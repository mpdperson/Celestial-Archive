<template>
	<Store />
	<div class="row fullWidth">
		<div class="placeHold" name="display">
			<div class="row fullHeight">
			</div>
		</div>
		<div class="col-3">
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
		<div class="col-6" name="display">
			<q-scroll-area style="height: 100%;">
				<q-list bordered name="Perk">
					<q-item>
						<q-item-section>
							<q-item-label header dark>
								<h5>{{ storeState.displayValue.Title }}</h5>
							</q-item-label>
						</q-item-section>
						<q-item-section side>
							<q-btn dark label="accept" v-show="acceptVis" outline ripple color="blue-grey-12" @click="accept(storeState.displayValue)" >
							</q-btn>
							<q-btn dark label="bookmark" v-show="bookVis" outline ripple color="blue-grey-12" @click="bookmark(storeState.displayValue)" >
							</q-btn>
							<q-btn dark label="reject" v-show="rejectVis" outline ripple color="blue-grey-12" @click="reject(storeState.displayValue)" >
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
		setup (props) {
			const displayList = ref(null);
			const perkList = ref(null);
			const bookVis = ref(!Store.state.canGet);
			const rejectVis = ref(Store.state.canGet);
			const acceptVis = ref(Store.state.canGet);
			
			const getDisplayList = async () => {
				displayList.value = await Store.fetchFilteredBuild();
				var canAccept = await Store.hasCurrent();
				var isNull = await Store.isNullPerk();
				if(canAccept && !isNull) {
					acceptVis.value = true;
				}
				if(isNull) {
					bookVis.value = false;
				}
				setHeight();
			}
			
			onMounted(getDisplayList);
			
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
			
			return {
				domainList: displayList,
				perkList: perkList,
				bookVis: bookVis,
				rejectVis: rejectVis,
				acceptVis: acceptVis,
				updateDisplay(perk) {
					Store.setDisplay(perk);
				},
				updateList(selected) {
					perkList.value = Store.fetchPerkList(selected);
				},
				reject(selected) {
					Store.rejectPerk(selected);
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
</script>
