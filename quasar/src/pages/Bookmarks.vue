<template>
	<q-page class="flex blackBack">
		<BookmarkViewer />
	</q-page>
</template>

<script>
	import { defineComponent } from 'vue'
	import BookmarkViewer from 'components/BookmarkViewer.vue'
	
	export default defineComponent({
		name: 'BookmarkPage',
		components: {
			BookmarkViewer
		}
	})
</script>
