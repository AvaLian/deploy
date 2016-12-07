import Vue from 'vue';
import Router from 'vue-router';
import Home from '../views/Home';
import Projects from '../views/Projects';
import Project from '../views/Project';

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
    },
    {
      path: '/projectList/:id',
      component: Project
    }
  ]
});