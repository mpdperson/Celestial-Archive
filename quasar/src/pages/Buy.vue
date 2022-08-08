<template>
	<q-page class="flex blackBack">
		<BuyViewer />
	</q-page>
</template>

<script>
	import { defineComponent } from 'vue'
	import BuyViewer from 'components/BuyViewer.vue'
	
	export default defineComponent({
		name: 'BuyPage',
		components: {
			BuyViewer
		}
	})
</script>
