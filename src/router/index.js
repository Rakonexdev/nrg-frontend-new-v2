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
          component: () => import('../views/admin/DashboardView.vue')
        },
        {
          path: 'staff',
          name: 'admin-staff',
          component: () => import('../views/admin/StaffView.vue')
        },
        {
          path: 'staff/:id',
          name: 'admin-staff-detail',
          component: () => import('../views/admin/StaffDetailView.vue')
        },
        {
          path: 'companies',
          name: 'admin-companies',
          component: () => import('../views/admin/CompaniesView.vue')
        },
        {
          path: 'contracts',
          name: 'admin-contracts',
          component: () => import('../views/admin/ContractsView.vue')
        },

        {
          path: 'expenses',
          name: 'admin-expenses',
          component: () => import('../views/admin/ExpensesView.vue')
        },
        {
          path: 'expenses/categories',
          name: 'admin-expense-categories',
          component: () => import('../views/admin/ExpenseCategoriesView.vue')
        },
        {
          path: 'settlements',
          name: 'admin-settlements',
          component: () => import('../views/admin/SettlementsView.vue')
        },
        {
          path: 'collectors',
          name: 'admin-collectors',
          component: () => import('../views/admin/CollectorsView.vue')
        },
        // Reports
        {
          path: 'reports/collections',
          name: 'admin-reports-collections',
          component: () => import('../views/admin/CollectionsReportView.vue'),
          meta: { title: 'Collections Report' }
        },
        {
          path: 'reports/income-expenditure',
          name: 'admin-reports-income-expenditure',
          component: () => import('../views/admin/IncomeExpenditureReportView.vue'),
          meta: { title: 'Income & Expenditure Report' }
        },
        {
          path: 'reports/documentation-status',
          name: 'admin-reports-documentation-status',
          component: () => import('../views/admin/reports/DocumentationStatusView.vue'),
          meta: { title: 'Documentation Status' }
        },
        // Role Access (Super Admin only)
        {
          path: 'role-access',
          name: 'admin-role-access',
          component: () => import('../views/admin/RoleAccessView.vue'),
          meta: { title: 'Role Access', superAdminOnly: true }
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
    const role = user?.role
    if (role === 'admin' || role === 'super_admin') next('/admin')
    else if (role === 'collector') next('/collector')
    else {
      next()
    }
  } else if (to.meta.superAdminOnly && user?.role !== 'super_admin') {
    // Block non-super_admin from super admin only pages
    next('/admin')
  } else if (to.meta.roles && !to.meta.roles.includes(user?.role)) {
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      next('/admin')
    } else if (user?.role === 'collector') {
      next('/collector')
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      next('/login')
    }
  } else {
    next()
  }
})

export default router
