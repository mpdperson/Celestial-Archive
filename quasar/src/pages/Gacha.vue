<template>
	<q-page class="flex blackBack">
		<ListViewer />
	</q-page>
</template>

<script>
	import { defineComponent } from 'vue';
	import ListViewer from 'components/ListViewer.vue';
	
	export default defineComponent({
		name: 'GachaPage',
		components: {
			ListViewer
		}
	})
</script>
