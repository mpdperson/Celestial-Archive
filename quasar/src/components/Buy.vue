<template>
	<Store />
	<div class="col-12">
		<q-list bordered :dark="true" seperator padding name="GachaButton">
			<div class="row">
				<div class="btnWidth q-pa-md">
					<q-btn dark label="Gacha!" outline ripple color="blue-grey-12" @click="roll(cp, result)">
					</q-btn>
				</div>
				<div class="cstWidth q-pa-md">
					<q-btn-toggle dark :options="[{ label: cp, value: cp }]" outline ripple color="blue-grey-12" @click="buy(cp, result)" >
					</q-btn-toggle>
				</div>
				<div class="rsnWidth q-pa-md">
					{{result}}
				</div>
			</div>
		</q-list>
	</div>
</template>

<script>
	import Store from 'components/Store.vue'
	import { defineComponent, ref } from 'vue'
	
	export default defineComponent({
		name: 'BuyButton',
		components: {
			Store
		},
		setup () {
			const cp = ref(Store.state.currentCP);
			const result = ref("Press Gacha! button for 100 CP and a chance to pull a random perk");
			
			return {
				cp,
				result,
				roll() {
					let randomPerk = Store.getBuy();
					var actPerk = randomPerk.Perk;
					Store.setDisplay(actPerk);
					cp.value = Store.state.currentCP;
					
					if (randomPerk.Add) {
						result.value = "Perk purchased and added to build";
						Store.addPerk(actPerk);
					}
					else {
						if(isNull(actPerk.Prereq_Title) && isNull(actPerk.Restrict_Title) && isNull(actPerk.Exclude_Title)) {
							result.value = "Couldn't afford perk."
						}
						else {
							result.value = getReason(actPerk);
						}
					}
				},
				buy() {
					Store.increment();
					cp.value = Store.state.currentCP;
				}
			}
		},
	})
	
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
