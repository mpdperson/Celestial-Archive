<template>
	<Store />
	<q-layout view="hHh LpR fFf">
		<q-header elevated>
			<q-toolbar>
				<q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
				<q-toolbar-title>Celestial Archive</q-toolbar-title>
				<div>Roller v0.5</div>
			</q-toolbar>
			
			<q-tabs align="left" >
				<q-route-tab to="/Gacha" label="Gacha" />
				<q-route-tab to="/Buy" label="Buy" />
				<q-route-tab to="/Drawback" label="Drawback" />
				<q-route-tab to="/Perks" label="Perks" />
				<q-route-tab to="/Bookmarks" label="Bookmarks" />
			</q-tabs>
		</q-header>
		
		<q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
			<q-scroll-area style="height: 100%;">
				<q-list>
					<template v-for="(menuItem, index) in menuList" :key="index">
						<q-item clickable v-ripple :to="menuItem.to" >
							<q-item-section avatar>
								<q-icon :name="menuItem.icon" />
							</q-item-section>
							<q-item-section>
								{{ menuItem.label }}
							</q-item-section>
							<q-item-section side top>
								<q-badge color="red" :label="menuItem.notes" v-if="menuItem.notes > 0" />
							</q-item-section>
						</q-item>
						<q-separator :key="'sep' + index"  v-if="menuItem.separator" />
					</template>
				</q-list>
				<q-scroll-observer />
			</q-scroll-area>
		</q-drawer>
		
		<q-page-container>
			<router-view />
		</q-page-container>
		
		<q-footer elevated class="bg-grey-8 text-white">
			<q-toolbar>
				<q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
				
				<q-toolbar-title>Celestial Archive</q-toolbar-title>
				
				<div>Copyright © 2022 Stained.Glass</div>
			</q-toolbar>
		</q-footer>
	</q-layout>
</template>

<script>
	import { defineComponent, ref } from 'vue';
	import Store from 'components/Store.vue';
	
	const menuList = [
	{
		icon: 'save',
		label: 'Save',
		to: '/Save',
		notes: 0,
		separator: true
	},
	{
		icon: 'upload',
		label: 'Load',
		to: '/Load',
		notes: 0,
		separator: false
	},
	{
		icon: 'search',
		label: 'Search',
		to: '/Search',
		notes: 0,
		separator: false
	},
	{
		icon: 'tune',
		label: 'Filter',
		to: '/Filter',
		notes: 0,
		separator: false
	},
	{
		icon: 'card_giftcard',
		label: 'Freebies',
		to: '/Free',
		notes: 0,
		separator: false
	},
	{
		icon: 'link',
		label: 'Conjoin',
		to: '/Conjoin',
		notes: 0,
		separator: false
	},
	{
		icon: 'store',
		label: 'Store',
		to: '/Store',
		notes: 0,
		separator: false
	},
	{
		icon: 'settings',
		label: 'Settings',
		to: '/',
		notes: 0,
		separator: false
	},
	{
		icon: 'help',
		iconColor: 'primary',
		label: 'Help',
		to: '/Help',
		notes: 0,
		separator: false
	},
	{
		icon: 'code',
		label: 'Source Code',
		to: '/Code',
		notes: 0,
		separator: false
	}];
	
	export default defineComponent({
		name: 'MainLayout',
		
		components: {
			Store
		},
		
		data() {
			return {
				link: ref('')
			}
		},
		
		setup() {
			const leftDrawerOpen = ref(false);
			
			return {
				leftDrawerOpen,
				menuList,
				toggleLeftDrawer () {
					leftDrawerOpen.value = !leftDrawerOpen.value;
					//*/
					for(var i=0; i<menuList.length; i++) {
						var menuItem = menuList[i];
						if(menuItem.label=="Free") {
							menuList[i].notes = Store.state.currentFreebies.length;
						}
						if(menuItem.label=="Conjoin") {
							menuList[i].notes = Store.state.currentPerks.length;
						}
					}
					//*/
					
				},
				update(notes) {
					//*/
					for(var i=0; i<menuList.length; i++) {
						var menuItem = menuList[i];
						if(menuItem.label==notes.label) {
							menuList[i].notes = notes.notes;
						}
					}
					//*/
				}
			}
		}
	})
</script>
