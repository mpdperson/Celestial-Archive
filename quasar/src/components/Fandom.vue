<template>
	<div>
		<q-item clickable v-ripple dark>
			<q-item-section>
				<q-item-label caption>{{Fandom}}</q-item-label>
			</q-item-section>
			<q-item-section side top>
				<q-item-label></q-item-label>
			</q-item-section>
		</q-item>
	</div>
</template>
<script>
	export default {
		name: 'ActualFandom',
		data() {
			return {
				
			}
		},
		props: {
			Fandom: {
				type: String,
				required: true
			},
			Enabled: {
				type: Boolean,
				required: true
			},
			Documents: {
				type: Array,
				required: true
			},
		},
		setup () {
			return {}
		}
	}
</script>
