import { h, resolveComponent } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

import DefaultLayout from '@/layouts/DefaultLayout'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: DefaultLayout,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "dashboard" */ '@/views/dashboard/Dashboard.vue'),
      },
      {
        path: '/login',
        name: 'login',
        component: () => import('@/views/minsu/login.vue'),
      },
      {
        path: '/theme',
        name: 'Theme',
        redirect: '/theme/typography',
      },
      {
        path: '/theme/colors',
        name: 'Colors',
        component: () => import('@/views/theme/Colors.vue'),
      },
      {
        path: '/theme/typography',
        name: 'Typography',
        component: () => import('@/views/theme/Typography.vue'),
      },
      {
        path: '/Minsu',
        name: 'minsuMenu',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/Minsu/rcvord',
        children: [
          {
            path: '/Minsu/rcvord',
            name: 'rcvord',
            component: () => import('@/views/minsu/rcvord.vue'),
          },
          {
            path: '/Minsu/rcvord_search',
            name: 'rcvord_search',
            component: () => import('@/views/minsu/rcvordSearch.vue'),
          },
          {
            path: '/Minsu/deli',
            name: 'deli',
            component: () => import('@/views/minsu/deli.vue'),
          },
          {
            path: '/Minsu/deli_search',
            name: 'deli_search',
            component: () => import('@/views/minsu/deliSearch.vue'),
          },
          {
            path: '/Minsu/prcsProgPrecon',
            name: 'prcsProgPrecon',
            component: () => import('@/views/minsu/prcsProgPrecon.vue'),
          },
        ],
      },
      {
        path: '/jamin',
        name: 'jamin',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/jamin/rsc-ordr',
        children: [
          {
            path: '/jamin/rsc-ordr',
            name: '자재발주',
            component: () => import('@/views/jamin/RscOrdr.vue'),
          },
          {
            path: '/jamin/wrhousdlvr',
            name: '창고 입출 관리',
            component: () => import('@/views/jamin/wrhousdlvr.vue'),
          },
          {
            path: '/jamin/wrhousManage',
            name: '창고 관리',
            component: () => import('@/views/jamin/wrhousManage.vue'),
          },
          {
            path: '/jamin/wrhousZoneManage',
            name: '창고 로케이션 관리',
            component: () => import('@/views/jamin/wrhousZoneManage.vue'),
          },
        ],
      },

      {
        path: '/zzun',
        name: 'zzun',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/zzun/Routing',
        children: [
          {
            path: '/zzun/Routing',
            name: 'prcsRouting',
            component: () => import('@/views/zzun/Routing.vue'),
          },
          {
            path: '/zzun/Sample',
            name: 'sample',
            component: () => import('@/views/zzun/Sample.vue'),
          },
        ],
      },

      {
        path: '/product',
        name: 'Product',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/product/product-instructions',

        children: [
          {
            path: '/product/product-instructions',
            name: 'instructions',
            component: () => import('@/views/Product/instructions.vue'),
          },
          {
            path: '/product/prodPlanBoardList',
            name: 'prodPlanBoardList',
            component: () => import('@/views/Product/prodPlanBoardList.vue'),
          },
        ],
      },

      {
        path: '/qlty',
        name: 'Qlty',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/qlty/rscQltyInsp',

        children: [
          {
            path: '/qlty/rscQltyInsp',
            name: 'rscQltyInsp',
            component: () => import('@/views/qlty/rscQltyInsp.vue'),
          },
          {
            path: '/qlty/endPrdtQltyInsp',
            name: 'endPrdtQltyInsp',
            component: () => import('@/views/qlty/endPrdtQltyInsp.vue'),
          },
          {
            path: '/qlty/semiPrdtQltyInsp',
            name: 'semiPrdtQltyInsp',
            component: () => import('@/views/qlty/semiPrdtQltyInsp.vue'),
          },
        ],
      },

      {
        path: '/zooE',
        name: 'zooE',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },

        redirect: '/zooE/rsc-ordr',
        children: [
          {
            path: '/zooE/company-manage',
            name: 'companyManage',
            component: () => import('@/views/zooE/CompanyManage.vue'),
          },
          {
            path: '/zooE/qlty-item-manage',
            name: 'qltyItemManage',
            component: () => import('@/views/zooE/qltyItemManage.vue'),
          },
          {
            path: '/zooE/prdt-manage',
            name: 'prdtManage',
            component: () => import('@/views/zooE/prdtManage.vue'),
          },
          {
            path: '/zooE/rsc-manage',
            name: 'rscManage',
            component: () => import('@/views/zooE/rscManage.vue'),
          },
          {
            path: '/zooE/menu1',
            name: 'menu1',
            component: () => import('@/views/zooE/menu1.vue'),
          },
        ],
      },

      {
        path: '/modal',
        name: 'Modal',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/modal/prdt',
        children: [
          {
            path: '/modal/prdt',
            name: '제품검색모달창',
            component: () => import('@/views/modal/prdtModal.vue'),
            meta: { isModal: true },
          },
        ],
      },

      {
        path: '/base',
        name: 'Base',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/base/breadcrumbs',
        children: [
          {
            path: '/base/accordion',
            name: 'Accordion',
            component: () => import('@/views/base/Accordion.vue'),
          },
          {
            path: '/base/breadcrumbs',
            name: 'Breadcrumbs',
            component: () => import('@/views/base/Breadcrumbs.vue'),
          },
          {
            path: '/base/cards',
            name: 'Cards',
            component: () => import('@/views/base/Cards.vue'),
          },
          {
            path: '/base/carousels',
            name: 'Carousels',
            component: () => import('@/views/base/Carousels.vue'),
          },
          {
            path: '/base/collapses',
            name: 'Collapses',
            component: () => import('@/views/base/Collapses.vue'),
          },
          {
            path: '/base/list-groups',
            name: 'List Groups',
            component: () => import('@/views/base/ListGroups.vue'),
          },
          {
            path: '/base/navs',
            name: 'Navs',
            component: () => import('@/views/base/Navs.vue'),
          },
          {
            path: '/base/paginations',
            name: 'Paginations',
            component: () => import('@/views/base/Paginations.vue'),
          },
          {
            path: '/base/placeholders',
            name: 'Placeholders',
            component: () => import('@/views/base/Placeholders.vue'),
          },
          {
            path: '/base/popovers',
            name: 'Popovers',
            component: () => import('@/views/base/Popovers.vue'),
          },
          {
            path: '/base/progress',
            name: 'Progress',
            component: () => import('@/views/base/Progress.vue'),
          },
          {
            path: '/base/spinners',
            name: 'Spinners',
            component: () => import('@/views/base/Spinners.vue'),
          },
          {
            path: '/base/tables',
            name: 'Tables',
            component: () => import('@/views/base/Tables.vue'),
          },
          {
            path: '/base/tabs',
            name: 'Tabs',
            component: () => import('@/views/base/Tabs.vue'),
          },
          {
            path: '/base/tooltips',
            name: 'Tooltips',
            component: () => import('@/views/base/Tooltips.vue'),
          },
        ],
      },
      {
        path: '/buttons',
        name: 'Buttons',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/buttons/standard-buttons',
        children: [
          {
            path: '/buttons/standard-buttons',
            name: 'Button Component',
            component: () => import('@/views/buttons/Buttons.vue'),
          },
          {
            path: '/buttons/dropdowns',
            name: 'Dropdowns',
            component: () => import('@/views/buttons/Dropdowns.vue'),
          },
          {
            path: '/buttons/button-groups',
            name: 'Button Groups',
            component: () => import('@/views/buttons/ButtonGroups.vue'),
          },
        ],
      },
      {
        path: '/forms',
        name: 'Forms',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/forms/form-control',
        children: [
          {
            path: '/forms/form-control',
            name: 'Form Control',
            component: () => import('@/views/forms/FormControl.vue'),
          },
          {
            path: '/forms/select',
            name: 'Select',
            component: () => import('@/views/forms/Select.vue'),
          },
          {
            path: '/forms/checks-radios',
            name: 'Checks & Radios',
            component: () => import('@/views/forms/ChecksRadios.vue'),
          },
          {
            path: '/forms/range',
            name: 'Range',
            component: () => import('@/views/forms/Range.vue'),
          },
          {
            path: '/forms/input-group',
            name: 'Input Group',
            component: () => import('@/views/forms/InputGroup.vue'),
          },
          {
            path: '/forms/floating-labels',
            name: 'Floating Labels',
            component: () => import('@/views/forms/FloatingLabels.vue'),
          },
          {
            path: '/forms/layout',
            name: 'Layout',
            component: () => import('@/views/forms/Layout.vue'),
          },
          {
            path: '/forms/validation',
            name: 'Validation',
            component: () => import('@/views/forms/Validation.vue'),
          },
        ],
      },
      {
        path: '/charts',
        name: 'Charts',
        component: () => import('@/views/charts/Charts.vue'),
      },
      {
        path: '/icons',
        name: 'Icons',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/icons/coreui-icons',
        children: [
          {
            path: '/icons/coreui-icons',
            name: 'CoreUI Icons',
            component: () => import('@/views/icons/CoreUIIcons.vue'),
          },
          {
            path: '/icons/brands',
            name: 'Brands',
            component: () => import('@/views/icons/Brands.vue'),
          },
          {
            path: '/icons/flags',
            name: 'Flags',
            component: () => import('@/views/icons/Flags.vue'),
          },
        ],
      },
      {
        path: '/notifications',
        name: 'Notifications',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/notifications/alerts',
        children: [
          {
            path: '/notifications/alerts',
            name: 'Alerts',
            component: () => import('@/views/notifications/Alerts.vue'),
          },
          {
            path: '/notifications/badges',
            name: 'Badges',
            component: () => import('@/views/notifications/Badges.vue'),
          },
          {
            path: '/notifications/modals',
            name: 'Modals',
            component: () => import('@/views/notifications/Modals.vue'),
          },
          {
            path: '/notifications/toasts',
            name: 'Toasts',
            component: () => import('@/views/notifications/Toasts.vue'),
          },
        ],
      },
      {
        path: '/widgets',
        name: 'Widgets',
        component: () => import('@/views/widgets/Widgets.vue'),
      },
    ],
  },
  {
    path: '/pages',
    redirect: '/pages/404',
    name: 'Pages',
    component: {
      render() {
        return h(resolveComponent('router-view'))
      },
    },
    children: [
      {
        path: '404',
        name: 'Page404',
        component: () => import('@/views/pages/Page404'),
      },
      {
        path: '500',
        name: 'Page500',
        component: () => import('@/views/pages/Page500'),
      },
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/pages/Login'),
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/pages/Register'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    // always scroll to top
    return {
      top: 0,
    }
  },
})

// 전역 인증 가드: rcvord 페이지 보호 (필요시 meta.requireAuth 로 확장 가능)
router.beforeEach(async (to) => {
  const auth = useAuthStore()
  // 세션 미확인 상태라면 한번 조회
  if (!auth.user && !auth.loading) {
    // fetchSession 실패해도 user는 null 유지
    try {
      await auth.fetchSession()
    } catch {}
  }

  // 보호할 경로 목록
  const protectedPaths = ['/Minsu/rcvord', '/jamin/rsc-ordr']
  if (protectedPaths.includes(to.path)) {
    if (!auth.user) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }
  }
  return true
})

export default router
