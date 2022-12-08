function openURL(urlTxt,title) {
	window.open(urlTxt, title);
}

const routes = [
	{
		path: '/',
		component: () => import('layouts/MainLayout.vue'),
		children: [
			{ path: '', component: () => import('pages/IndexPage.vue') },
			{ path: 'Gacha', component: () => import('pages/Gacha.vue') },
			{ path: 'Buy', component: () => import('pages/Buy.vue') },
			{ path: 'Perks', component: () => import('pages/Perks.vue') },
			{ path: 'Load', component: () => import('pages/Load.vue') },
			{ path: 'Save', component: () => import('pages/Save.vue') },
			{ path: 'Conjoin', component: () => import('pages/Conjoin.vue') },
			{ path: 'Filter', component: () => import('pages/Filter.vue') },
			{ path: 'Free', component: () => import('pages/Free.vue') },
			{ path: 'Search', component: () => import('pages/Search.vue') },
			{ path: 'Help', component: () => import('pages/Help.vue') },
			{ path: 'Bookmarks', component: () => import('pages/Bookmarks.vue') },
			{ path: 'Process', component: () => import('pages/Process.vue') },
			{ path: 'Progress', component: () => import('pages/Progress.vue') },
			{ path: 'ProcessSave', component: () => import('pages/ProcessSave.vue') },
			{ path: 'Drawback', component: () => import('pages/Drawback.vue') },
			{ path: 'Store', component: () => import('pages/Store.vue') },
			{ path: 'Test', component: () => import('pages/Test.vue') },
			{ path: 'Single', component: () => import('pages/Single.vue') },
			{ path: 'Code', component: () => openURL('https://github.com/mpdperson/Celestial-Archive',"Source Code") },
		]
	},
	
	// Always leave this as last one,
	// but you can also remove it
	{
		path: '/:catchAll(.*)*',
		component: () => import('pages/ErrorNotFound.vue')
	}
]

export default routes
