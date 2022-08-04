<template>
	<Store />
	<q-layout view="hHh LpR fFf">
		<q-header elevated>
			<q-toolbar>
				<q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
				<q-toolbar-title>Celestial Archive</q-toolbar-title>
				<div>Quasar v{{ $q.version }}</div>
			</q-toolbar>
			
			<q-tabs align="left">
				<q-route-tab to="/" label="Main" />
				<q-route-tab to="/Gacha" label="Gacha" />
				<q-route-tab to="/Perks" label="Perks" />
			</q-tabs>
		</q-header>
		
		<q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
			<q-list>
				<template v-for="(menuItem, index) in menuList" :key="index">
					<q-item clickable v-ripple>
						<q-item-section avatar>
							<q-icon :name="menuItem.icon" />
						</q-item-section>
						<q-item-section>
							{{ menuItem.label }}
						</q-item-section>
					</q-item>
					<q-separator :key="'sep' + index"  v-if="menuItem.separator" />
				</template>
				</q-list>
				</q-drawer>
				
				<q-page-container>
					<!-- <router-view /> -->
					<ViewCarousel />
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
	import { defineComponent, ref } from 'vue'
	import ViewCarousel from 'components/ViewCarousel.vue'
	
	const menuList = [{
		icon: 'save',
		label: 'Save',
		link: '/Save',
		separator: true
	},
	{
		icon: 'upload',
		label: 'Load',
		separator: false
	},
	{
		icon: 'search',
		label: 'Search',
		separator: false
	},
	{
		icon: 'tune',
		label: 'Filter',
		separator: false
	},
	{
		icon: 'settings',
		label: 'Settings',
		separator: false
	},
	{
		icon: 'help',
		iconColor: 'primary',
		label: 'Help',
		separator: false
	},
	{
		icon: 'code',
		label: 'Source Code',
		separator: false
	}];
	
	export default defineComponent({
		name: 'MainLayout',
		
		components: {
			ViewCarousel
		},
		
		setup () {
			const leftDrawerOpen = ref(false)
			
			return {
				leftDrawerOpen,
				menuList,
				toggleLeftDrawer () {
					leftDrawerOpen.value = !leftDrawerOpen.value
				}
			}
		}
	})
</script>
