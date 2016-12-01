import Vue from 'vue';
import Router from 'vue-router';
import Home from '../views/Home';
import Projects from '../views/ProjectList';

Vue.use(Router);

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/projectList',
      component: Projects
    }
  ]
});