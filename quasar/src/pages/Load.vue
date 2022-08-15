<template>
	<Store />
	<q-page class="flex flex-center">
		<q-form @submit="onSubmit" class="q-gutter-md">
			<q-file color="teal" name="poster_file" v-model="myFile" filled label="Load" >
				<template v-slot:prepend>
					<q-icon name="cloud_upload" />
				</template>
			</q-file>
			
			<q-btn icon="send" label="Submit" type="submit" color="primary"/>
		</q-form>
		
	</q-page>
</template>

<script>
	import { defineComponent, ref } from 'vue';
	import Store from 'components/Store.vue';
	
	export default defineComponent({
		name: 'LoadPage',
		components: {
			Store
		},
		props: {
			
		},
		setup (props) {
			const submitEmpty = ref(false);
			const submitResult = ref([]);
			
			return {
				file: ref(null),
				files: ref(null),
				myFile: ref(null),
				submitEmpty,
				submitResult,
				loadProgress() {
					Store.loadProgress();
				},
				onSubmit(evt) {
					const formData = new FormData(evt.target);
					const data = [];
					
					for (const [ name, value ] of formData.entries()) {
						console.log("name",name);
						console.log("value",value);
						if (value.name.length > 0) {
							data.push({
								name,
								value: value.name
							})
						}
					}
					
					submitResult.value = data;
					submitEmpty.value = data.length === 0;
				}
			}
		}
	})
</script>
