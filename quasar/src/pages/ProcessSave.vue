<template>
	<q-page class="flex blackBack">
		<ProcessViewer />
	</q-page>
</template>

<script>
	import { defineComponent } from 'vue'
	import ProcessViewer from 'components/ProcessViewer.vue'
	
	export default defineComponent({
		name: 'ProcessSavePage',
		components: {
			ProcessViewer
		}
	})
</script>
