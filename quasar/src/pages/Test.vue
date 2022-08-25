<template>
	<q-page class="flex flex-center blackBack">
		<div class="row fullWidth blackBack">
			<q-carousel v-model="slide" transition-prev="scale" transition-next="scale" swipeable animated
			control-color="white" navigation padding arrows 
			class="blackBack text-white">
				<q-carousel-slide name="style" class="column no-wrap flex-center">
					<q-icon name="style" size="56px" />
					<div class="q-mt-md text-center">
						{{ lorem }}
					</div>
				</q-carousel-slide>
				<q-carousel-slide name="tv" class="column no-wrap flex-center">
					<q-icon name="live_tv" size="56px" />
					<div class="q-mt-md text-center">
						{{ lorem }}
					</div>
				</q-carousel-slide>
				<q-carousel-slide name="layers" class="column no-wrap flex-center">
					<q-icon name="layers" size="56px" />
					<div class="q-mt-md text-center">
						{{ lorem }}
					</div>
				</q-carousel-slide>
				<q-carousel-slide name="map" class="column no-wrap flex-center">
					<q-icon name="terrain" size="56px" />
					<div class="q-mt-md text-center">
						{{ lorem }}
					</div>
				</q-carousel-slide>
			</q-carousel>
		</div>
	</q-page>
</template>

<script>
	import { ref, onMounted } from 'vue'
	
	export default {
		name: 'TestPage',
		setup () {
			const getDisplayList = async () => {
				setHeight();
			}
			onMounted(getDisplayList);
			return {
				slide: ref('style'),
				lorem: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Itaque voluptatem totam, architecto cupiditate officia rerum, error dignissimos praesentium libero ab nemo.'
			}
		}
	}
	
	function setHeight() {
		var qp = document.getElementsByClassName("q-page")[0];
		document.documentElement.style.setProperty('--vHeight', (qp.offsetHeight - 50) + "px");
	}
</script>
