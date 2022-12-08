<template>
	<q-page class="flex blackBack">
		<TempViewer />
	</q-page>
</template>

<script>
	import { defineComponent } from 'vue';
	import TempViewer from 'components/TempViewer.vue';
	
	export default defineComponent({
		name: 'ProgressPage',
		components: {
			TempViewer
		}
	})
</script>
