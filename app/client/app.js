import Vue from 'vue';
import { sync } from 'vuex-router-sync';
import vueResource from 'vue-resource';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-default/index.css';
import * as filters from './filters';
import App from './components/App';

import router from './router';
import store from './store';
sync(store, router);

Vue.use(ElementUI);
Vue.use(vueResource);

Object.keys(filters).forEach((key) => {
  Vue.filter(key, filters[key])
});

const app = new Vue({
  router,
  store,
  ...App
});

export { app, router, store };