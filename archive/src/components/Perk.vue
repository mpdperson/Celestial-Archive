<template>
	<div>
		<q-item clickable v-ripple dark>
			<q-item-section>
				<q-item-label lines=3>{{title}}</q-item-label>
				<q-item-label caption>{{domain}}</q-item-label>
			</q-item-section>
			<q-item-section side top>
				<q-item-label>{{id}}</q-item-label>
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
			Title: {
				type: String,
				required: true
			},
			Cost: {
				type: Number,
				required: true
			},
			ID: {
				type: String,
				required: true
			},
			Domain: {
				type: String,
				required: true
			},
			Description: {
				type: String,
				required: true
			},
		},
		setup () {
			return {}
		}
	}
</script>
