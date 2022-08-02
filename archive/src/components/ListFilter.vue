<template>
	<div class="col-12">
		<q-list bordered :dark="true" seperator padding name="ListFilter">
			<q-item dark dense>
				<q-item-section>
					<q-item-label overline>Filter</q-item-label>
					<q-item-label caption>Filter</q-item-label>
				</q-item-section>
			</q-item>
			
			<div class="row">
				<div class="col-12 col-md-2">
					<q-item dark dense>
						<q-item-section>
							<q-item-label overline>Domain</q-item-label>
							<q-item-label caption>
								<q-select dark dense v-model="Domain" :options="options" behavior="menu"/>
							</q-item-label>
						</q-item-section>
					</q-item>
				</div>
				
				<div class="col-12 col-md-10">
					<q-item dark dense>
						<q-item-section>
							<q-item-label overline>Cost</q-item-label>
							<q-item-label caption>
								<q-range v-model="Cost" :min="0" :max="900000" :step="50" label snap markers/>
								</q-item-label>
							</q-item-section>
						</q-item>
					</div>
				</div>
				
				<div class="row">
					<div class="col-12 col-md-9">
						<q-item dark dense>
							<q-item-section>
								<q-item-label caption>
									<q-input dense clearable debounce="1000" type="search" name="search" placeholder="Search" v-model="text" @enter="setQuery()">
									</q-input>
								</q-item-label>
							</q-item-section>
						</q-item>
					</div>
					
					<div class="col-12 col-md-3">
						<q-item dark dense>
							<q-item-section>
								<q-item-label caption>
									<q-input dense name="count" placeholder="list size" v-model.number="length" type="number" filled/>
									</q-item-label>
								</q-item-section>
							</q-item>
						</div>
					</div>
					
				</q-list>
			</div>
		</template>
		
		<script>
			import Store from 'components/Store.vue'
			import { watch, toRefs, ref } from 'vue'
			
			export default {
				name: 'ListFilter',
				props: {
					search: {
						type: String,
						required: false
					}
				},
				data () {
					return {
						domain: 'All',
						options: [
						'All',
						'Toolkits',
						'Knowledge',
						'Vehicles',
						'Time',
						'Crafting',
						'Clothing',
						'Magic',
						'Quality',
						'Size',
						'Resources',
						'Magitech',
						'Alchemy'
						],
						cost: {
							min: 100,
							max: 1800
						},
						text: '',
						length: ''
					}
				},
				methods: {
				    setQuery (text) {
						console.log("listFilter ", text);
						Store.setSearchString(text);
					}
				},
				
				setup (props) {
					const text = ref('')
					const { search } = toRefs(props)
					const setSearchString = async () => {
						await Store.setSearchString(text.value);
					}
					watch (text, setSearchString(text.value));
					
					return {
						
					}
				}
			}
		</script>
		