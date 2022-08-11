<template>
	<q-page class="flex flex-center blackBack">
		<SearchViewer />
	</q-page>
</template>

<script>
	import { defineComponent } from 'vue'
	import SearchViewer from 'components/SearchViewer.vue'
	
	export default defineComponent({
		name: 'BuildPerks',
		components: {
			SearchViewer
		}
	})
</script>
