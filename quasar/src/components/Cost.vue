<template>
	<div>
		<q-item clickable v-ripple dark>
			<q-item-section>
				<q-item-label lines=2>{{Cost}}</q-item-label>
			</q-item-section>
			<q-item-section side>
				{{Enabled}}
			</q-item-section>
		</q-item>
	</div>
</template>
<script>
	import { ref } from 'vue';
	
	export default {
		name: 'ActualCost',
		data() {
			return {
				
			}
		},
		props: {
			Cost: {
				type: String,
				required: true
			},
			Enabled: {
				type: Boolean,
				required: true
			},
		},
		setup () {
			
		}
	}
</script>
