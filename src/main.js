import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";

// 全局函数
import functions from './utils/globalFunctions.js';
// 防止重复点击
import preventClick from './utils/clickStatefrom';

// 引入elementUI
import {
  Button,
  Container,
  Aside,
  Main,
  Backtop,
  Col,
  Row,
  Dialog,
  Form,
  FormItem,
  Input,
  Pagination,
  DatePicker,
  Tooltip,
  Message,
  Select,
  Option,
  autocomplete 
} from "element-ui";

//由于Message组件并没有install 方法供Vue来操作的，是直接返回的，因此按照官方文档单独引入的方法是
//会报错的，需要给 Message 添加 install 方法
Message.install = function (Vue) {
  Vue.prototype.$message = Message
}

Vue.use(Message) //消息提示
Vue.use(Button);
Vue.use(Container);
Vue.use(Aside);
Vue.use(Main);
Vue.use(Backtop);
Vue.use(Col);
Vue.use(Row);
Vue.use(Dialog);
Vue.use(Input);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Pagination);
Vue.use(DatePicker);
Vue.use(Tooltip);
Vue.use(Select);
Vue.use(Option);
Vue.use(autocomplete )
Vue.use(functions);
Vue.use(preventClick);

Vue.config.productionTip = false;

Vue.prototype.$axios = axios;

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  const type = to.meta.type
  // 判断该路由是否需要登录权限
  if (type === 'login') {
    if (sessionStorage.getItem("token")) {
      next()
    } else {
      next('/login')
    }
  } else {
    next() // 确保一定要有next()被调用
  }

  let allowBack = false //    给个默认值true
  if (to.meta.allowBack !== undefined) {
    allowBack = to.meta.allowBack
  }
  if (!allowBack) {
    history.pushState(null, null, location.href)
  }
  store.dispatch('updateAppSetting', { //   updateAppSetting 只是store里面的一个action， 用来改变store里的allowBack的值的，具体怎么改这个值 要根据各位的实际情况而定
    allowBack: allowBack
  })
})

// http 请求拦截器
axios.interceptors.request.use(config => {
  // 在发送请求前
  let pathname = location.pathname;
  // console.log(pathname);
  if (sessionStorage.getItem('token')) {
    if (pathname !== '#/' && pathname !== '#/login') {
      config.headers.common['token'] = sessionStorage.getItem('token');
    }
  };

  return config
}, err => {
  return Promise.reject(err);
})

// 响应拦截器
axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 这里写清除token的代码
          sessionStorage.setItem("token", null);
          sessionStorage.setItem("role", null);
          console.log(router.currentRoute.fullPath)
          router.replace({
            path: '/login',
            query: {
              redirect: router.currentRoute.fullPath //登录成功后跳入浏览的当前页面
            }
          })
      }
    }
    return Promise.reject(error.response)
  }
);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");