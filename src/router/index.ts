import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/LoginPage.vue')
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/resumes',
    children: [
      { path: 'resumes', name: 'Resumes', component: () => import('@/pages/ResumePage.vue') },
      { path: 'experiences', name: 'Experiences', component: () => import('@/pages/ExperiencePage.vue') },
      { path: 'jd-match', name: 'JdMatch', component: () => import('@/pages/JdMatchPage.vue') },
      { path: 'interview', name: 'Interview', component: () => import('@/pages/InterviewPage.vue') },
      { path: 'reports', name: 'Reports', component: () => import('@/pages/ReportPage.vue') },
      { path: 'reports/:id', name: 'ReportDetail', component: () => import('@/pages/ReportDetailPage.vue') },
      { path: 'logs', name: 'Logs', component: () => import('@/pages/LogPage.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    return '/login'
  }
  if (to.path === '/login' && token) {
    return '/'
  }
})

export default router
