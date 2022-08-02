
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'Gacha', component: () => import('pages/Gacha.vue') },
      { path: 'Perks', component: () => import('pages/Perks.vue') },
      { path: 'Upload', component: () => import('pages/Upload.vue') },
      { path: 'Save', component: () => import('pages/Save.vue') },
      { path: 'Filter', component: () => import('pages/Filter.vue') },
      { path: 'Search', component: () => import('pages/Search.vue') },
      { path: 'Settings', component: () => import('pages/Settings.vue') },
      { path: 'Help', component: () => import('pages/Help.vue') },
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
