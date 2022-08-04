<template>
	<div>
		<q-item clickable v-ripple dark>
			<q-item-section>
				<q-item-label caption>{{Domain}}</q-item-label>
			</q-item-section>
			<q-item-section side top>
				<q-item-label>{{Perks.length}}</q-item-label>
			</q-item-section>
		</q-item>
	</div>
</template>
<script>
	export default {
		name: 'ActualPerk',
		data() {
			return {
				
			}
		},
		props: {
			Domain: {
				type: String,
				required: true
			},
			Over_Domain: {
				type: String,
				required: true
			},
			Perks: {
				type: Array,
				required: true
			},
		},
		setup () {
			return {}
		}
	}
</script>