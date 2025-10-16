export default [
  {
    component: 'CNavItem',
    name: 'Dashboard',
    to: '/dashboard',
    icon: 'cil-speedometer',
    badge: {
      color: 'primary',
      text: 'NEW',
    },
  },
  {
    component: 'CNavTitle',
    name: 'Theme',
  },
  {
    component: 'CNavItem',
    name: 'Colors',
    to: '/theme/colors',
    icon: 'cil-drop',
  },
  {
    component: 'CNavItem',
    name: 'Typography',
    to: '/theme/typography',
    icon: 'cil-pencil',
  },
  {
    component: 'CNavTitle',
    name: 'Components',
  },
  {
    component: 'CNavGroup',
    name: 'jamin',
    to: '/jamin',
    icon: 'cil-cursor',
    items: [
      {
        component: 'CNavItem',
        name: '자재 발주',
        to: '/jamin/rsc-ordr',
      },
      {
        component: 'CNavItem',
        name: '창고 입출고 관리',
        to: '/jamin/wrhousdlvr',
      },
      {
        component: 'CNavItem',
        name: '창고 관리',
        to: '/jamin/wrhousManage',
      },
      {
        component: 'CNavItem',
        name: '창고 로케이션 관리',
        to: '/jamin/wrhousZoneManage',
      },
    ],
  },
  {
    component: 'CNavGroup',
    name: '상쥬니♥',
    to: '/zzun',
    icon: 'cil-cursor',
    items: [
      {
        component: 'CNavItem',
        name: '공정 라우팅',
        to: '/zzun/Routing',
      },
      {
        component: 'CNavItem',
        name: 'Sample',
        to: '/zzun/Sample',
      },
    ],
  },
  {
    component: 'CNavGroup',
    name: '민윤기',
    to: '/product',
    icon: 'cil-cursor',
    items: [
      {
        component: 'CNavItem',
        name: '생산지시',
        to: '/product/product-instructions',
      },
      {
        component: 'CNavItem',
        name: '자재품질',
        to: '/qlty/rscQltyInsp',
      },
      {
        component: 'CNavItem',
        name: '완제품품질',
        to: '/qlty/endPrdtQltyInsp',
      },
      {
        component: 'CNavItem',
        name: '생산계획조회',
        to: '/product/prodPlanBoardList',
      },
      {
        component: 'CNavItem',
        name: '반제품품질',
        to: '/qlty/semiPrdtQltyInsp',
      },
    ],
  },
  {
    component: 'CNavGroup',
    name: '오민수',
    to: '/Minsu',
    icon: 'cil-user',
    items: [
      {
        component: 'CNavItem',
        name: '수주 관리',
        to: '/Minsu/rcvord',
      },
      {
        component: 'CNavItem',
        name: '수주 조회',
        to: '/Minsu/rcvord_search',
      },
      {
        component: 'CNavItem',
        name: '납품 관리',
        to: '/Minsu/deli',
      },
      {
        component: 'CNavItem',
        name: '납품 조회',
        to: '/Minsu/deli_search',
      },
      {
        component: 'CNavItem',
        name: '공정 진행 현황',
        to: '/Minsu/prcsProgPrecon',
      },
    ],
  },
  {
    component: 'CNavGroup',
    name: 'zooE',
    to: '/zooE',
    icon: 'cil-cursor',
    items: [
      {
        component: 'CNavItem',
        name: '업체 관리',
        to: '/zooE/company-manage',
      },
      {
        component: 'CNavItem',
        name: '품질 항목 관리',
        to: '/zooE/qlty-item-manage',
      },
      {
        component: 'CNavItem',
        name: '제품 관리',
        to: '/zooE/prdt-manage',
      },
      {
        component: 'CNavItem',
        name: '자재 관리',
        to: '/zooE/rsc-manage',
      },
      {
        component: 'CNavItem',
        name: '생산 지시',
        to: '/zooE/menu1',
      },
    ],
  },

  {
    component: 'CNavGroup',
    name: 'Base',
    to: '/base',
    icon: 'cil-puzzle',
    items: [
      {
        component: 'CNavItem',
        name: 'Accordion',
        to: '/base/accordion',
      },
      {
        component: 'CNavItem',
        name: 'Breadcrumbs',
        to: '/base/breadcrumbs',
      },
      {
        component: 'CNavItem',
        name: 'Cards',
        to: '/base/cards',
      },
      {
        component: 'CNavItem',
        name: 'Carousels',
        to: '/base/carousels',
      },
      {
        component: 'CNavItem',
        name: 'Collapses',
        to: '/base/collapses',
      },
      {
        component: 'CNavItem',
        name: 'List Groups',
        to: '/base/list-groups',
      },
      {
        component: 'CNavItem',
        name: 'Navs & Tabs',
        to: '/base/navs',
      },
      {
        component: 'CNavItem',
        name: 'Paginations',
        to: '/base/paginations',
      },
      {
        component: 'CNavItem',
        name: 'Placeholders',
        to: '/base/placeholders',
      },
      {
        component: 'CNavItem',
        name: 'Popovers',
        to: '/base/popovers',
      },
      {
        component: 'CNavItem',
        name: 'Progress',
        to: '/base/progress',
      },
      {
        component: 'CNavItem',
        name: 'Spinners',
        to: '/base/spinners',
      },
      {
        component: 'CNavItem',
        name: 'Tables',
        to: '/base/tables',
      },
      {
        component: 'CNavItem',
        name: 'Tabs',
        to: '/base/tabs',
      },
      {
        component: 'CNavItem',
        name: 'Tooltips',
        to: '/base/tooltips',
      },
    ],
  },
  {
    component: 'CNavGroup',
    name: 'Buttons',
    to: '/buttons',
    icon: 'cil-cursor',
    items: [
      {
        component: 'CNavItem',
        name: 'Buttons',
        to: '/buttons/standard-buttons',
      },
      {
        component: 'CNavItem',
        name: 'Button Groups',
        to: '/buttons/button-groups',
      },
      {
        component: 'CNavItem',
        name: 'Dropdowns',
        to: '/buttons/dropdowns',
      },
    ],
  },
  {
    component: 'CNavGroup',
    name: 'Forms',
    to: '/forms',
    icon: 'cil-notes',
    items: [
      {
        component: 'CNavItem',
        name: 'Checks & Radios',
        to: '/forms/checks-radios',
      },
      {
        component: 'CNavItem',
        name: 'Floating Labels',
        to: '/forms/floating-labels',
      },
      {
        component: 'CNavItem',
        name: 'Form Control',
        to: '/forms/form-control',
      },
      {
        component: 'CNavItem',
        name: 'Input Group',
        to: '/forms/input-group',
      },
      {
        component: 'CNavItem',
        name: 'Range',
        to: '/forms/range',
      },
      {
        component: 'CNavItem',
        name: 'Select',
        to: '/forms/select',
      },
      {
        component: 'CNavItem',
        name: 'Layout',
        to: '/forms/layout',
      },
      {
        component: 'CNavItem',
        name: 'Validation',
        to: '/forms/validation',
      },
    ],
  },
  {
    component: 'CNavItem',
    name: 'Charts',
    to: '/charts',
    icon: 'cil-chart-pie',
  },
  {
    component: 'CNavGroup',
    name: 'Icons',
    to: '/icons',
    icon: 'cil-star',
    items: [
      {
        component: 'CNavItem',
        name: 'CoreUI Icons',
        to: '/icons/coreui-icons',
        badge: {
          color: 'info',
          text: 'NEW',
        },
      },
      {
        component: 'CNavItem',
        name: 'Brands',
        to: '/icons/brands',
      },
      {
        component: 'CNavItem',
        name: 'Flags',
        to: '/icons/flags',
      },
    ],
  },
  {
    component: 'CNavGroup',
    name: 'Notifications',
    to: '/notifications',
    icon: 'cil-bell',
    items: [
      {
        component: 'CNavItem',
        name: 'Alerts',
        to: '/notifications/alerts',
      },
      {
        component: 'CNavItem',
        name: 'Badges',
        to: '/notifications/badges',
      },
      {
        component: 'CNavItem',
        name: 'Modals',
        to: '/notifications/modals',
      },
      {
        component: 'CNavItem',
        name: 'Toasts',
        to: '/notifications/toasts',
      },
    ],
  },
  {
    component: 'CNavItem',
    name: 'Widgets',
    to: '/widgets',
    icon: 'cil-calculator',
    badge: {
      color: 'primary',
      text: 'NEW',
      shape: 'pill',
    },
  },
  {
    component: 'CNavTitle',
    name: 'Extras',
  },
  {
    component: 'CNavGroup',
    name: 'Pages',
    to: '/pages',
    icon: 'cil-star',
    items: [
      {
        component: 'CNavItem',
        name: 'Login',
        to: '/pages/login',
      },
      {
        component: 'CNavItem',
        name: 'Register',
        to: '/pages/register',
      },
      {
        component: 'CNavItem',
        name: 'Error 404',
        to: '/pages/404',
      },
      {
        component: 'CNavItem',
        name: 'Error 500',
        to: '/pages/500',
      },
    ],
  },
]
