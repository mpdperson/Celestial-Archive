<template>
	<div>
		<q-item clickable v-ripple dark>
			<q-item-section>
				<q-item-label lines=2>{{Fandom}}</q-item-label>
			</q-item-section>
			<q-item-section side top>
				<q-item-label>{{Enabled}}</q-item-label>
			</q-item-section>
		</q-item>
	</div>
</template>
<script>
	export default {
		name: 'ActualDocs',
		data() {
			return {
				
			}
		},
		props: {
			Docs: {
				type: String,
				required: true
			},
			Enabled: {
				type: Boolean,
				required: true
			},
		},
		setup () {
			return {}
		}
	}
</script>
