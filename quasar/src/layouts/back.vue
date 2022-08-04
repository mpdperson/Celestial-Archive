<template>
	<q-layout view="hHh LpR fFf">
		<q-header elevated>
			<q-toolbar>
				<q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
				<q-toolbar-title>Celestial Archive</q-toolbar-title>
				<div>Quasar v{{ $q.version }}</div>
			</q-toolbar>
			
			<q-tabs align="left" >
				<q-btn-toggle glossy v-model="slide" :options="[{ label: 'Main', value: 'slideZero' },{ label: 'Gacha', value: 'slideOne' },{ label: 'Perks', value: 'slideTwo' }]" />
			</q-tabs>
		</q-header>
		
		<q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
			<q-list>
				<template v-for="(menuItem, index) in menuList" :key="index">
					<q-item clickable v-ripple exact :to="menuItem.to">
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
			<keep-alive>
				<div>
					<q-carousel v-model="slide" transition-prev="scale" transition-next="scale" dark animated control-color="white" height ="auto" >
						<q-carousel-slide name="slideZero" >
							<q-page class="flex flex-center">
								<img
								alt="Quasar logo"
								src="~assets/quasar-logo-vertical.svg"
								style="width: 200px; height: 200px"
								>
							</q-page>
						</q-carousel-slide>
						<q-carousel-slide name="slideOne" >
							<PerkViewer :onSlide="1" />
						</q-carousel-slide>
						<q-carousel-slide name="slideTwo">
							<PerkViewer :onSlide="2" />
						</q-carousel-slide>
						<q-carousel-slide name="Save">
							Hello
						</q-carousel-slide>
					</q-carousel>
				</div>
			</keep-alive>
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
	import PerkViewer from 'components/PerkViewer.vue'
	
	const menuList = [{
		icon: 'save',
		label: 'Save',
		to: '/Save',
		separator: true
	},
	{
		icon: 'upload',
		label: 'Load',
		to: '/Load',
		separator: false
	},
	{
		icon: 'search',
		label: 'Search',
		to: '/Search',
		separator: false
	},
	{
		icon: 'tune',
		label: 'Filter',
		to: '/Filter',
		separator: false
	},
	{
		icon: 'settings',
		label: 'Settings',
		to: '/Settings',
		separator: false
	},
	{
		icon: 'help',
		iconColor: 'primary',
		label: 'Help',
		to: '/Help',
		separator: false
	},
	{
		icon: 'code',
		label: 'Source Code',
		to: 'https://github.com/mpdperson/Celestial-Archive',
		separator: false
	}];
	
	export default defineComponent({
		name: 'MainLayout',
		
		gotoSlide: function(meh){
			console.log("gotoSlide",meh);
		},
		
		components: {
			PerkViewer
		},
		
		data () {
			return {
				slide: 'slideZero',
				slideZero: 'Start',
				slideTwo: 'Gacha',
				slideThree: 'Current Build',
			}
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
