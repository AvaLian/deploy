import Vue from 'vue';
import Router from 'vue-router';
import Home from '../views/Home';
import Projects from '../views/Projects';
import Project from '../views/Project';

Vue.use(Router);

const router =  new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      component: Home,
      meta: {
        title: '统一上线平台'
      }
    },
    {
      path: '/projectList',
      component: Projects,
      meta: {
        title: '统一上线平台 - 项目列表'
      }
    },
    {
      path: '/projectList/:id',
      component: Project,
      meta: {
        title: '统一上线平台 - 项目详情'
      }
    }
  ]
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '统一上线平台';
  next();
});

export default router;