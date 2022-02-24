import Vue from "vue";
import VueRouter from "vue-router";
import Login from "@/views/Login";

Vue.use(VueRouter);

const routes = [{
    path: "/",
    name: "Login",
    component: Login,
    hidden: true,
    meta: {
      title: '联通后台管理系统',
      type: '' // 不需要鉴权
    },
    children: [{
      path: '/login',
      component: Login,
    }]
  },
  {
    path: '/home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '联通后台管理系统',
      type: 'login',
      allowBack: false
    }
  },
];

const router = new VueRouter({
  mode: "hash",
  routes
});

export default router;