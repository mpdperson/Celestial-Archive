<template>
	<q-page class="flex flex-center blackBack">
		<FilterViewer />
	</q-page>
</template>

<script>
	import { defineComponent } from 'vue'
	import FilterViewer from 'components/FilterViewer.vue'
	
	export default defineComponent({
		name: 'BuildPerks',
		components: {
			FilterViewer
		}
	})
</script>
