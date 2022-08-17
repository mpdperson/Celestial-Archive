<template>
	<Store />
	<q-page class="flex flex-center blackBack" dark>
		<div class="row fullWidth">
			<div class="placeHold" name="display">
				<div class="row fullHeight">
				</div>
			</div>
			<div class="col-3">
				<q-scroll-area style="height: 100%;">
					
				</q-scroll-area>
			</div>
			<div class="col-3">
				<q-scroll-area style="height: 100%;">
					
				</q-scroll-area>
			</div>
			<div class="col-3">
				<q-scroll-area style="height: 100%;">
					
				</q-scroll-area>
			</div>
			<div class="col-3">
				<q-scroll-area style="height: 100%;">
					
				</q-scroll-area>
			</div>
		</div>
	</q-page>
</template>

<script>
	import { defineComponent, ref, onMounted } from 'vue'
	import Domain from 'components/Domain.vue'
	import Perk from 'components/Perk.vue'
	import Store from 'components/Store.vue'
	
	export default defineComponent({
		name: 'IndexPage'
	})
</script>
