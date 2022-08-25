<template>
	<q-page class="flex flex-center blackBack">
		<BuildViewer />
	</q-page>
</template>

<script>
	import { defineComponent } from 'vue';
	import BuildViewer from 'components/BuildViewer.vue';
	
	export default defineComponent({
		name: 'BuildPerks',
		components: {
			BuildViewer
		}
	})
</script>
