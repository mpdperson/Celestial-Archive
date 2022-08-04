<template>
	<div>
		<q-carousel v-model="slide" transition-prev="scale" transition-next="scale" dark animated control-color="white" height ="auto" >
			<q-carousel-slide name="slideZero" >
				<q-page class="flex flex-center">
					<img
					alt="Quasar logo"
					src="~assets/quasar-logo-vertical.svg"
					style="width: 200px; height: 200px"
					>
				</q-page>
			</q-carousel-slide>
			<q-carousel-slide name="slideOne" >
				<div>
					{{ slideOne }}
				</div>
				<PerkViewer :onSlide="1" />
			</q-carousel-slide>
			<q-carousel-slide name="slideTwo">
				<div>
					{{ slideTwo }}
				</div>
				<PerkViewer :onSlide="2" />
			</q-carousel-slide>
		</q-carousel>
	</div>
</template>

<script>
	import PerkViewer from 'components/PerkViewer.vue'
	//import Store from 'src/data/Store.js'
	
	export default {
		name: 'ViewCarousel',
		data () {
			return {
				slide: 'slideZero',
				slideZero: 'Start',
				slideTwo: 'Gacha',
				slideThree: 'Current Build',
			}
		},
		components: {
			PerkViewer
		},
		setup () {
			return {
				
			}
		}
	}
</script>
