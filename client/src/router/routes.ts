import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/DashboardPage.vue') },
      {
        path: 'management',
        component: () => import('pages/ManagementPage.vue'),
      },
      { path: 'incidents', component: () => import('pages/IncidentsPage.vue') },
      { path: 'logs', component: () => import('pages/LogsPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
