<template>
	<Store />
	<div class="col-12">
		<q-list bordered :dark="true" seperator padding name="GachaButton">
			<div class="row">
				<div class="col-12 col-md-2 q-pa-md">
					<q-btn dark label="Gacha!" outline ripple color="blue-grey-12" @click="roll(cp, result)">
					</q-btn>
				</div>
				<div class="col-12 col-md-2 q-pa-md">
					CP: {{cp}}
				</div>
				<div class="col-12 col-md-8 q-pa-md">
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
		name: 'GachaButton',
		components: {
			Store
		},
		setup () {
			const cp = ref(0)
			const result = ref("Press Gacha! button for 100 CP and a chance to pull a random perk")
			
			return {
				cp,
				result,
				roll () {
					cp.value += 100;
					let randomPerk = Store.state.unfiltered[Math.floor(Math.random () * Store.state.unfiltered.length)];
					Store.setDisplay(randomPerk);
					
					if (cp.value >= randomPerk.Cost) {
						result.value = "Perk purchased and added to build";
						cp.value = cp.value - randomPerk.Cost;
						Store.addPerk(randomPerk);
					}
					else {
						result.value = "Couldn't afford perk, CP stored"
					}
				}
			}
		},
	})
</script>
