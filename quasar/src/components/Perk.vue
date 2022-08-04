<template>
	<div>
		<q-item clickable v-ripple dark>
			<q-item-section>
				<q-item-label lines=4>{{Title}}</q-item-label>
				<q-item-label caption>{{Source}}</q-item-label>
			</q-item-section>
			<q-item-section side top>
				<q-item-label>{{Cost}}</q-item-label>
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
			Description: {
				type: String,
				required: true
			},
			Dice: {
				type: String,
				required: true
			},
			Discount_Cost: {
				type: Number,
				required: true
			},
			Discount_Multiplier: {
				type: Number,
				required: true
			},
			Discount_Title: {
				type: String,
				required: true
			},
			Domain: {
				type: String,
				required: true
			},
			Domain_Number: {
				type: Number,
				required: true
			},
			Exclude_Title: {
				type: String,
				required: true
			},
			Free_Title: {
				type: String,
				required: true
			},
			ID: {
				type: String,
				required: true
			},
			Over_Domain: {
				type: String,
				required: true
			},
			Perk_Number: {
				type: Number,
				required: true
			},
			Prereq_Title: {
				type: String,
				required: true
			},
			Restrict_Title: {
				type: String,
				required: true
			},
			Retake: {
				type: Boolean,
				required: true
			},
			Retake_Cost: {
				type: Number,
				required: true
			},
			Retake_Count: {
				type: Number,
				required: true
			},
			Retake_Multiplier: {
				type: Number,
				required: true
			},
			Retake_Limit: {
				type: Number,
				required: true
			},
			Source: {
				type: String,
				required: true
			},
			Upper_Source: {
				type: String,
				required: true
			},
			Taken: {
				type: Boolean,
				required: true
			},
		},
		setup () {
			return {}
		}
	}
</script>
