<template>
	<q-page class="flex blackBack">
		<ConjoinViewer />
	</q-page>
</template>

<script>
	import { defineComponent } from 'vue';
	import ConjoinViewer from 'components/ConjoinViewer.vue';
	
	export default defineComponent({
		name: 'FreePage',
		components: {
			ConjoinViewer
		}
	})
</script>
