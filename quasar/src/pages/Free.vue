<template>
	<q-page class="flex blackBack">
		<FreeViewer />
	</q-page>
</template>

<script>
	import { defineComponent } from 'vue'
	import FreeViewer from 'components/FreeViewer.vue'
	
	export default defineComponent({
		name: 'FreePage',
		components: {
			FreeViewer
		}
	})
</script>
