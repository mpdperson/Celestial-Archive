<template>
	<Store />
	<q-page class="flex flex-center blackBack" dark>
		<div class="row fullWidth blackBack fullHeight">
			<q-carousel v-model="slide" transition-prev="scale" transition-next="scale" swipeable animated
			control-color="white" navigation padding arrows 
			class="blackBack text-white fullWidth ">
				<q-carousel-slide name="Version" class="no-wrap text-center">
					<div>
						<q-icon name="language" size="56px" />
						Version
					</div>
					<br>
					<div class="q-pa-md text-white">
						<div class="q-gutter-sm">
							<q-radio dark v-model="vtype" val="v1" label="Celestial Forge v1.2" color="blue" />
							<q-radio dark v-model="vtype" val="v2" label="Celestial Forge v2.1" color="blue" />
							<q-radio dark v-model="vtype" val="v3" label="Celestial Forge v3.1" color="blue" />
							<q-radio dark v-model="vtype" val="a1" label="Celestial Archive v1.3" color="blue" />
						</div>
					</div>
				</q-carousel-slide>
				<q-carousel-slide name="Starters" class="no-wrap text-center">
					<div>
						<q-icon name="checklist" size="56px" />
						Starters
					</div>
				</q-carousel-slide>
				<q-carousel-slide name="Options" class="no-wrap text-center">
					<div>
						<q-icon name="build" size="56px" />
						Options
					</div>
				</q-carousel-slide>
				<q-carousel-slide name="Go" class="no-wrap text-center">
					<div>
						<q-icon name="rocket_launch" size="56px" />
						Launch
					</div>
				</q-carousel-slide>
			</q-carousel>
		</div>
	</q-page>
</template>

<script>
	import { defineComponent, ref, onMounted } from 'vue'
	import Domain from 'components/Domain.vue'
	import Perk from 'components/Perk.vue'
	import Store from 'components/Store.vue'
	
	export default defineComponent({
		name: 'IndexPage',
		components: {
			Store
		},
		setup () {
			const getDisplayList = async () => {
				setHeight();
			}
			onMounted(getDisplayList);
			return {
				vtype: ref('v1'),
				slide: ref('Version'),
			}
		}
	})
	
	function setHeight() {
		var qp = document.getElementsByClassName("q-page")[0];
		document.documentElement.style.setProperty('--vHeight', (qp.offsetHeight - 50) + "px");
	}
</script>
