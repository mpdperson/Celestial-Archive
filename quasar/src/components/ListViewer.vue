<template>
	<Store />
	<div class="row fullWidth">
		<div class="placeHold" name="display">
			<div class="row fullHeight">
			</div>
		</div>
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
			<q-scroll-area style="height: 100%;">
				<div>
					<div class="col-12">
						<q-list bordered :dark="true" seperator padding name="GachaButton">
							<div class="row">
								<div class="btnWidth q-pa-md">
									<q-btn dark label="Gacha!" outline ripple color="blue-grey-12" @click="roll(cp, result)">
									</q-btn>
								</div>
								<div class="cstWidth q-pa-md">
									CP: {{cp}}
								</div>
								<div class="rsnWidth q-pa-md">
									{{result}}
								</div>
							</div>
						</q-list>
					</div>
				</div>
				
				<div class="row">
					<q-list>
						<q-item>
							<q-item-section>
								<q-item-label header dark>
									{{ storeState.displayValue.Title }}
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
					</q-list>
				</div>
				<q-scroll-observer />
			</q-scroll-area>
		</div>
	</div>
</template>
<script>
	import { defineComponent, ref, onMounted, watch, toRefs, computed} from 'vue';
	import { useQuasar } from 'quasar';
	import Domain from 'components/Domain.vue';
	import Perk from 'components/Perk.vue';
	import Store from 'components/Store.vue';
	
	export default defineComponent({
		name: 'ListViewer',
		components: {
			Domain,
			Store,
			Perk,
		},
		props: {
			
		},
		setup (props) {
			const $q = useQuasar();
			const displayList = ref(null)
			const perkList = ref(null)
			const bookVis = ref(!Store.state.canGet)
			const rejectVis = ref(Store.state.canGet)
			const acceptVis = ref(Store.state.canGet)
			const cp = ref(Store.state.currentCP);
			const result = ref("Press Gacha! button for 100 CP and a chance to pull a random perk");
			
			const getDisplayList = async () => {
				displayList.value = await Store.fetchFilteredDomains();
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
			
			return {
				domainList: displayList,
				perkList: perkList,
				bookVis,
				rejectVis,
				acceptVis,
				displayList,
				getDisplayList,
				query: Store.searchString,
				cp,
				result,
				updateDisplay(perk) {
					Store.setDisplay(perk);
				},
				updateList(selected) {
					perkList.value = Store.fetchPerkList(selected);
				},
				bookmark(selected) {
					Store.setBookmark(selected);
				},
				accept(selected) {
					Store.setCurrentCP(cp.value - selected.Cost);
					Store.addPerk(selected);
				},
				reject(selected) {
					Store.rejectPerk(selected);
				},
				roll() {
					let randomPerk = Store.getRoll();
					var actPerk = randomPerk.Perk;
					Store.setDisplay(actPerk);
					cp.value = Store.state.currentCP;
					var freebies = Store.state.currentFreebies;
					triggerFreeNote(freebies);
					var conjoin = Store.state.currentPerks;
					triggerConjoinNote(conjoin);
					
					if (randomPerk.Add) {
						Store.setCurrentCP(cp.value + actPerk.Cost);
						cp.value = Store.state.currentCP;
						result.value = "Perk available for purchase.";
						
						rejectVis.value = true;
						acceptVis.value = true;
						bookVis.value = false;
					}
					else {
						rejectVis.value = false;
						acceptVis.value = false;
						bookVis.value = true;
						
						if(isNull(actPerk.Prereq_Title) && isNull(actPerk.Restrict_Title) && isNull(actPerk.Exclude_Title)) {
							result.value = "Can't afford perk."
						}
						else {
							result.value = getReason(actPerk);
						}
					}
				},
				triggerFreeNote(perks) {
					var count = perks.length;
					if(count>0) {
						$q.notify({
							type: 'positive',
							message: 'You have '+count+' free Perks.'
						});
					}
				},
				triggerConjoinNote(perks) {
					var count = perks.length;
					count--;
					if(count>0) {
						$q.notify({
							type: 'positive',
							message: 'You have '+count+' Conjoined Perks.'
						});
					}
				},
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
	
	function getReason(obj) {
		var prereq = "";
		var exclude = "";
		var restrict = "";
		if(!isNull(obj.Prereq_Title)) {
			prereq = obj.Prereq_Title.replaceAll("(","");
			prereq = prereq.replaceAll(")","");
			prereq = prereq.replaceAll(" && ","” and “");
			prereq = prereq.replaceAll(" || ","” or “");
			prereq = "“" + prereq + "”";
		}
		if(!isNull(obj.Restrict_Title)) {
			restrict = obj.Restrict_Title.replaceAll("(","");
			restrict = restrict.replaceAll(")","");
			restrict = restrict.replaceAll(" && ","” and “");
			restrict = restrict.replaceAll(" || ","” or “");
			restrict = "“" + restrict + "”";
		}
		if(!isNull(obj.Exclude_Title)) {
			exclude = obj.Exclude_Title.replaceAll("(","");
			exclude = exclude.replaceAll(")","");
			exclude = exclude.replaceAll(" && ","” and “");
			exclude = exclude.replaceAll(" || ","” or “");
			exclude = "“" + exclude + "”";
		}
		var result = "";
		if(!isNull(prereq)) {
			result += "Missing Prerequisite: "+prereq;
		}
		if(!isNull(restrict)) {
			result += "Missing Restriction: "+prereq;
		}
		if(!isNull(exclude)) {
			result += "Have Exclusion: "+prereq;
		}
		return result;
	}
</script>
