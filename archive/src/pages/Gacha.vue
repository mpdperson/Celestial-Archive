<template>
	<q-page class="flex flex-center blackBack">
		<PerkViewer/>
	</q-page>
</template>

<script>
	import { defineComponent } from 'vue'
	import PerkViewer from 'components/PerkViewer.vue'
	
	export default defineComponent({
		name: 'GachaPage',
		components: {
			PerkViewer
		}
	})
</script>
