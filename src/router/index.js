import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/auth/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true }
    },
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'super_admin'] },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../views/admin/DashboardView.vue'),
          meta: { title: 'System Overview' }
        },
        {
          path: 'companies',
          name: 'admin-companies',
          component: () => import('../views/admin/CompaniesView.vue'),
          meta: { title: 'Companies Management' }
        },
        {
          path: 'staff',
          name: 'admin-staff',
          component: () => import('../views/admin/StaffView.vue'),
          meta: { title: 'Staff Management' }
        },
        {
          path: 'staff/:id',
          name: 'admin-staff-detail',
          component: () => import('../views/admin/StaffDetailView.vue'),
          meta: { title: 'Staff Member Details' }
        },
        {
          path: 'contracts',
          name: 'admin-contracts',
          component: () => import('../views/admin/ContractsView.vue'),
          meta: { title: 'Contracts & Collections' }
        },

        {
          path: 'expenses',
          name: 'admin-expenses',
          component: () => import('../views/admin/ExpensesView.vue'),
          meta: { title: 'Expenses Management' }
        },
        {
          path: 'expenses/categories',
          name: 'admin-expense-categories',
          component: () => import('../views/admin/ExpenseCategoriesView.vue'),
          meta: { title: 'Expense Categories' }
        },
        {
          path: 'settlements',
          name: 'admin-settlements',
          component: () => import('../views/admin/SettlementsView.vue'),
          meta: { title: 'Payment Settlements' }
        },
        {
          path: 'change-password',
          name: 'admin-change-password',
          component: () => import('../views/admin/ChangePasswordView.vue'),
          meta: { title: 'Security Settings' }
        }
      ]
    },
    {
      path: '/collector',
      component: () => import('../layouts/CollectorLayout.vue'),
      meta: { requiresAuth: true, roles: ['collector'] },
      children: [
        {
          path: '',
          name: 'collector-home',
          component: () => import('../views/collector/CollectorHomeView.vue')
        },
        {
          path: 'collect',
          name: 'collector-form',
          component: () => import('../views/collector/CollectionFormView.vue')
        },
        {
          path: 'upload',
          name: 'collector-upload',
          component: () => import('../views/collector/DocumentUploadView.vue')
        },
        {
          path: 'settle',
          name: 'collector-settle',
          component: () => import('../views/collector/SettlementView.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.guest && token) {
    // Redirect based on role if already logged in
    const role = user?.role
    if (role === 'admin' || role === 'super_admin') next('/admin')
    else if (role === 'collector') next('/collector')
    else {
      // If token exists but role is invalid, allow login page (staying here) or clear
      next()
    }
  } else if (to.meta.roles && !to.meta.roles.includes(user?.role)) {
    // Basic role protection
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      next('/admin')
    } else if (user?.role === 'collector') {
      next('/collector')
    } else {
      // No valid role, clear and go to login to force fresh state
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      next('/login')
    }
  } else {
    next()
  }
})

export default router
